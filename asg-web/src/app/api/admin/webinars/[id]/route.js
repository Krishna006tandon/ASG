import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Webinar from '@/models/Webinar';

export async function DELETE(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const deletedWebinar = await Webinar.findByIdAndDelete(id);

    if (!deletedWebinar) {
      return NextResponse.json({ error: 'Webinar not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Webinar deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete webinar' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const updatedWebinar = await Webinar.findByIdAndUpdate(id, body, { new: true });

    if (!updatedWebinar) {
      return NextResponse.json({ error: 'Webinar not found' }, { status: 404 });
    }

    return NextResponse.json(updatedWebinar, { status: 200 });
  } catch (error) {
    console.error('Update Webinar Error:', error);
    return NextResponse.json({ error: 'Failed to update webinar' }, { status: 500 });
  }
}
