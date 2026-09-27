import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Keep database connection pool warm
    await connectToDatabase();
    return NextResponse.json(
      {
        status: "active",
        message: "Backend service and Database are active and warm",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    // If DB has a temporary connection issue, still return 200 so the keep-alive ping succeeds
    return NextResponse.json(
      {
        status: "active",
        warning: "Database connect issue: " + error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}
