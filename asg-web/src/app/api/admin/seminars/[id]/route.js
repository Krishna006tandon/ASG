import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Seminar from '@/models/Seminar';

export async function DELETE(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const deletedSeminar = await Seminar.findByIdAndDelete(id);

    if (!deletedSeminar) {
      return NextResponse.json({ error: 'Seminar not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Seminar deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete seminar' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const updatedSeminar = await Seminar.findByIdAndUpdate(id, body, { new: true });

    if (!updatedSeminar) {
      return NextResponse.json({ error: 'Seminar not found' }, { status: 404 });
    }

    return NextResponse.json(updatedSeminar, { status: 200 });
  } catch (error) {
    console.error('Update Seminar Error:', error);
    return NextResponse.json({ error: 'Failed to update seminar' }, { status: 500 });
  }
}
