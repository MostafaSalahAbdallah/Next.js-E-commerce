import { NextResponse } from "next/server";
import { requireRole } from "@/middleware/auth.middleware";
import { updateOrderStatus } from "@/services/order.service";

export async function PATCH(request, { params }) {
  try {
    await requireRole("admin");
    const { id } = await params;
    const body = await request.json();
    const order = await updateOrderStatus(id, body.status);

    return NextResponse.json(
      { message: "Order status updated.", order },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to update order status." },
      { status: error.status || 500 }
    );
  }
}
