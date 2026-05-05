import { NextResponse } from "next/server";
import { requireRole } from "@/middleware/auth.middleware";
import {
  deleteSellerProduct,
  updateSellerProduct,
} from "@/services/seller.service";

export async function PATCH(request, { params }) {
  try {
    const seller = await requireRole("seller");
    const { id } = await params;
    const body = await request.json();
    const product = await updateSellerProduct(seller.id, id, body);

    return NextResponse.json(
      { message: "Product updated.", product },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to update seller product." },
      { status: error.status || 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const seller = await requireRole("seller");
    const { id } = await params;
    const product = await deleteSellerProduct(seller.id, id);

    return NextResponse.json(
      { message: "Product deleted.", product },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to delete seller product." },
      { status: error.status || 500 }
    );
  }
}
