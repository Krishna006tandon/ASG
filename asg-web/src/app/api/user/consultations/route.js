import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Consultation from '@/models/Consultation';
import User from '@/models/User';
import Order from '@/models/Order';
import { authenticateApi } from '@/lib/auth';

export async function GET(req) {
  try {
    const user = await authenticateApi(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const consultations = await Consultation.find({ 'customerDetails.email': user.email })
      .sort({ createdAt: -1 })
      .lean();

    const orders = await Order.find({ 'customerDetails.email': user.email })
      .populate('items.bookId', 'ebookUrl physicalPrice shippingCost')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ consultations, orders }, { status: 200 });
  } catch (error) {
    console.error('User Dashboard Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
