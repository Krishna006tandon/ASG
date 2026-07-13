import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '@/lib/mongodb';
import Consultation from '@/models/Consultation';

export async function POST(req) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET || 'YourTestSecretHere';

    // Verify signature
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // Payment verified successfully.
    await connectToDatabase();
    
    // Instead of using the complex Server-to-Server Zoom API,
    // we use the Admin's static Personal Meeting ID (PMI) link.
    const pmiLink = "https://us05web.zoom.us/j/3410667455?pwd=ZXJyWUFTZW91N2lyekQ5NDJLVk1DQT09";

    await Consultation.findByIdAndUpdate(appointmentId, { 
      paymentStatus: 'Paid',
      meetingLink: pmiLink
    });

    return NextResponse.json({ message: 'Payment verified successfully', meetingLink: pmiLink }, { status: 200 });

  } catch (error) {
    console.error('Razorpay Verify Error:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
