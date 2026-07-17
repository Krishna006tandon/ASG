import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await connectToDatabase();
    
    const email = 'admin@asg.com';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    let user = await User.findOne({ email });

    if (user) {
      user.password = hashedPassword;
      user.role = 'admin';
      await user.save();
      return NextResponse.json({ message: 'Admin account updated successfully. You can now login.' });
    } else {
      await User.create({
        name: 'ASG Admin',
        email,
        password: hashedPassword,
        role: 'admin'
      });
      return NextResponse.json({ message: 'Admin account created successfully. You can now login.' });
    }
  } catch (error) {
    console.error('Setup Admin Error:', error);
    return NextResponse.json({ error: 'Failed to setup admin' }, { status: 500 });
  }
}
