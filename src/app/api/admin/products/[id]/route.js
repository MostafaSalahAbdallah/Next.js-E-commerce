import { NextResponse } from "next/server";
import { requireAdmin } from "@/middleware/admin.middleware";
import {
  deleteAdminProduct,
  updateAdminProduct,
} from "@/services/admin.service";

export async function PATCH(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const product = await updateAdminProduct(id, body);

    return NextResponse.json(
      { message: "Product updated.", product },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to update product." },
      { status: error.status || 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const product = await deleteAdminProduct(id);

    return NextResponse.json(
      { message: "Product deleted.", product },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to delete product." },
      { status: error.status || 500 }
    );
  }
}
