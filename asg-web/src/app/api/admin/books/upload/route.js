import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const formData = await req.formData();
    let file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalName = file.name || 'book-cover.jpg';
    const cleanName = originalName.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
    const ext = originalName.split('.').pop() || 'jpg';
    const safeFilename = `book-${cleanName}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;

    let fileUrl = null;

    // 1. Try Vercel Blob if token is available
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import('@vercel/blob');
        const blob = await put(`books/${safeFilename}`, buffer, {
          access: 'public',
        });
        fileUrl = blob.url;
      } catch (blobErr) {
        console.warn('Vercel blob upload failed, falling back to local storage:', blobErr);
      }
    }

    // 2. Try saving to local public uploads directory
    if (!fileUrl) {
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'books');
        await fs.mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, safeFilename);
        await fs.writeFile(filePath, buffer);
        fileUrl = `/uploads/books/${safeFilename}`;
      } catch (fsErr) {
        console.warn('Filesystem write failed, falling back to Base64:', fsErr);
      }
    }

    // 3. Fallback to inline Base64 data URL
    if (!fileUrl) {
      const mimeType = file.type || `image/${ext === 'png' ? 'png' : ext === 'webp' ? 'webp' : 'jpeg'}`;
      fileUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: safeFilename
    }, { status: 200 });

  } catch (error) {
    console.error('Book Cover Upload Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload book thumbnail' }, { status: 500 });
  }
}
