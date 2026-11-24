import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import EmailOtp from '@/models/EmailOtp';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, otp, purpose } = body;

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      return NextResponse.json({ error: 'Please enter a valid 6-digit verification code.' }, { status: 400 });
    }

    await connectToDatabase();

    // Look for active unexpired OTP record
    const record = await EmailOtp.findOne({
      email: cleanEmail,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!record) {
      return NextResponse.json({
        error: 'Verification code has expired or was not requested. Please request a new code.'
      }, { status: 400 });
    }

    if (record.attempts >= 5) {
      await EmailOtp.deleteOne({ _id: record._id });
      return NextResponse.json({
        error: 'Too many incorrect attempts. Please request a new verification code.'
      }, { status: 400 });
    }

    if (record.otp !== cleanOtp) {
      record.attempts += 1;
      await record.save();
      const remaining = 5 - record.attempts;
      return NextResponse.json({
        error: `Incorrect verification code. ${remaining > 0 ? `${remaining} attempts remaining.` : 'Please request a new code.'}`
      }, { status: 400 });
    }

    // OTP Matches!
    record.verified = true;
    record.verifiedAt = new Date();
    await record.save();

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Email address verified successfully!'
    }, { status: 200 });

  } catch (error) {
    console.error('OTP Verify Error:', error);
    return NextResponse.json({ error: 'Failed to verify OTP. Please try again.' }, { status: 500 });
  }
}
