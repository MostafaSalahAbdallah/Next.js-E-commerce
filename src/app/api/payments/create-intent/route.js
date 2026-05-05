import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/services/auth.service";
import { createCartPaymentIntent } from "@/services/payment.service";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  return verifyAuthToken(token);
}

export async function POST() {
  try {
    const user = await getAuthUser();
    const payment = await createCartPaymentIntent(user.id);

    return NextResponse.json(payment, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to create payment intent." },
      { status: error.status || 500 }
    );
  }
}
