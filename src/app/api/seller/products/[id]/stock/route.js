import { NextResponse } from "next/server";
import { requireRole } from "@/middleware/auth.middleware";
import { updateSellerProductStock } from "@/services/seller.service";

export async function PATCH(request, { params }) {
  try {
    const seller = await requireRole("seller");
    const { id } = await params;
    const body = await request.json();
    const product = await updateSellerProductStock(seller.id, id, body.stock);

    return NextResponse.json(
      { message: "Product stock updated.", product },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to update product stock." },
      { status: error.status || 500 }
    );
  }
}
