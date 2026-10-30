import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import CollegeReview from '@/models/CollegeReview';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const college = searchParams.get('college');
    const source = searchParams.get('source');
    const limit = parseInt(searchParams.get('limit') || '200', 10);

    const filter = {};
    if (college && college !== 'all') {
      filter.collegeName = college;
    }
    if (source && source !== 'all') {
      filter.source = source;
    }
    if (search) {
      filter.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { collegeName: { $regex: search, $options: 'i' } },
        { workshopTitle: { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } }
      ];
    }

    const reviews = await CollegeReview.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Stats
    const totalCount = await CollegeReview.countDocuments();
    const liveCount = await CollegeReview.countDocuments({ source: 'live_link' });
    const excelCount = await CollegeReview.countDocuments({ source: 'excel_import' });

    // Distinct colleges for filter dropdown
    const collegesList = await CollegeReview.distinct('collegeName');

    let avgRating = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      avgRating = Number((sum / reviews.length).toFixed(1));
    }

    return NextResponse.json({
      reviews,
      collegesList,
      stats: {
        totalCount,
        liveCount,
        excelCount,
        avgRating
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Fetch College Reviews Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    await CollegeReview.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Review deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete College Review Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete review' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, isFeatured, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    const updates = {};
    if (isFeatured !== undefined) updates.isFeatured = Boolean(isFeatured);
    if (status !== undefined) updates.status = status;

    const updated = await CollegeReview.findByIdAndUpdate(id, updates, { new: true });

    return NextResponse.json({ review: updated }, { status: 200 });
  } catch (error) {
    console.error('Update College Review Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update review' }, { status: 500 });
  }
}
