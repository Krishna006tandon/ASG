import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SeminarRegistration from '@/models/SeminarRegistration';
import { authenticateApi } from '@/lib/auth';
import User from '@/models/User';

export async function POST(req) {
  try {
    const decoded = await authenticateApi(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Check if user is admin
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }

    const { ticketNumber } = await req.json();

    const ticket = await SeminarRegistration.findOne({ ticketNumber });
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (ticket.checkedIn) {
      return NextResponse.json({ error: 'Ticket has already been scanned/used.' }, { status: 400 });
    }

    ticket.checkedIn = true;
    ticket.checkedInAt = new Date();
    await ticket.save();

    return NextResponse.json({ success: true, message: 'Attendee successfully admitted!' }, { status: 200 });

  } catch (error) {
    console.error('Check-in API Error:', error);
    return NextResponse.json({ error: 'Failed to process check-in' }, { status: 500 });
  }
}
