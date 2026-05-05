import { NextResponse } from "next/server";
import { requireAuth } from "@/middleware/auth.middleware";
import { createOrderFromCart, getOrders } from "@/services/order.service";

export async function GET() {
  try {
    const user = await requireAuth();
    const orders = await getOrders(user.id);

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch orders." },
      { status: error.status || 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await requireAuth();
    const body = await request.json().catch(() => ({}));
    const order = await createOrderFromCart(user.id, {
      shippingDetails: body.shippingDetails || body.shipping || {},
    });

    return NextResponse.json(
      {
        message: "Order placed successfully.",
        confirmation: {
          orderId: order.id,
          status: order.status,
          total: order.total,
        },
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to place order." },
      { status: error.status || 500 }
    );
  }
}
