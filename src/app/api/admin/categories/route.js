import { NextResponse } from "next/server";
import { requireAdmin } from "@/middleware/admin.middleware";
import {
  createAdminCategory,
  getAdminCategories,
} from "@/services/admin.service";

export async function GET() {
  try {
    await requireAdmin();
    const categories = await getAdminCategories();

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch categories." },
      { status: error.status || 500 }
    );
  }
}

export async function POST(request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const category = await createAdminCategory(body);

    return NextResponse.json(
      { message: "Category created.", category },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to create category." },
      { status: error.status || 500 }
    );
  }
}
