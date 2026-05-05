import { NextResponse } from "next/server";
import { requireAuth } from "@/middleware/auth.middleware";

export async function GET() {
  try {
    const user = await requireAuth();

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Authentication required." },
      { status: error.status || 500 }
    );
  }
}
