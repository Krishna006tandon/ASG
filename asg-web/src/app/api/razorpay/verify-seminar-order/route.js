import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '@/lib/mongodb';
import SeminarRegistration from '@/models/SeminarRegistration';
import Seminar from '@/models/Seminar';
import { sendEmail } from '@/lib/mailer';
import { seminarTicketTemplate, adminNotificationTemplate } from '@/lib/emailTemplates';

export async function POST(req) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, seminarId, userId, attendees, quantity = 1, amount } = await req.json();

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    await connectToDatabase();

    // Verify Seminar Capacity
    const seminar = await Seminar.findById(seminarId);
    if (!seminar) {
      return NextResponse.json({ error: "Seminar not found" }, { status: 404 });
    }

    if (seminar.seatsBooked + quantity > seminar.seatsTotal) {
      // Refund process should be initiated here ideally
      return NextResponse.json({ error: "Not enough seats remaining. Please contact support for a refund." }, { status: 400 });
    }

    // Loop and generate tickets
    const registrations = [];
    for (const attendee of attendees) {
      // Generate a VIP Ticket Number
      const randomPart = Math.floor(100000 + Math.random() * 900000);
      const ticketNumber = `SEM-${randomPart}`;

      const reg = new SeminarRegistration({
        userId,
        seminarId,
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpaySignature: razorpay_signature,
        amountPaid: seminar.price, // the per-ticket price
        paymentStatus: 'Paid',
        ticketNumber: ticketNumber,
        registrationData: {
          name: attendee.name,
          email: attendee.email,
          whatsapp: attendee.whatsapp,
          profession: attendee.profession
        }
      });
      
      await reg.save();
      registrations.push(reg);

      // Send Ticket Email
      if (attendee.email) {
        await sendEmail({
          to: attendee.email,
          subject: `Your Ticket for ${seminar.title || 'Seminar'}`,
          html: seminarTicketTemplate(attendee.name, ticketNumber)
        });
      }
    }

    // Increase total seats booked
    seminar.seatsBooked += quantity;
    await seminar.save();

    // Alert Admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL;
    if (adminEmail) {
      const detailsHtml = `
        <p><strong>Seminar:</strong> ${seminar.title || 'Seminar'}</p>
        <p><strong>Tickets Sold:</strong> ${quantity}</p>
        <p><strong>Attendees:</strong> ${attendees.map(a => a.name + ' (' + a.email + ')').join(', ')}</p>
      `;
      await sendEmail({
        to: adminEmail,
        subject: 'New Seminar Registration',
        html: adminNotificationTemplate('New Seminar Registration', detailsHtml)
      });
    }

    return NextResponse.json({ success: true, ticketsCreated: registrations.length }, { status: 200 });

  } catch (error) {
    console.error("Razorpay Seminar Verify Error:", error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
