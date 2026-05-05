import { NextResponse } from "next/server";
import { requireAdmin } from "@/middleware/admin.middleware";
import { getAdminOrders } from "@/services/admin.service";

export async function GET() {
  try {
    await requireAdmin();
    const orders = await getAdminOrders();

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch orders." },
      { status: error.status || 500 }
    );
  }
}
