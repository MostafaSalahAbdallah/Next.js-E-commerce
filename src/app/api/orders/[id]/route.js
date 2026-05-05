import { NextResponse } from "next/server";
import { requireAuth } from "@/middleware/auth.middleware";
import { getOrderById } from "@/services/order.service";

export async function GET(request, { params }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const order = await getOrderById(id, user);

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch order." },
      { status: error.status || 500 }
    );
  }
}
