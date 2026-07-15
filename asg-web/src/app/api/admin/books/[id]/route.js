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
    const formData = await req.formData();
    
    const title = formData.get('title');
    const description = formData.get('description');
    const originalPrice = formData.get('originalPrice') || 0;
    const price = formData.get('price'); 
    const stock = formData.get('stock');
    const physicalPrice = formData.get('physicalPrice') || 0;
    const shippingCost = formData.get('shippingCost') || 0;
    const file = formData.get('file');

    if (!title || !description || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updateData = {
      title,
      description,
      originalPrice: Number(originalPrice),
      price: Number(price),
      physicalPrice: Number(physicalPrice),
      shippingCost: Number(shippingCost),
      stock: Number(stock) || 0,
    };
    
    // Upload E-Book PDF locally if a NEW file is provided
    if (file && file.size > 0 && typeof file !== 'string') {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'ebooks');
        
        await mkdir(uploadDir, { recursive: true });
        
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);
        
        updateData.ebookUrl = `/uploads/ebooks/${filename}`;
      } catch (uploadError) {
        console.error("Local Upload Error:", uploadError);
        return NextResponse.json({ error: 'Failed to upload E-Book file locally' }, { status: 500 });
      }
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
