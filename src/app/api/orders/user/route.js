import { NextResponse } from "next/server";
import { requireAuth } from "@/middleware/auth.middleware";
import { getUserOrders } from "@/services/order.service";

export async function GET() {
  try {
    const user = await requireAuth();
    const orders = await getUserOrders(user.id);

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch order history." },
      { status: error.status || 500 }
    );
  }
}
