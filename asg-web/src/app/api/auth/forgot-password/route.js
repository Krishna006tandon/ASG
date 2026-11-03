import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { sendEmail } from '@/lib/mailer';
import { forgotPasswordTemplate } from '@/lib/emailTemplates';

export async function POST(req) {
  try {
    await connectToDatabase();
    
    const { email } = await req.json();
    
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const escapedEmail = cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Case-insensitive user lookup
    const user = await User.findOne({
      $or: [
        { email: cleanEmail },
        { email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') } }
      ]
    });

    if (!user) {
      // Don't leak whether user exists for security
      return NextResponse.json({ message: 'If that email is registered, a password reset link has been sent.' }, { status: 200 });
    }

    const resetToken = uuidv4();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Construct the reset URL using configured site URL
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const resetUrl = `${siteUrl}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request | Avinash S. Gore Platform',
      html: forgotPasswordTemplate(resetUrl)
    });

    return NextResponse.json({ message: 'If that email is registered, a password reset link has been sent.' }, { status: 200 });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
