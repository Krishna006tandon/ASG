import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Consultation from '@/models/Consultation';
import { sendEmail } from '@/lib/mailer';
import { consultationBookingTemplate, adminNotificationTemplate } from '@/lib/emailTemplates';
import { authenticateApi } from '@/lib/auth';

export async function POST(req) {
  try {
    await connectToDatabase();
    
    const decoded = await authenticateApi(req);
    const body = await req.json();
    const { name, email, phone, date, time, message, requirements, goals, specificQuestions } = body;

    if (!name || !email || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const requirementsText = (requirements || message || '').trim();
    const questionsArray = Array.isArray(specificQuestions)
      ? specificQuestions.map(q => String(q).trim()).filter(Boolean)
      : (specificQuestions ? [String(specificQuestions).trim()] : []);

    const newBooking = await Consultation.create({
      userId: decoded?.userId || null,
      type: 'general',
      customerDetails: { 
        name: name.trim(), 
        email: cleanEmail,
        phone: phone ? String(phone).trim() : ''
      },
      date: new Date(date),
      time,
      message: message || requirementsText || '',
      requirements: {
        text: requirementsText,
        goals: goals ? String(goals).trim() : '',
        specificQuestions: questionsArray,
        updatedAt: new Date()
      },
      status: 'Pending',
      paymentStatus: 'Unpaid'
    });

    // 1. Send Acknowledgement to User
    try {
      await sendEmail({
        to: cleanEmail,
        subject: 'Consultation Booked Successfully | Avinash S. Gore',
        html: consultationBookingTemplate(name, date, time)
      });
    } catch (mailErr) {
      console.error('Failed to send user consultation email:', mailErr);
    }

    // 2. Alert Admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL;
    if (adminEmail) {
      const detailsHtml = `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${cleanEmail}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Session Requirements / Overview:</strong> ${requirementsText || 'N/A'}</p>
        ${goals ? `<p><strong>Key Goals:</strong> ${goals}</p>` : ''}
        ${questionsArray.length > 0 ? `<p><strong>Specific Questions:</strong></p><ul>${questionsArray.map(q => `<li>${q}</li>`).join('')}</ul>` : ''}
      `;
      try {
        await sendEmail({
          to: adminEmail,
          subject: 'New 1-on-1 Consultation Booking & Requirements',
          html: adminNotificationTemplate('New Consultation Booking & Client Requirements', detailsHtml)
        });
      } catch (adminMailErr) {
        console.error('Failed to send admin notification email:', adminMailErr);
      }
    }

    return NextResponse.json({ message: 'Consultation booked successfully', booking: newBooking }, { status: 201 });
  } catch (error) {
    console.error('Booking Error:', error);
    return NextResponse.json({ error: 'Failed to book consultation' }, { status: 500 });
  }
}
