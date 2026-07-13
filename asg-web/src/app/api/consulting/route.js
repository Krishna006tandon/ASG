import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Consultation from '@/models/Consultation';

export async function POST(req) {
  try {
    await connectToDatabase();
    
    const { name, email, date, time, message } = await req.json();

    if (!name || !email || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newBooking = await Consultation.create({
      customerDetails: { name, email },
      date: new Date(date),
      time,
      message: message || '',
      status: 'Pending',
      paymentStatus: 'Unpaid'
    });

    return NextResponse.json({ message: 'Consultation booked successfully', booking: newBooking }, { status: 201 });
  } catch (error) {
    console.error('Booking Error:', error);
    return NextResponse.json({ error: 'Failed to book consultation' }, { status: 500 });
  }
}
