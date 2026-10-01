import { NextResponse } from 'next/server';
import { get } from '@vercel/blob';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    // Fetch the private blob securely from Vercel
    let response = null;
    try {
      response = await get(url, { access: 'private' });
    } catch (err) {
      console.warn('Admin preview private get failed, trying public:', err.message);
      try {
        response = await get(url, { access: 'public' });
      } catch (pubErr) {
        console.error('Admin preview public get failed:', pubErr.message);
      }
    }
    
    if (!response || !response.stream) {
      return new NextResponse('File not found or not modified', { status: 404 });
    }

    const pathname = response.blob?.pathname || '';
    const rawFilename = pathname.split('/').pop() || 'preview.pdf';
    const cleanFilename = rawFilename.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Return the stream directly to the browser
    return new NextResponse(response.stream, {
      headers: {
        'Content-Type': response.blob?.contentType || 'application/pdf',
        'Content-Disposition': `inline; filename="${cleanFilename}"`,
        'Cache-Control': 'private, max-age=3600',
      }
    });
  } catch (error) {
    console.error('Error fetching private blob for preview:', error);
    return new NextResponse('Failed to load private preview', { status: 500 });
  }
}
