import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Book from '@/models/Book';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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
    
    const data = await req.json();
    
    const {
      title,
      description,
      originalPrice,
      price,
      stock,
      physicalPrice,
      shippingCost,
      ebookUrl
    } = data;

    if (!title || !description || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newBook = await Book.create({
      title,
      description,
      originalPrice: Number(originalPrice || 0),
      price: Number(price),
      physicalPrice: Number(physicalPrice || 0),
      shippingCost: Number(shippingCost || 0),
      stock: Number(stock) || 0,
      ebookUrl: ebookUrl || ''
    });

    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    console.error("Create Book Error:", error);
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
  }
}
