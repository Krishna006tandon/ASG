import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import EmailOtp from '@/models/EmailOtp';
import { sendEmail } from '@/lib/mailer';
import { otpVerificationTemplate } from '@/lib/emailTemplates';

const PURPOSE_LABELS = {
  consultation: '1-on-1 Consultation Booking',
  product_purchase: 'Product Purchase / Book Order',
  booking: 'Session / Event Registration',
  general: 'Verification'
};

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, purpose = 'booking', name = '' } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email address is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    await connectToDatabase();

    // Check rate limit: if an unverified OTP was generated less than 25 seconds ago
    const recentOtp = await EmailOtp.findOne({
      email: cleanEmail,
      createdAt: { $gte: new Date(Date.now() - 25 * 1000) }
    });

    if (recentOtp) {
      return NextResponse.json({
        error: 'Please wait a few seconds before requesting another verification code.'
      }, { status: 429 });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any old unverified OTPs for this email & purpose
    await EmailOtp.deleteMany({ email: cleanEmail, verified: false });

    // Create new OTP record
    await EmailOtp.create({
      email: cleanEmail,
      otp,
      purpose,
      verified: false,
      attempts: 0,
      expiresAt
    });

    const purposeLabel = PURPOSE_LABELS[purpose] || 'Booking / Purchase Verification';

    // Send email
    const mailResult = await sendEmail({
      to: cleanEmail,
      subject: `${otp} is your verification code | Avinash S. Gore Platform`,
      html: otpVerificationTemplate(otp, purposeLabel, name)
    });

    if (!mailResult.success) {
      console.error('Failed to send OTP email:', mailResult.error);
      return NextResponse.json({
        error: 'Could not send verification email. Please check your email address or try again.'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}.`
    }, { status: 200 });

  } catch (error) {
    console.error('OTP Send Error:', error);
    return NextResponse.json({ error: 'Failed to send verification code. Please try again.' }, { status: 500 });
  }
}
