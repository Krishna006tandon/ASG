import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SeminarRegistration from '@/models/SeminarRegistration';
import Seminar from '@/models/Seminar';
import User from '@/models/User';
import { authenticateApi } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    const { ticketNumber } = await params;
    await connectToDatabase();

    const ticket = await SeminarRegistration.findOne({ ticketNumber })
      .populate('seminarId', 'title date time locationAddress')
      .lean();

    if (!ticket) {
      return NextResponse.json({ 
        success: false,
        status: 'unverified',
        error: 'Ticket not found or invalid QR code' 
      }, { status: 404 });
    }

    // Determine status
    let status = 'verified';
    let statusReason = 'Ticket is valid and ready for entry';

    if (ticket.paymentStatus !== 'Paid') {
      status = 'unverified';
      statusReason = 'Payment not completed or failed';
    } else if (!ticket.seminarId) {
      status = 'event_over';
      statusReason = 'Event has been deleted or no longer exists';
    } else if (ticket.checkedIn) {
      status = 'already_scanned';
      const formattedDate = ticket.checkedInAt 
        ? new Date(ticket.checkedInAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) 
        : 'Earlier';
      statusReason = `Ticket has already been scanned/used on ${formattedDate}`;
    } else {
      const seminarDate = new Date(ticket.seminarId.date);
      const endOfDay = new Date(seminarDate);
      endOfDay.setHours(23, 59, 59, 999);
      if (!isNaN(endOfDay.getTime()) && endOfDay.getTime() < Date.now()) {
        status = 'event_over';
        statusReason = `This seminar took place on ${seminarDate.toLocaleDateString()} and is now completed`;
      }
    }

    // Check if the person viewing this page is an Admin
    let isAdmin = false;
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const mockReq = { headers: { get: () => authHeader } };
      const decoded = await authenticateApi(mockReq);
      if (decoded) {
        const user = await User.findById(decoded.userId);
        if (user && user.role === 'admin') {
          isAdmin = true;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      status, 
      statusReason, 
      ticket, 
      isAdmin 
    }, { status: 200 });
  } catch (error) {
    console.error('Ticket Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
  }
}
