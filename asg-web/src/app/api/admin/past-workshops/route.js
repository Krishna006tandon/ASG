import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import PastWorkshop from '@/models/PastWorkshop';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectToDatabase();
    const workshops = await PastWorkshop.find({})
      .sort({ order: 1, date: -1, createdAt: -1 })
      .lean();
    return NextResponse.json(workshops, { status: 200 });
  } catch (error) {
    console.error('Error fetching past workshops for admin:', error);
    return NextResponse.json({ error: 'Failed to fetch past workshops' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const {
      title,
      date,
      location,
      category,
      attendeesCount,
      description,
      highlights,
      images,
      featured,
      order
    } = body;

    if (!title || !date || !location || !description) {
      return NextResponse.json({ error: 'Title, Date, Location, and Description are required' }, { status: 400 });
    }

    // Format highlights array
    let formattedHighlights = [];
    if (Array.isArray(highlights)) {
      formattedHighlights = highlights.filter(h => h && h.trim().length > 0);
    } else if (typeof highlights === 'string') {
      formattedHighlights = highlights
        .split('\n')
        .map(h => h.trim())
        .filter(Boolean);
    }

    // Format images array
    let formattedImages = [];
    if (Array.isArray(images)) {
      formattedImages = images
        .filter(img => img && (typeof img === 'string' ? img.trim() : img.url))
        .map(img => {
          if (typeof img === 'string') {
            return { url: img.trim(), caption: '' };
          }
          return {
            url: img.url.trim(),
            caption: img.caption ? img.caption.trim() : ''
          };
        });
    }

    const newWorkshop = await PastWorkshop.create({
      title: title.trim(),
      date: new Date(date),
      location: location.trim(),
      category: category ? category.trim() : 'Workshop',
      attendeesCount: attendeesCount ? attendeesCount.trim() : '',
      description: description.trim(),
      highlights: formattedHighlights,
      images: formattedImages,
      featured: Boolean(featured),
      order: Number(order) || 0,
    });

    return NextResponse.json(newWorkshop, { status: 201 });
  } catch (error) {
    console.error('Error creating past workshop:', error);
    return NextResponse.json({ error: error.message || 'Failed to create past workshop' }, { status: 500 });
  }
}
