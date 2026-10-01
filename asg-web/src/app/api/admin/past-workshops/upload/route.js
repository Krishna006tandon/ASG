import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const formData = await req.formData();
    let files = formData.getAll('files');
    if (!files || files.length === 0) {
      const singleFile = formData.get('file');
      if (singleFile) files = [singleFile];
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploadedUrls = [];

    for (const file of files) {
      if (typeof file === 'string') continue;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const originalName = file.name || 'image.jpg';
      const cleanName = originalName.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
      const ext = originalName.split('.').pop() || 'jpg';
      const safeFilename = `${cleanName}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;

      let fileUrl = null;

      // 1. Try Vercel Blob if token is available in environment
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        try {
          const { put } = await import('@vercel/blob');
          const blob = await put(`workshops/${safeFilename}`, buffer, {
            access: 'public',
          });
          fileUrl = blob.url;
        } catch (blobErr) {
          console.warn('Vercel blob upload failed, falling back to storage:', blobErr);
        }
      }

      // 2. Try writing to local public uploads directory (works on local dev & VPS)
      if (!fileUrl) {
        try {
          const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'workshops');
          await fs.mkdir(uploadDir, { recursive: true });
          const filePath = path.join(uploadDir, safeFilename);
          await fs.writeFile(filePath, buffer);
          fileUrl = `/uploads/workshops/${safeFilename}`;
        } catch (fsErr) {
          console.warn('Filesystem write failed (likely serverless read-only), falling back to Base64:', fsErr);
        }
      }

      // 3. Fallback to inline Base64 data URL (works anywhere, serverless without blob token)
      if (!fileUrl) {
        const mimeType = file.type || `image/${ext === 'png' ? 'png' : ext === 'webp' ? 'webp' : 'jpeg'}`;
        fileUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
      }

      uploadedUrls.push({
        url: fileUrl,
        name: originalName
      });
    }

    return NextResponse.json({
      success: true,
      files: uploadedUrls,
      urls: uploadedUrls.map(f => f.url)
    }, { status: 200 });

  } catch (error) {
    console.error('Workshop Image Upload Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload images' }, { status: 500 });
  }
}
