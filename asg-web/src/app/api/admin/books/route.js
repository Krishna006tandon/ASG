import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Book from '@/models/Book';

export async function GET(req) {
  try {
    await connectToDatabase();
    const books = await Book.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(books, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const { title, description, price, stock } = await req.json();

    if (!title || !description || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newBook = await Book.create({
      title,
      description,
      price: Number(price),
      stock: Number(stock) || 0,
    });

    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
  }
}
