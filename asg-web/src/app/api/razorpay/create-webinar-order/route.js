import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Razorpay from 'razorpay';
import Webinar from '@/models/Webinar';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    await connectToDatabase();
    
    const { webinarId, registrationData } = await req.json();

    const webinar = await Webinar.findById(webinarId);
    if (!webinar) {
      return NextResponse.json({ error: 'Masterclass not found' }, { status: 404 });
    }

    if (webinar.seatsBooked >= webinar.seatsTotal) {
      return NextResponse.json({ error: 'This masterclass is completely sold out.' }, { status: 400 });
    }

    const amountInPaise = webinar.price * 100;

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `webinar_${Date.now()}`,
      notes: {
        webinarId: webinar._id.toString(),
        userId: decoded.userId,
        name: registrationData.name,
        email: registrationData.email,
        whatsapp: registrationData.whatsapp,
        profession: registrationData.profession
      }
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
      registrationData
    });
    
  } catch (error) {
    console.error("Razorpay Webinar Create Error:", error);
    return NextResponse.json({ error: error.message || 'Payment initiation failed' }, { status: 500 });
  }
}
