import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import WebinarRegistration from '@/models/WebinarRegistration';
import Webinar from '@/models/Webinar';

export async function GET(req) {
  try {
    await connectToDatabase();
    const registrations = await WebinarRegistration.find({})
      .populate('webinarId', 'title date time')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(registrations, { status: 200 });
  } catch (error) {
    console.error('Fetch Webinar Registrations Error:', error);
    return NextResponse.json({ error: 'Failed to fetch webinar registrations' }, { status: 500 });
  }
}
