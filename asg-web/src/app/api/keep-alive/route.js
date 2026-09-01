import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "Backend is active", timestamp: new Date().toISOString() },
    { status: 200 }
  );
}
