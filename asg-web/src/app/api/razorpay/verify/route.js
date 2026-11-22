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
    
    // Check if appointment already has a custom meeting link set by admin
    const existingAppt = await Consultation.findById(appointmentId);
    let assignedLink = existingAppt?.meetingLink;

    if (!assignedLink) {
      // Use configured Admin Meeting Link (Google Meet or Zoom)
      assignedLink = (process.env.ADMIN_MEETING_LINK || process.env.DEFAULT_MEETING_LINK || "https://us05web.zoom.us/j/3410667455?pwd=ZXJyWUFTZW91N2lyekQ5NDJLVk1DQT09").trim();
    }

    // Ensure link saved for customer is always a participant join link (never host start link)
    if (assignedLink.includes('zoom.us/s/')) {
      assignedLink = assignedLink.replace('zoom.us/s/', 'zoom.us/j/');
    }

    await Consultation.findByIdAndUpdate(appointmentId, { 
      paymentStatus: 'Paid',
      meetingLink: assignedLink
    });

    return NextResponse.json({ message: 'Payment verified successfully', meetingLink: assignedLink }, { status: 200 });

  } catch (error) {
    console.error('Razorpay Verify Error:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
