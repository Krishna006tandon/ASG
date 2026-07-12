import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order'; // We will create this model next

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

export async function POST(req) {
  try {
    await connectToDatabase();
    
    const { amount, cartItems, customerDetails } = await req.json();
    
    // Amount is passed in whole rupees, convert to paise for Razorpay
    const options = {
      amount: amount * 100, 
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Store pending order in MongoDB
    const newOrder = await Order.create({
      razorpayOrderId: order.id,
      items: cartItems,
      customerDetails,
      totalAmount: amount,
      status: 'Pending',
    });

    return NextResponse.json({ order, newOrder }, { status: 201 });
  } catch (error) {
    console.error('Razorpay Error:', error);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
