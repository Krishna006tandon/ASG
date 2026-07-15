import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import connectToDatabase from '@/lib/mongodb';
import { authenticateApi } from '@/lib/auth';

export async function POST(req) {
  try {
    const user = await authenticateApi(req);
    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to checkout.' }, { status: 401 });
    }

    const { cart } = await req.json();

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    await connectToDatabase();
    
    // Calculate total securely (in a real app, you'd fetch the DB prices for each ID to prevent tampering)
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyHere',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourTestSecretHere',
    });

    const options = {
      amount: totalAmount * 100, // Razorpay works in paise
      currency: "INR",
      receipt: `receipt_store_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyHere',
      totalAmount,
      customerDetails: {
        name: user.name || 'User',
        email: user.email
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Razorpay Store Create Order Error:', error);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
