import { NextResponse } from 'next/server';
import { get } from '@vercel/blob';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    // Fetch the private blob securely from Vercel
    const response = await get(url, { access: 'private' });
    
    if (!response || !response.stream) {
      return new NextResponse('File not found or not modified', { status: 404 });
    }

    // Return the stream directly to the browser
    return new NextResponse(response.stream, {
      headers: {
        'Content-Type': response.blob.contentType || 'application/pdf',
        // inline tells the browser to display the PDF inside the iframe
        'Content-Disposition': `inline; filename="${response.blob.pathname.split('/').pop()}"`,
      }
    });
  } catch (error) {
    console.error('Error fetching private blob for preview:', error);
    return new NextResponse('Failed to load private preview', { status: 500 });
  }
}
