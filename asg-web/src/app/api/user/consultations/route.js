import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Consultation from '@/models/Consultation';
import User from '@/models/User';
import { authenticateApi } from '@/lib/auth';

export async function GET(req) {
  try {
    const decoded = authenticateApi(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized or Invalid token' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Find the user to get their email
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find all consultations matching this user's email
    const consultations = await Consultation.find({ 
      'customerDetails.email': user.email 
    }).sort({ date: -1 }).lean();

    return NextResponse.json(consultations, { status: 200 });
  } catch (error) {
    console.error('User Consultations Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch your consultations' }, { status: 500 });
  }
}
