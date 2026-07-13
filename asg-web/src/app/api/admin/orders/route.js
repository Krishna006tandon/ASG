import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(req) {
  try {
    await connectToDatabase();
    
    // Fetch all orders, sorted by newest first
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('Fetch Orders Error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
