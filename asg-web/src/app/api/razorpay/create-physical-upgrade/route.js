import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Book from '@/models/Book';
import { authenticateApi } from '@/lib/auth';

export async function POST(req) {
  try {
    const user = await authenticateApi(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, bookId } = await req.json();

    if (!orderId || !bookId) {
      return NextResponse.json({ error: 'Missing order ID or book ID' }, { status: 400 });
    }

    await connectToDatabase();
    
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify user owns this order
    if (order.customerDetails.email !== user.email) {
      return NextResponse.json({ error: 'Unauthorized order access' }, { status: 403 });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const upgradeAmount = (book.physicalPrice || 0) + (book.shippingCost || 0);

    if (upgradeAmount <= 0) {
      return NextResponse.json({ error: 'Physical upgrade not available or free (contact admin)' }, { status: 400 });
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyHere',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourTestSecretHere',
    });

    const options = {
      amount: upgradeAmount * 100, // Razorpay works in paise
      currency: "INR",
      receipt: `receipt_upgrade_${Date.now()}`,
    };

    const rzpOrder = await razorpay.orders.create(options);
    
    return NextResponse.json({
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyHere',
      upgradeAmount,
      customerDetails: order.customerDetails
    }, { status: 200 });

  } catch (error) {
    console.error('Razorpay Physical Upgrade Create Error:', error);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
