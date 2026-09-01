import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import { sendEmail } from '@/lib/mailer';
import { physicalUpgradeTemplate, adminNotificationTemplate } from '@/lib/emailTemplates';

export async function POST(req) {
  try {
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature, 
      orderId,
      bookId,
      shippingAddress
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
    
    // Find and update the specific item in the Order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const itemIndex = order.items.findIndex(item => item.bookId.toString() === bookId);
    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item not found in order' }, { status: 404 });
    }

    order.items[itemIndex].isPhysicalRequested = true;
    order.items[itemIndex].physicalUpgradeOrderId = razorpay_order_id;
    order.items[itemIndex].shippingAddress = shippingAddress;
    order.items[itemIndex].physicalStatus = 'Pending Dispatch';
    
    await order.save();

    const bookTitle = order.items[itemIndex].title || 'Book';
    const customerEmail = order.customerDetails?.email;
    const customerName = order.customerDetails?.name || 'Customer';

    // 1. Send Confirmation Email to User
    if (customerEmail) {
      await sendEmail({
        to: customerEmail,
        subject: `Physical Upgrade Confirmed for ${bookTitle}`,
        html: physicalUpgradeTemplate(customerName, bookTitle)
      });
    }

    // 2. Alert Admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL;
    if (adminEmail) {
      const detailsHtml = `
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Book Upgraded:</strong> ${bookTitle}</p>
        <p><strong>Customer Name:</strong> ${customerName}</p>
        <p><strong>Customer Email:</strong> ${customerEmail || 'N/A'}</p>
        <p><strong>Shipping Address:</strong> ${shippingAddress}</p>
      `;
      await sendEmail({
        to: adminEmail,
        subject: 'New Physical Upgrade Request',
        html: adminNotificationTemplate('New Physical Upgrade Request', detailsHtml)
      });
    }

    return NextResponse.json({ message: 'Physical upgrade confirmed successfully' }, { status: 200 });

  } catch (error) {
    console.error('Store Razorpay Upgrade Verify Error:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
