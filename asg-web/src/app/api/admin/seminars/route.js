import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Seminar from '@/models/Seminar';

export async function GET(req) {
  try {
    await connectToDatabase();
    const seminars = await Seminar.find({}).sort({ date: 1 }).lean();
    return NextResponse.json(seminars, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch seminars' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const { title, description, date, time, locationAddress, originalPrice, price, seatsTotal } = await req.json();

    if (!title || !date || !time || !locationAddress || !price || !seatsTotal) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newSeminar = await Seminar.create({
      title,
      description,
      date: new Date(date),
      time,
      locationAddress,
      originalPrice: Number(originalPrice || 0),
      price: Number(price),
      seatsTotal: Number(seatsTotal),
    });

    return NextResponse.json(newSeminar, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create seminar' }, { status: 500 });
  }
}
