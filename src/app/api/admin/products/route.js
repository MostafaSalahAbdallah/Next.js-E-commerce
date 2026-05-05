import { NextResponse } from "next/server";
import { requireAdmin } from "@/middleware/admin.middleware";
import {
  createAdminProduct,
  getAdminProducts,
} from "@/services/admin.service";

export async function GET() {
  try {
    await requireAdmin();
    const products = await getAdminProducts();

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch products." },
      { status: error.status || 500 }
    );
  }
}

export async function POST(request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const product = await createAdminProduct(body);

    return NextResponse.json(
      { message: "Product created.", product },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to create product." },
      { status: error.status || 500 }
    );
  }
}
