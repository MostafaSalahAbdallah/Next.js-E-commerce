import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/services/auth.service";
import { addToCart, getCart } from "@/services/cart.service";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  return verifyAuthToken(token);
}

export async function GET() {
  try {
    const user = await getAuthUser();
    const cart = await getCart(user.id);

    return NextResponse.json({ cart }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch cart." },
      { status: error.status || 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser();
    const body = await request.json();
    const cart = await addToCart(user.id, body);

    return NextResponse.json({ message: "Product added to cart.", cart }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to add product to cart." },
      { status: error.status || 500 }
    );
  }
}
