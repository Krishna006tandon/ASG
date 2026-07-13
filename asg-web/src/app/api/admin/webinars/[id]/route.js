import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Webinar from '@/models/Webinar';

export async function DELETE(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;

    const deletedWebinar = await Webinar.findByIdAndDelete(id);

    if (!deletedWebinar) {
      return NextResponse.json({ error: 'Webinar not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Webinar deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete webinar' }, { status: 500 });
  }
}
