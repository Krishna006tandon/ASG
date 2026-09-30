import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Review from '@/models/Review';
import User from '@/models/User';
import Order from '@/models/Order';
import WebinarRegistration from '@/models/WebinarRegistration';
import SeminarRegistration from '@/models/SeminarRegistration';
import Consultation from '@/models/Consultation';
import { authenticateApi } from '@/lib/auth';

export async function GET(req) {
  try {
    const decoded = await authenticateApi(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(decoded.userId).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's existing reviews
    const myReviews = await Review.find({ userId: user._id })
      .sort({ updatedAt: -1 })
      .lean();

    // Query user's verified items
    const orders = await Order.find({
      'customerDetails.email': user.email,
      status: { $in: ['Paid', 'Processing', 'Dispatched', 'Delivered'] }
    }).select('items.bookId').lean();

    const verifiedBookIds = [];
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (item.bookId) verifiedBookIds.push(item.bookId.toString());
      });
    });

    const webinarRegs = await WebinarRegistration.find({
      $or: [{ userId: user._id }, { 'registrationData.email': user.email }],
      paymentStatus: 'Paid'
    }).select('webinarId').lean();
    const verifiedWebinarIds = webinarRegs.map(w => w.webinarId?.toString()).filter(Boolean);

    const seminarRegs = await SeminarRegistration.find({
      $or: [{ userId: user._id }, { 'registrationData.email': user.email }],
      paymentStatus: 'Paid'
    }).select('seminarId').lean();
    const verifiedSeminarIds = seminarRegs.map(s => s.seminarId?.toString()).filter(Boolean);

    const consultations = await Consultation.find({
      'customerDetails.email': user.email,
      paymentStatus: 'Paid'
    }).select('_id').lean();

    const canReviewPlatform = (
      verifiedBookIds.length > 0 ||
      verifiedWebinarIds.length > 0 ||
      verifiedSeminarIds.length > 0 ||
      consultations.length > 0
    );

    return NextResponse.json({
      reviews: myReviews,
      verifiedItems: {
        books: [...new Set(verifiedBookIds)],
        webinars: [...new Set(verifiedWebinarIds)],
        seminars: [...new Set(verifiedSeminarIds)],
        canReviewPlatform
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch user reviews' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const decoded = await authenticateApi(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400 });
    }

    const deleted = await Review.findOneAndDelete({
      _id: reviewId,
      userId: decoded.userId
    });

    if (!deleted) {
      return NextResponse.json({ error: 'Review not found or not authorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Review deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user review:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
