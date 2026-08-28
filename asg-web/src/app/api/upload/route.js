import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: ['application/pdf', 'application/x-pdf', 'application/octet-stream'],
          maximumSizeInBytes: 100 * 1024 * 1024, // 100 MB limit
          tokenPayload: JSON.stringify({ filename: pathname }), // explicitly provide a token payload
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // You can save the blob url to your database here if you want
        console.log('Blob upload completed', blob, tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Vercel Blob Upload Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 },
    );
  }
}
