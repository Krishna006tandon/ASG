import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/auth';
import { sendEmail } from '@/lib/mailer';
import { welcomeUserTemplate, adminNotificationTemplate } from '@/lib/emailTemplates';

export async function POST(req) {
  try {
    await connectToDatabase();
    
    const { name, email, password } = await req.json();
    
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = signToken({ userId: newUser._id, role: newUser.role });

    // 1. Send Welcome Email to the User
    try {
      await sendEmail({
        to: newUser.email,
        subject: `Welcome to Avinash S. Gore Platform, ${newUser.name}! 🎉`,
        html: welcomeUserTemplate(newUser.name)
      });
    } catch (mailErr) {
      console.error('Failed to send welcome email to user:', mailErr);
    }

    // 2. Alert Admin about New User Registration
    const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL;
    if (adminEmail) {
      const detailsHtml = `
        <p><strong>Name:</strong> ${newUser.name}</p>
        <p><strong>Email:</strong> ${newUser.email}</p>
        <p><strong>Registered At:</strong> ${new Date().toLocaleString()}</p>
      `;
      try {
        await sendEmail({
          to: adminEmail,
          subject: `👤 New User Registered: ${newUser.name}`,
          html: adminNotificationTemplate('New User Registration', detailsHtml)
        });
      } catch (mailErr) {
        console.error('Failed to send registration admin email:', mailErr);
      }
    }

    return NextResponse.json({ 
      message: 'User created successfully', 
      token, 
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role } 
    }, { status: 201 });

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
