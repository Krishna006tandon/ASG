import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Consultation from '@/models/Consultation';
import { sendEmail } from '@/lib/mailer';
import { consultationConfirmedTemplate } from '@/lib/emailTemplates';

export async function PATCH(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();
    const { status, paymentStatus, charges, meetingLink, followUp, requirements, taskId, taskCompleted } = body;

    const updateFields = {};
    if (status) updateFields.status = status;
    if (charges !== undefined) updateFields.charges = Number(charges);
    if (meetingLink !== undefined) updateFields.meetingLink = meetingLink;
    if (requirements !== undefined) updateFields.requirements = requirements;
    if (followUp !== undefined) updateFields.followUp = followUp;

    if (paymentStatus) {
      updateFields.paymentStatus = paymentStatus;
      if (paymentStatus === 'Paid' && !meetingLink) {
        const existing = await Consultation.findById(id).select('meetingLink');
        if (!existing?.meetingLink) {
          let defaultLink = (process.env.ADMIN_MEETING_LINK || process.env.DEFAULT_MEETING_LINK || "https://us05web.zoom.us/j/3410667455?pwd=ZXJyWUFTZW91N2lyekQ5NDJLVk1DQT09").trim();
          if (defaultLink.includes('zoom.us/s/')) {
            defaultLink = defaultLink.replace('zoom.us/s/', 'zoom.us/j/');
          }
          updateFields.meetingLink = defaultLink;
        }
      }
    }

    let updatedAppointment = await Consultation.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!updatedAppointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Support toggle task from admin
    if (taskId) {
      const task = updatedAppointment.followUp?.actionItems?.find(i => i.id === taskId);
      if (task) {
        task.completed = Boolean(taskCompleted);
        task.completedAt = task.completed ? new Date() : null;
        const total = updatedAppointment.followUp.actionItems.length;
        const done = updatedAppointment.followUp.actionItems.filter(i => i.completed).length;
        updatedAppointment.followUp.status = (total > 0 && done === total) ? 'completed' : 'in_progress';
        updatedAppointment.followUp.updatedAt = new Date();
        await updatedAppointment.save();
      }
    }

    // Send email notification to client if session is Confirmed and charges are set
    if (
      updatedAppointment.customerDetails?.email &&
      updatedAppointment.paymentStatus !== 'Paid' &&
      updatedAppointment.charges > 0 &&
      (status === 'Confirmed' || charges !== undefined)
    ) {
      const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://avinashsgore.com').replace(/\/+$/, '');
      const tabParam = updatedAppointment.type === 'startup' ? 'startup' : 'consultations';
      const dashboardUrl = `${siteUrl}/dashboard?tab=${tabParam}`;

      sendEmail({
        to: updatedAppointment.customerDetails.email,
        subject: 'Consultation Confirmed & Session Fee Details | Avinash S. Gore Platform',
        html: consultationConfirmedTemplate(
          updatedAppointment.customerDetails.name || 'Valued Client',
          updatedAppointment.date,
          updatedAppointment.time,
          updatedAppointment.charges,
          dashboardUrl
        )
      }).catch(err => console.error('Failed to send consultation confirmation email:', err));
    }

    return NextResponse.json(updatedAppointment, { status: 200 });
  } catch (error) {
    console.error('Admin PATCH appointment error:', error);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const deletedAppt = await Consultation.findByIdAndDelete(id);

    if (!deletedAppt) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Appointment deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
  }
}
