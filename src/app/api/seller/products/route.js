import { NextResponse } from "next/server";
import { requireRole } from "@/middleware/auth.middleware";
import {
  createSellerProduct,
  getSellerProducts,
} from "@/services/seller.service";

export async function GET() {
  try {
    const seller = await requireRole("seller");
    const products = await getSellerProducts(seller.id);

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch seller products." },
      { status: error.status || 500 }
    );
  }
}

export async function POST(request) {
  try {
    const seller = await requireRole("seller");
    const body = await request.json();
    const product = await createSellerProduct(seller.id, body);

    return NextResponse.json(
      { message: "Product created.", product },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to create seller product." },
      { status: error.status || 500 }
    );
  }
}
