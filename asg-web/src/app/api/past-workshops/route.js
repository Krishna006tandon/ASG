import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import PastWorkshop from '@/models/PastWorkshop';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const featuredOnly = searchParams.get('featured') === 'true';

    const query = {};
    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }
    if (featuredOnly) {
      query.featured = true;
    }

    const workshops = await PastWorkshop.find(query)
      .sort({ order: 1, date: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      workshops: workshops || []
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching public past workshops:', error);
    return NextResponse.json({ success: false, error: 'Failed to load past workshops' }, { status: 500 });
  }
}
