import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';

export async function POST(req) {
  try {
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature, 
      cart,
      totalAmount,
      customerDetails
    } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET || 'YourTestSecretHere';
    
    // Verify Signature
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    await connectToDatabase();
    
    // Create the Order in MongoDB
    const newOrder = await Order.create({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      items: cart.map(item => ({
        bookId: item._id,
        title: item.title,
        price: item.price,
        quantity: item.quantity
      })),
      totalAmount,
      customerDetails,
      status: 'Paid'
    });

    return NextResponse.json({ message: 'Store Payment verified and order created', orderId: newOrder._id }, { status: 200 });

  } catch (error) {
    console.error('Store Razorpay Verify Error:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
