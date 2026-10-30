import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import connectToDatabase from '@/lib/mongodb';
import CareerSetting from '@/models/CareerSetting';
import CareerAssessment from '@/models/CareerAssessment';
import { authenticateApi } from '@/lib/auth';

export async function POST(req) {
  try {
    const { candidateDetails } = await req.json();

    if (!candidateDetails || !candidateDetails.name || !candidateDetails.email || !candidateDetails.phone) {
      return NextResponse.json({ error: 'Name, email, and phone number are required.' }, { status: 400 });
    }

    const decoded = authenticateApi(req);
    const userId = decoded?.userId || null;

    await connectToDatabase();

    // Fetch dynamic price
    let setting = await CareerSetting.findOne();
    const price = setting?.price || 299;

    // Create a new pending assessment in DB
    const assessment = await CareerAssessment.create({
      userId,
      candidateDetails: {
        name: candidateDetails.name.trim(),
        email: candidateDetails.email.trim().toLowerCase(),
        phone: candidateDetails.phone.trim(),
        education: candidateDetails.education || '',
        currentStatus: candidateDetails.currentStatus || 'College Student'
      },
      amountPaid: price,
      paymentStatus: 'Pending',
      testStatus: 'Pending'
    });

    const razorpayKeyId = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').trim();
    const razorpayKeySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Razorpay keys not configured in environment variables');
      return NextResponse.json({ error: 'Payment gateway is temporarily unavailable: missing credentials.' }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const options = {
      amount: price * 100, // paise
      currency: 'INR',
      receipt: `career_${Date.now()}`,
      notes: {
        assessmentId: assessment._id.toString(),
        candidateName: candidateDetails.name,
        candidateEmail: candidateDetails.email
      }
    };

    const order = await razorpay.orders.create(options);

    assessment.razorpayOrderId = order.id;
    await assessment.save();

    console.log(`[Razorpay Career Order] Created order ${order.id} for assessment ${assessment._id} using key ${razorpayKeyId.slice(0, 8)}...`);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: razorpayKeyId,
      assessmentId: assessment._id
    }, { status: 200 });

  } catch (error) {
    console.error('Razorpay Create Career Order Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create payment order' }, { status: 500 });
  }
}
