import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Consultation from '@/models/Consultation';
import { sendEmail } from '@/lib/mailer';
import { consultationBookingTemplate, adminNotificationTemplate } from '@/lib/emailTemplates';

export async function POST(req) {
  try {
    await connectToDatabase();
    
    const { name, email, date, time, message } = await req.json();

    if (!name || !email || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newBooking = await Consultation.create({
      customerDetails: { name, email },
      date: new Date(date),
      time,
      message: message || '',
      status: 'Pending',
      paymentStatus: 'Unpaid'
    });

    // 1. Send Acknowledgement to User
    await sendEmail({
      to: email,
      subject: 'Consultation Booked Successfully',
      html: consultationBookingTemplate(name, date, time)
    });

    // 2. Alert Admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL;
    if (adminEmail) {
      const detailsHtml = \`
        <p><strong>Name:</strong> \${name}</p>
        <p><strong>Email:</strong> \${email}</p>
        <p><strong>Date:</strong> \${new Date(date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> \${time}</p>
        <p><strong>Message:</strong> \${message || 'N/A'}</p>
      \`;
      await sendEmail({
        to: adminEmail,
        subject: 'New Consultation Booking',
        html: adminNotificationTemplate('New Consultation Booking', detailsHtml)
      });
    }

    return NextResponse.json({ message: 'Consultation booked successfully', booking: newBooking }, { status: 201 });
  } catch (error) {
    console.error('Booking Error:', error);
    return NextResponse.json({ error: 'Failed to book consultation' }, { status: 500 });
  }
}
