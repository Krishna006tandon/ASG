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
      return NextResponse.json({ error: 'Ticket not found or invalid' }, { status: 404 });
    }

    // Check if the person viewing this page is an Admin
    let isAdmin = false;
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      // Create a mock request object for authenticateApi
      const mockReq = { headers: { get: () => authHeader } };
      const decoded = await authenticateApi(mockReq);
      if (decoded) {
        const user = await User.findById(decoded.userId);
        if (user && user.role === 'admin') {
          isAdmin = true;
        }
      }
    }

    return NextResponse.json({ success: true, ticket, isAdmin }, { status: 200 });
  } catch (error) {
    console.error('Ticket Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
  }
}
