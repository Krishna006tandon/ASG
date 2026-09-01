import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '@/lib/mongodb';
import WebinarRegistration from '@/models/WebinarRegistration';
import Webinar from '@/models/Webinar';
import { sendEmail } from '@/lib/mailer';
import { webinarRegistrationTemplate, adminNotificationTemplate } from '@/lib/emailTemplates';

export async function POST(req) {
  try {
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      webinarId,
      userId,
      registrationData,
      amount
    } = await req.json();

    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    await connectToDatabase();

    // Create Webinar Registration
    const registration = await WebinarRegistration.create({
      userId,
      webinarId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentStatus: 'Paid',
      registrationData,
      amountPaid: amount / 100 // Convert back to rupees
    });

    // Increment seatsBooked in Webinar
    await Webinar.findByIdAndUpdate(webinarId, { $inc: { seatsBooked: 1 } });

    // 1. Send Webinar Registration Email
    if (registrationData && registrationData.email) {
      await sendEmail({
        to: registrationData.email,
        subject: 'Webinar Registration Confirmed',
        html: webinarRegistrationTemplate(registrationData.name || 'User')
      });
    }

    // 2. Alert Admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL;
    if (adminEmail) {
      const detailsHtml = `
        <p><strong>Webinar ID:</strong> ${webinarId}</p>
        <p><strong>Attendee Name:</strong> ${registrationData.name}</p>
        <p><strong>Attendee Email:</strong> ${registrationData.email}</p>
        <p><strong>Amount Paid:</strong> ₹${amount / 100}</p>
      `;
      await sendEmail({
        to: adminEmail,
        subject: 'New Webinar Registration',
        html: adminNotificationTemplate('New Webinar Registration', detailsHtml)
      });
    }

    return NextResponse.json({ success: true, registration }, { status: 200 });

  } catch (error) {
    console.error("Razorpay Webinar Verify Error:", error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
