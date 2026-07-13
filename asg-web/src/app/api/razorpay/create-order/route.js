import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import connectToDatabase from '@/lib/mongodb';
import Consultation from '@/models/Consultation';

export async function POST(req) {
  try {
    const { appointmentId } = await req.json();

    if (!appointmentId) {
      return NextResponse.json({ error: 'Missing appointment ID' }, { status: 400 });
    }

    await connectToDatabase();
    const appointment = await Consultation.findById(appointmentId);

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    if (!appointment.charges) {
      return NextResponse.json({ error: 'Charges not set for this appointment' }, { status: 400 });
    }

    // Initialize Razorpay
    // Note: Provide fallback test keys so the app doesn't crash if env vars are missing
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyHere',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourTestSecretHere',
    });

    const options = {
      amount: appointment.charges * 100, // Razorpay works in paise (multiply by 100)
      currency: "INR",
      receipt: `receipt_${appointmentId}`,
    };

    const order = await razorpay.orders.create(options);
    
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyHere'
    }, { status: 200 });

  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
