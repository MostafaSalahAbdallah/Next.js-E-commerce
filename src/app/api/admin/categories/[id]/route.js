import { NextResponse } from "next/server";
import { requireAdmin } from "@/middleware/admin.middleware";
import {
  deleteAdminCategory,
  updateAdminCategory,
} from "@/services/admin.service";

export async function PATCH(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const category = await updateAdminCategory(id, body);

    return NextResponse.json(
      { message: "Category updated.", category },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to update category." },
      { status: error.status || 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const category = await deleteAdminCategory(id);

    return NextResponse.json(
      { message: "Category deleted.", category },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to delete category." },
      { status: error.status || 500 }
    );
  }
}
