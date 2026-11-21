import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SeminarRegistration from '@/models/SeminarRegistration';
import Seminar from '@/models/Seminar';
import { authenticateApi } from '@/lib/auth';
import User from '@/models/User';

export async function POST(req) {
  try {
    const decoded = await authenticateApi(req);
    if (!decoded) {
      return NextResponse.json({ status: 'unverified', error: 'Unauthorized. Please login as admin.' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Check if user is admin
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ status: 'unverified', error: 'Forbidden: Admins only' }, { status: 403 });
    }

    const { ticketNumber } = await req.json();

    if (!ticketNumber) {
      return NextResponse.json({ status: 'unverified', error: 'Ticket number is required' }, { status: 400 });
    }

    const ticket = await SeminarRegistration.findOne({ ticketNumber })
      .populate('seminarId', 'title date time locationAddress');

    // 1. TICKET NOT FOUND -> UNVERIFIED
    if (!ticket) {
      return NextResponse.json({ 
        status: 'unverified', 
        error: 'Unverified: Ticket not found or invalid QR code.' 
      }, { status: 404 });
    }

    // 2. PAYMENT NOT COMPLETED -> UNVERIFIED
    if (ticket.paymentStatus !== 'Paid') {
      return NextResponse.json({ 
        status: 'unverified', 
        error: `Unverified: Payment status is ${ticket.paymentStatus}. Only paid tickets can be admitted.`,
        ticket: {
          ticketNumber: ticket.ticketNumber,
          attendeeName: ticket.registrationData?.name,
          paymentStatus: ticket.paymentStatus
        }
      }, { status: 400 });
    }

    // 3. EVENT DELETED OR NOT FOUND -> EVENT OVER
    // User requirement: "and event over if woh event nhi hoga means delete hoga toh..."
    if (!ticket.seminarId) {
      return NextResponse.json({ 
        status: 'event_over', 
        error: 'Event Over: This seminar event does not exist or has been deleted.',
        ticket: {
          ticketNumber: ticket.ticketNumber,
          attendeeName: ticket.registrationData?.name,
          seminarTitle: 'Deleted Event',
          checkedIn: ticket.checkedIn
        }
      }, { status: 400 });
    }

    // Check if seminar event date has passed
    const seminarDate = new Date(ticket.seminarId.date);
    const endOfDay = new Date(seminarDate);
    endOfDay.setHours(23, 59, 59, 999);
    const isPast = !isNaN(endOfDay.getTime()) && endOfDay.getTime() < Date.now();

    // 4. ALREADY SCANNED / USED -> CANNOT BE SCANNED AGAIN
    // User requirement: "jaise hi ek baar ticket scan hogyi toh woh wapas se scan na ho"
    if (ticket.checkedIn) {
      const formattedDate = ticket.checkedInAt 
        ? new Date(ticket.checkedInAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) 
        : 'Earlier';
      return NextResponse.json({ 
        status: 'already_scanned', 
        error: `This ticket has already been scanned/used on ${formattedDate}. Duplicate entry is strictly prohibited!`,
        ticket: {
          ticketNumber: ticket.ticketNumber,
          attendeeName: ticket.registrationData?.name,
          seminarTitle: ticket.seminarId.title,
          checkedInAt: ticket.checkedInAt
        }
      }, { status: 400 });
    }

    // If event has passed date
    if (isPast) {
      return NextResponse.json({ 
        status: 'event_over', 
        error: `Event Over: This seminar took place on ${seminarDate.toLocaleDateString()} and is now completed.`,
        ticket: {
          ticketNumber: ticket.ticketNumber,
          attendeeName: ticket.registrationData?.name,
          seminarTitle: ticket.seminarId.title,
          seminarDate: ticket.seminarId.date
        }
      }, { status: 400 });
    }

    // 5. FIRST TIME SCAN -> VERIFIED & MARK AS CHECKED IN
    ticket.checkedIn = true;
    ticket.checkedInAt = new Date();
    await ticket.save();

    return NextResponse.json({ 
      status: 'verified', 
      success: true, 
      message: 'Verified: Attendee successfully admitted!',
      ticket: {
        ticketNumber: ticket.ticketNumber,
        attendeeName: ticket.registrationData?.name,
        email: ticket.registrationData?.email,
        whatsapp: ticket.registrationData?.whatsapp,
        profession: ticket.registrationData?.profession,
        seminarTitle: ticket.seminarId.title,
        seminarDate: ticket.seminarId.date,
        seminarTime: ticket.seminarId.time,
        locationAddress: ticket.seminarId.locationAddress,
        checkedInAt: ticket.checkedInAt
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Check-in API Error:', error);
    return NextResponse.json({ status: 'unverified', error: 'Failed to process check-in' }, { status: 500 });
  }
}
