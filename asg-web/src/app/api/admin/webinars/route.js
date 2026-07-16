import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Webinar from '@/models/Webinar';

export async function GET(req) {
  try {
    await connectToDatabase();
    // Sort by date ascending (upcoming first)
    const webinars = await Webinar.find({}).sort({ date: 1 }).lean();
    return NextResponse.json(webinars, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch webinars' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const { title, description, date, time, originalPrice, price, seatsTotal, meetingLink } = await req.json();

    if (!title || !date || !time || !price || !seatsTotal) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newWebinar = await Webinar.create({
      title,
      description,
      date: new Date(date),
      time,
      originalPrice: Number(originalPrice || 0),
      price: Number(price),
      seatsTotal: Number(seatsTotal),
      meetingLink: meetingLink || '',
    });

    return NextResponse.json(newWebinar, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create webinar' }, { status: 500 });
  }
}
