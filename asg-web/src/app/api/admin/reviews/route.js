import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Review from '@/models/Review';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const itemType = searchParams.get('itemType');
    const search = searchParams.get('search');

    const filter = {};
    if (itemType && itemType !== 'all') {
      filter.itemType = itemType;
    }
    if (search) {
      filter.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { itemTitle: { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } }
      ];
    }

    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Calculate real stats from database
    const totalCount = await Review.countDocuments();
    const booksCount = await Review.countDocuments({ itemType: 'book' });
    const webinarsCount = await Review.countDocuments({ itemType: 'webinar' });
    const seminarsCount = await Review.countDocuments({ itemType: 'seminar' });
    const platformCount = await Review.countDocuments({ itemType: 'platform' });

    let avgRating = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      avgRating = Number((sum / reviews.length).toFixed(1));
    }

    return NextResponse.json({
      reviews,
      stats: {
        totalCount,
        booksCount,
        webinarsCount,
        seminarsCount,
        platformCount,
        avgRating
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Admin reviews GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
