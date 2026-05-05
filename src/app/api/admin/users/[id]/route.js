import { NextResponse } from "next/server";
import { requireAdmin } from "@/middleware/admin.middleware";
import {
  softDeleteAdminUser,
  updateAdminUser,
} from "@/services/admin.service";

export async function PATCH(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const user = await updateAdminUser(id, body);

    return NextResponse.json({ message: "User updated.", user }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to update user." },
      { status: error.status || 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const user = await softDeleteAdminUser(id);

    return NextResponse.json(
      { message: "User deleted.", user },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to delete user." },
      { status: error.status || 500 }
    );
  }
}
