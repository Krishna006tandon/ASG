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
    const formData = await req.formData();
    
    const title = formData.get('title');
    const description = formData.get('description');
    const originalPrice = formData.get('originalPrice') || 0;
    const price = formData.get('price'); // E-book base selling price
    const stock = formData.get('stock');
    const physicalPrice = formData.get('physicalPrice') || 0;
    const shippingCost = formData.get('shippingCost') || 0;
    const file = formData.get('file');

    if (!title || !description || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let ebookUrl = '';
    
    // Upload E-Book PDF locally
    if (file && file.size > 0) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'ebooks');
        
        // Ensure directory exists
        await mkdir(uploadDir, { recursive: true });
        
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);
        
        ebookUrl = `/uploads/ebooks/${filename}`;
      } catch (uploadError) {
        console.error("Local Upload Error:", uploadError);
        return NextResponse.json({ error: 'Failed to save E-Book file locally' }, { status: 500 });
      }
    }

    const newBook = await Book.create({
      title,
      description,
      originalPrice: Number(originalPrice),
      price: Number(price),
      physicalPrice: Number(physicalPrice),
      shippingCost: Number(shippingCost),
      stock: Number(stock) || 0,
      ebookUrl
    });

    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    console.error("Create Book Error:", error);
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
  }
}
