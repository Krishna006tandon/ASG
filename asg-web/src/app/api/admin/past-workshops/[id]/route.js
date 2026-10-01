import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import PastWorkshop from '@/models/PastWorkshop';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const workshop = await PastWorkshop.findById(id).lean();

    if (!workshop) {
      return NextResponse.json({ error: 'Past workshop not found' }, { status: 404 });
    }

    return NextResponse.json(workshop, { status: 200 });
  } catch (error) {
    console.error('Error fetching past workshop:', error);
    return NextResponse.json({ error: 'Failed to fetch past workshop' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
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

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (date !== undefined) updateData.date = new Date(date);
    if (location !== undefined) updateData.location = location.trim();
    if (category !== undefined) updateData.category = category.trim();
    if (attendeesCount !== undefined) updateData.attendeesCount = attendeesCount.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (featured !== undefined) updateData.featured = Boolean(featured);
    if (order !== undefined) updateData.order = Number(order) || 0;

    if (highlights !== undefined) {
      if (Array.isArray(highlights)) {
        updateData.highlights = highlights.filter(h => h && h.trim().length > 0);
      } else if (typeof highlights === 'string') {
        updateData.highlights = highlights.split('\n').map(h => h.trim()).filter(Boolean);
      }
    }

    if (images !== undefined) {
      if (Array.isArray(images)) {
        updateData.images = images
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
    }

    const updated = await PastWorkshop.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Past workshop not found' }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Error updating past workshop:', error);
    return NextResponse.json({ error: error.message || 'Failed to update past workshop' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const deleted = await PastWorkshop.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Past workshop not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Past workshop deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting past workshop:', error);
    return NextResponse.json({ error: 'Failed to delete past workshop' }, { status: 500 });
  }
}
