import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import Consultation from '@/models/Consultation';
import Webinar from '@/models/Webinar';
import Blog from '@/models/Blog';
import Book from '@/models/Book';

export async function GET(req) {
  try {
    await connectToDatabase();
    
    // Fetch recent orders
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Calculate total revenue from 'Paid' or 'Delivered' or 'Dispatched' orders
    const validOrderStatuses = ['Paid', 'Dispatched', 'Delivered'];
    const allOrders = await Order.find({ status: { $in: validOrderStatuses } }).lean();
    const orderRevenue = allOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Calculate consultation revenue
    const paidConsultations = await Consultation.find({ paymentStatus: 'Paid' }).lean();
    const consultationRevenue = paidConsultations.reduce((sum, c) => sum + (c.charges || 0), 0);

    const totalRevenue = orderRevenue + consultationRevenue;

    // Active pending items
    const activeOrdersCount = await Order.countDocuments({ status: { $in: ['Pending', 'Processing'] } });
    const pendingConsultationsCount = await Consultation.countDocuments({ status: 'Pending' });

    // Platform Stats
    const userCount = await User.countDocuments();
    const webinarCount = await Webinar.countDocuments();
    const blogCount = await Blog.countDocuments({ isPublished: true });
    const bookCount = await Book.countDocuments();

    return NextResponse.json({
      kpis: [
        { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, trend: "Live" },
        { label: "Active Orders", value: activeOrdersCount.toString(), trend: "Live" },
        { label: "Pending Consults", value: pendingConsultationsCount.toString(), trend: "Live" },
        { label: "Registered Users", value: userCount.toString(), trend: "Live" },
        { label: "Webinars Hosted", value: webinarCount.toString(), trend: "Live" },
        { label: "Published Blogs", value: blogCount.toString(), trend: "Live" },
        { label: "Store Items", value: bookCount.toString(), trend: "Live" }
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
