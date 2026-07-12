import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';

export async function GET(req) {
  try {
    await connectToDatabase();
    
    // Fetch recent orders
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Calculate total revenue from 'Paid' or 'Delivered' or 'Dispatched' orders
    const validStatuses = ['Paid', 'Dispatched', 'Delivered'];
    const allOrders = await Order.find({ status: { $in: validStatuses } }).lean();
    const totalRevenue = allOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Active orders (Pending, Processing)
    const activeOrdersCount = await Order.countDocuments({ status: { $in: ['Pending', 'Processing'] } });

    // For upcoming consultations & webinars (mocking these counts based on users for now since we don't have those models yet)
    const userCount = await User.countDocuments();

    return NextResponse.json({
      kpis: [
        { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, trend: "+0%" },
        { label: "Active Orders", value: activeOrdersCount.toString(), trend: "+0%" },
        { label: "Registered Users", value: userCount.toString(), trend: "+0" },
        { label: "Webinar Registrations", value: "0", trend: "+0" }
      ],
      recentOrders: recentOrders.map(order => ({
        id: order._id.toString().substring(0, 8).toUpperCase(), // Short ID for display
        customer: order.customerDetails?.name || 'Unknown',
        status: order.status,
        amount: `₹${order.totalAmount}`
      }))
    }, { status: 200 });

  } catch (error) {
    console.error('Admin Dashboard Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
