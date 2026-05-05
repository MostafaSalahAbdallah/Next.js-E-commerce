import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/services/auth.service";
import { createPaidOrderFromPayment } from "@/services/payment.service";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  return verifyAuthToken(token);
}

export async function POST(request) {
  try {
    const user = await getAuthUser();
    const { paymentIntentId, shippingDetails } = await request.json();
    const order = await createPaidOrderFromPayment(
      user.id,
      paymentIntentId,
      shippingDetails
    );

    return NextResponse.json(
      {
        message: "Payment successful. Order placed.",
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
      { message: error.message || "Failed to confirm payment." },
      { status: error.status || 500 }
    );
  }
}
