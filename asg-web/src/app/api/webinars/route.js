import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Webinar from '@/models/Webinar';

export async function GET(req) {
  try {
    await connectToDatabase();
    // Sort by date ascending (upcoming first)
    // Add logic here if you want to only show future webinars
    const webinars = await Webinar.find({}).sort({ date: 1 }).lean();
    return NextResponse.json(webinars, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch webinars' }, { status: 500 });
  }
}
