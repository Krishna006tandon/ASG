import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SeminarRegistration from '@/models/SeminarRegistration';
import Seminar from '@/models/Seminar';

export async function GET(req) {
  try {
    await connectToDatabase();
    const registrations = await SeminarRegistration.find({})
      .populate('seminarId', 'title date time locationAddress')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(registrations, { status: 200 });
  } catch (error) {
    console.error('Fetch Seminar Registrations Error:', error);
    return NextResponse.json({ error: 'Failed to fetch seminar registrations' }, { status: 500 });
  }
}
