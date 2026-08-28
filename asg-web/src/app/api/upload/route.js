import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // You can add authentication checks here if needed (e.g. verify admin session)
        return {
          // Allowing all content types for now to avoid MIME type mismatch 400 errors
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // You can save the blob url to your database here if you want
        console.log('Blob upload completed', blob, tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 },
    );
  }
}
