import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Book from '@/models/Book';

export async function DELETE(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const deletedBook = await Book.findByIdAndDelete(id);

    if (!deletedBook) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Book deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 });
  }
}

import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function PUT(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
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

    const updateData = {
      title,
      description,
      originalPrice: Number(originalPrice || 0),
      price: Number(price),
      physicalPrice: Number(physicalPrice || 0),
      shippingCost: Number(shippingCost || 0),
      stock: Number(stock) || 0,
    };
    
    if (ebookUrl) {
      updateData.ebookUrl = ebookUrl;
    }

    const updatedBook = await Book.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedBook) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json(updatedBook, { status: 200 });
  } catch (error) {
    console.error("Update Book Error:", error);
    return NextResponse.json({ error: 'Failed to update book' }, { status: 500 });
  }
}
