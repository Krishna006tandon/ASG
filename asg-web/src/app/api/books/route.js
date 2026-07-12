import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Book from '@/models/Book';

export async function GET() {
  try {
    await connectToDatabase();
    const books = await Book.find({}).sort({ createdAt: -1 });
    return NextResponse.json(books);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // In a real app, verify admin JWT here using auth utility
    await connectToDatabase();
    const data = await req.json();
    const newBook = await Book.create(data);
    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
  }
}
