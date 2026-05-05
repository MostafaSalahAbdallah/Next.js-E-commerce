import { NextResponse } from "next/server";
import { requireAdmin } from "@/middleware/admin.middleware";
import { getAdminUsers } from "@/services/admin.service";

export async function GET() {
  try {
    await requireAdmin();
    const users = await getAdminUsers();

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch users." },
      { status: error.status || 500 }
    );
  }
}
