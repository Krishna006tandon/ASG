import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Consultation from '@/models/Consultation';

export async function GET(req) {
  try {
    await connectToDatabase();
    const appointments = await Consultation.find({}).sort({ date: 1, time: 1 }).lean();
    return NextResponse.json(appointments, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}
