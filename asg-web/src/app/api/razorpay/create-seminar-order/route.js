import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Razorpay from 'razorpay';
import Seminar from '@/models/Seminar';
import { authenticateApi } from '@/lib/auth';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    const decoded = await authenticateApi(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }
    
    await connectToDatabase();
    
    const { seminarId, quantity = 1, attendees } = await req.json();

    const seminar = await Seminar.findById(seminarId);
    if (!seminar) {
      return NextResponse.json({ error: 'Seminar not found' }, { status: 404 });
    }

    // Capacity Check
    const booked = seminar.seatsBooked || 0;
    const remaining = seminar.seatsTotal - booked;
    if (quantity > remaining) {
      return NextResponse.json({ error: 'Not enough seats available' }, { status: 400 });
    }

    const options = {
      amount: seminar.price * quantity * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: `seminar_rcpt_${Date.now()}`,
      notes: {
        seminarId: seminar._id.toString(),
        userId: decoded.userId,
        attendees: JSON.stringify(attendees)
      }
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
      attendees
    });
    
  } catch (error) {
    console.error("Razorpay Seminar Create Error:", error);
    return NextResponse.json({ error: error.message || 'Payment initiation failed' }, { status: 500 });
  }
}
