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
    if (url.includes('blob.vercel-storage.com') || url.includes('vercel.com/api/blob')) {
      // Securely fetch private blob via server-side credentials
      const response = await get(url, { access: 'private' });

      if (!response || !response.stream) {
        return new NextResponse('Image not found', { status: 404 });
      }

      return new NextResponse(response.stream, {
        headers: {
          'Content-Type': response.blob?.contentType || 'image/jpeg',
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        },
      });
    }

    // For external URLs, redirect directly
    return NextResponse.redirect(url);
  } catch (error) {
    console.error('Error fetching image via proxy:', error);
    return new NextResponse('Failed to load image', { status: 500 });
  }
}
