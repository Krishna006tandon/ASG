import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '@/lib/mongodb';
import CareerAssessment from '@/models/CareerAssessment';
import { sendEmail } from '@/lib/mailer';
import { careerAssessmentAccessTemplate, adminNotificationTemplate } from '@/lib/emailTemplates';

export async function POST(req) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, assessmentId } = await req.json();

    if (!assessmentId) {
      return NextResponse.json({ error: 'Missing assessment ID' }, { status: 400 });
    }

    const secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

    if (!secret) {
      console.error('[Verify Signature Error] RAZORPAY_KEY_SECRET is not configured');
      return NextResponse.json({ error: 'Razorpay secret key configuration error.' }, { status: 500 });
    }

    // Verify signature
    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      console.error('[Verify Signature Error] Signature mismatch:', {
        expected: generated_signature,
        received: razorpay_signature,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id
      });
      return NextResponse.json({ error: 'Payment signature verification failed' }, { status: 400 });
    }

    await connectToDatabase();

    const assessment = await CareerAssessment.findByIdAndUpdate(
      assessmentId,
      {
        paymentStatus: 'Paid',
        testStatus: 'InProgress',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature
      },
      { new: true }
    );

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment record not found' }, { status: 404 });
    }

    // 1. Send Assessment Access Link Email to Candidate
    const candidateEmail = assessment.candidateDetails?.email;
    const candidateName = assessment.candidateDetails?.name || 'Candidate';
    if (candidateEmail) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://avinashsgore.com';
      const startUrl = `${siteUrl}/career-guidance?resume=${assessment._id}`;
      try {
        await sendEmail({
          to: candidateEmail,
          subject: 'Your Career Nature Assessment is Ready | Avinash S. Gore',
          html: careerAssessmentAccessTemplate(candidateName, startUrl)
        });
      } catch (userMailErr) {
        console.error('Failed to send career test access email to user:', userMailErr);
      }
    }

    // 2. Alert Admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL;
    if (adminEmail) {
      const detailsHtml = `
        <p><strong>Candidate Name:</strong> ${assessment.candidateDetails?.name || 'N/A'}</p>
        <p><strong>Email:</strong> ${assessment.candidateDetails?.email || 'N/A'}</p>
        <p><strong>Phone:</strong> ${assessment.candidateDetails?.phone || 'N/A'}</p>
        <p><strong>Class / Stream:</strong> ${assessment.candidateDetails?.classStream || 'N/A'}</p>
        <p><strong>Amount Paid:</strong> ₹${assessment.amountPaid || 299}</p>
        <p><strong>Order ID:</strong> ${razorpay_order_id}</p>
      `;
      try {
        await sendEmail({
          to: adminEmail,
          subject: `🎯 New Career Assessment Purchased: ${assessment.candidateDetails?.name || 'Candidate'}`,
          html: adminNotificationTemplate('New Career Assessment Purchase', detailsHtml)
        });
      } catch (mailErr) {
        console.error('Failed to send career purchase admin email:', mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully! You may now begin the assessment.',
      assessmentId: assessment._id
    }, { status: 200 });

  } catch (error) {
    console.error('Razorpay Verify Career Order Error:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
