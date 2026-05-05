import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/services/auth.service";
import { removeCartItem, updateCartItem } from "@/services/cart.service";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  return verifyAuthToken(token);
}

export async function PATCH(request, { params }) {
  try {
    const user = await getAuthUser();
    const { productId } = await params;
    const body = await request.json();
    const cart = await updateCartItem(user.id, productId, body);

    return NextResponse.json({ message: "Cart updated.", cart }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to update cart." },
      { status: error.status || 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getAuthUser();
    const { productId } = await params;
    const cart = await removeCartItem(user.id, productId);

    return NextResponse.json({ message: "Product removed from cart.", cart }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to remove product from cart." },
      { status: error.status || 500 }
    );
  }
}
