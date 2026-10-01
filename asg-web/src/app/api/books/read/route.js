import { NextResponse } from 'next/server';
import { get } from '@vercel/blob';
import connectToDatabase from '@/lib/mongodb';
import Book from '@/models/Book';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let targetUrl = searchParams.get('url');
  const bookId = searchParams.get('bookId') || searchParams.get('id');
  const isDownload = searchParams.get('download') === 'true';

  // If no direct URL provided but bookId given, look up the book's ebookUrl from MongoDB
  if (!targetUrl && bookId) {
    try {
      await connectToDatabase();
      const book = await Book.findById(bookId).lean();
      if (book && book.ebookUrl) {
        targetUrl = book.ebookUrl;
      }
    } catch (err) {
      console.error('Failed to lookup book by id in /api/books/read:', err);
    }
  }

  if (!targetUrl) {
    return new NextResponse('Missing url or bookId parameter', { status: 400 });
  }

  try {
    if (targetUrl.includes('blob.vercel-storage.com') || targetUrl.includes('vercel.com/api/blob')) {
      const range = request.headers.get('range');
      const requestHeaders = range ? { range } : undefined;

      // Securely fetch private blob via server-side credentials
      let response = null;
      try {
        response = await get(targetUrl, { 
          access: 'private',
          headers: requestHeaders
        });
      } catch (privErr) {
        console.warn('Private blob fetch failed, attempting public get:', privErr.message);
        try {
          response = await get(targetUrl, { 
            access: 'public',
            headers: requestHeaders
          });
        } catch (pubErr) {
          console.error('Public blob get also failed:', pubErr.message);
        }
      }

      if (!response || !response.stream) {
        return new NextResponse('E-Book file not found or inaccessible', { status: 404 });
      }

      const pathname = response.blob?.pathname || '';
      const rawFilename = pathname.split('/').pop() || 'ebook.pdf';
      const cleanFilename = rawFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const dispositionType = isDownload ? 'attachment' : 'inline';

      const headers = new Headers();
      headers.set('Content-Type', response.blob?.contentType || 'application/pdf');
      headers.set('Content-Disposition', `${dispositionType}; filename="${cleanFilename}"`);
      headers.set('Accept-Ranges', 'bytes');
      headers.set('Cache-Control', 'private, max-age=3600');

      const contentRange = response.headers?.get('content-range');
      if (contentRange) {
        headers.set('Content-Range', contentRange);
      }

      const contentLength = response.headers?.get('content-length') || (response.blob?.size ? response.blob.size.toString() : null);
      if (contentLength) {
        headers.set('Content-Length', contentLength);
      }

      const statusCode = contentRange ? 206 : (response.statusCode || 200);

      return new NextResponse(response.stream, { status: statusCode, headers });
    }

    // For any external or non-blob URL, redirect directly
    return NextResponse.redirect(targetUrl);
  } catch (error) {
    console.error('Error serving e-book via /api/books/read:', error);
    return new NextResponse('Failed to load e-book: ' + error.message, { status: 500 });
  }
}
