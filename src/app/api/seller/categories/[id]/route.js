import { NextResponse } from "next/server";
import { requireRole } from "@/middleware/auth.middleware";
import {
  deleteSellerCategory,
  updateSellerCategory,
} from "@/services/seller.service";

export async function PATCH(request, { params }) {
  try {
    const seller = await requireRole("seller");
    const { id } = await params;
    const body = await request.json();
    const category = await updateSellerCategory(seller.id, id, body);

    return NextResponse.json(
      { message: "Category updated.", category },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to update seller category." },
      { status: error.status || 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const seller = await requireRole("seller");
    const { id } = await params;
    const category = await deleteSellerCategory(seller.id, id);

    return NextResponse.json(
      { message: "Category deleted.", category },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to delete seller category." },
      { status: error.status || 500 }
    );
  }
}
