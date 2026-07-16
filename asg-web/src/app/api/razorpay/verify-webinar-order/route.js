import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '@/lib/mongodb';
import WebinarRegistration from '@/models/WebinarRegistration';
import Webinar from '@/models/Webinar';

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

    return NextResponse.json({ success: true, registration }, { status: 200 });

  } catch (error) {
    console.error("Razorpay Webinar Verify Error:", error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
