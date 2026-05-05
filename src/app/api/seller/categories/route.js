import { NextResponse } from "next/server";
import { requireRole } from "@/middleware/auth.middleware";
import {
  createSellerCategory,
  getSellerCategories,
} from "@/services/seller.service";

export async function GET() {
  try {
    const seller = await requireRole("seller");
    const categories = await getSellerCategories(seller.id);

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch seller categories." },
      { status: error.status || 500 }
    );
  }
}

export async function POST(request) {
  try {
    const seller = await requireRole("seller");
    const body = await request.json();
    const category = await createSellerCategory(seller.id, body);

    return NextResponse.json(
      { message: "Category created.", category },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to create seller category." },
      { status: error.status || 500 }
    );
  }
}
