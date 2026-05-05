import { NextResponse } from "next/server";
import { getCategories } from "@/services/category.service";

export async function GET() {
  try {
    const categories = await getCategories();

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch categories." },
      { status: error.status || 500 }
    );
  }
}
