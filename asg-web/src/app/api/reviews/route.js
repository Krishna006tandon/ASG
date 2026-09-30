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
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const itemType = searchParams.get('itemType');
    const itemId = searchParams.get('itemId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const query = { status: 'approved' };
    if (itemType) query.itemType = itemType;
    if (itemId) query.itemId = itemId;

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Calculate rating statistics
    const totalReviews = reviews.length;
    let averageRating = 0;
    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, r) => {
        const rating = Math.min(5, Math.max(1, Math.round(r.rating)));
        ratingBreakdown[rating] = (ratingBreakdown[rating] || 0) + 1;
        return acc + r.rating;
      }, 0);
      averageRating = Number((sum / totalReviews).toFixed(1));
    }

    return NextResponse.json({
      reviews,
      stats: {
        totalReviews,
        averageRating,
        ratingBreakdown
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const decoded = await authenticateApi(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Authentication required. Please log in.' }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    const body = await req.json();
    const { itemType, itemId, itemTitle, rating, comment } = body;

    // Validation
    if (!itemType || !['book', 'webinar', 'seminar', 'platform'].includes(itemType)) {
      return NextResponse.json({ error: 'Invalid item type' }, { status: 400 });
    }

    if (itemType !== 'platform' && !itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length < 5) {
      return NextResponse.json({ error: 'Please provide a comment of at least 5 characters' }, { status: 400 });
    }

    if (comment.trim().length > 1000) {
      return NextResponse.json({ error: 'Review comment exceeds maximum limit of 1000 characters' }, { status: 400 });
    }

    // Verification logic
    let isVerified = false;

    if (itemType === 'book') {
      const order = await Order.findOne({
        'customerDetails.email': user.email,
        status: { $in: ['Paid', 'Processing', 'Dispatched', 'Delivered'] },
        'items.bookId': itemId
      });
      if (order) isVerified = true;
    } else if (itemType === 'webinar') {
      const reg = await WebinarRegistration.findOne({
        $or: [{ userId: user._id }, { 'registrationData.email': user.email }],
        webinarId: itemId,
        paymentStatus: 'Paid'
      });
      if (reg) isVerified = true;
    } else if (itemType === 'seminar') {
      const reg = await SeminarRegistration.findOne({
        $or: [{ userId: user._id }, { 'registrationData.email': user.email }],
        seminarId: itemId,
        paymentStatus: 'Paid'
      });
      if (reg) isVerified = true;
    } else if (itemType === 'platform') {
      const [hasOrder, hasWebinar, hasSeminar, hasConsult] = await Promise.all([
        Order.exists({ 'customerDetails.email': user.email, status: { $in: ['Paid', 'Processing', 'Dispatched', 'Delivered'] } }),
        WebinarRegistration.exists({ $or: [{ userId: user._id }, { 'registrationData.email': user.email }], paymentStatus: 'Paid' }),
        SeminarRegistration.exists({ $or: [{ userId: user._id }, { 'registrationData.email': user.email }], paymentStatus: 'Paid' }),
        Consultation.exists({ 'customerDetails.email': user.email, paymentStatus: 'Paid' })
      ]);
      if (hasOrder || hasWebinar || hasSeminar || hasConsult) {
        isVerified = true;
      }
    }

    if (!isVerified) {
      let message = 'Verification required: You can only review items you have purchased or attended.';
      if (itemType === 'book') message = 'Verification required: You can only review books that you have purchased.';
      if (itemType === 'webinar') message = 'Verification required: You can only review workshops that you have registered for.';
      if (itemType === 'seminar') message = 'Verification required: You can only review seminars that you have booked tickets for.';
      if (itemType === 'platform') message = 'Verification required: Platform reviews are open to clients who have attended a workshop/seminar, purchased a book, or completed a consultation.';

      return NextResponse.json({ error: message }, { status: 403 });
    }

    // Upsert review (allows user to update their previous review)
    const filter = {
      userId: user._id,
      itemType,
      itemId: itemId || null
    };

    const update = {
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      itemType,
      itemId: itemId || null,
      itemTitle: itemTitle || (itemType === 'platform' ? 'General Mentorship & Platform' : 'Item Review'),
      rating: numericRating,
      comment: comment.trim(),
      verified: true,
      status: 'approved'
    };

    const review = await Review.findOneAndUpdate(filter, update, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    });

    return NextResponse.json({
      message: 'Review saved successfully!',
      review
    }, { status: 200 });

  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
