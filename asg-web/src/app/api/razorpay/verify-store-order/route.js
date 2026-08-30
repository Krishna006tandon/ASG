import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import { sendEmail } from '@/lib/mailer';
import { orderConfirmationTemplate, adminNotificationTemplate } from '@/lib/emailTemplates';

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
        quantity: item.quantity,
        isPhysicalRequested: item.isPhysicalRequested || false,
        shippingAddress: item.isPhysicalRequested ? (customerDetails.address || '') : '',
        physicalStatus: item.isPhysicalRequested ? 'Pending Dispatch' : 'Not Requested'
      })),
      totalAmount,
      customerDetails,
      status: 'Paid'
    });

    // 1. Send Order Confirmation Email to User
    if (customerDetails && customerDetails.email) {
      await sendEmail({
        to: customerDetails.email,
        subject: 'Order Confirmed - ASG Store',
        html: orderConfirmationTemplate(customerDetails.name || 'Customer', totalAmount, newOrder._id)
      });
    }

    // 2. Alert Admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL;
    if (adminEmail) {
      const detailsHtml = \`
        <p><strong>Order ID:</strong> \${newOrder._id}</p>
        <p><strong>Customer Name:</strong> \${customerDetails.name || 'N/A'}</p>
        <p><strong>Customer Email:</strong> \${customerDetails.email || 'N/A'}</p>
        <p><strong>Total Amount:</strong> ₹\${totalAmount}</p>
        <p><strong>Items:</strong> \${cart.map(i => i.title + ' (x' + i.quantity + ')').join(', ')}</p>
      \`;
      await sendEmail({
        to: adminEmail,
        subject: 'New Store Order Received',
        html: adminNotificationTemplate('New Store Order', detailsHtml)
      });
    }

    return NextResponse.json({ message: 'Store Payment verified and order created', orderId: newOrder._id }, { status: 200 });

  } catch (error) {
    console.error('Store Razorpay Verify Error:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
