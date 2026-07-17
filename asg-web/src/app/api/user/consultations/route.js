import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Consultation from '@/models/Consultation';
import User from '@/models/User';
import Order from '@/models/Order';
import WebinarRegistration from '@/models/WebinarRegistration';
import Webinar from '@/models/Webinar';
import SeminarRegistration from '@/models/SeminarRegistration';
import Seminar from '@/models/Seminar';
import { authenticateApi } from '@/lib/auth';

export async function GET(req) {
  try {
    const decoded = await authenticateApi(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const consultations = await Consultation.find({ 'customerDetails.email': user.email })
      .sort({ createdAt: -1 })
      .lean();

    const orders = await Order.find({ 'customerDetails.email': user.email })
      .populate('items.bookId', 'ebookUrl physicalPrice shippingCost')
      .sort({ createdAt: -1 })
      .lean();

    const webinars = await WebinarRegistration.find({ userId: decoded.userId })
      .populate('webinarId', 'title date time meetingLink')
      .sort({ createdAt: -1 })
      .lean();

    const seminarRegistrations = await SeminarRegistration.find({
      $or: [
        { userId: decoded.userId },
        { 'registrationData.email': user.email }
      ]
    })
      .populate('seminarId', 'title date time locationAddress')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ consultations, orders, webinars, seminarRegistrations }, { status: 200 });
  } catch (error) {
    console.error('User Dashboard Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
