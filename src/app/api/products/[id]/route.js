import { NextResponse } from "next/server";
import { getProductById } from "@/services/product.service";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const product = await getProductById(id);

    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch product." },
      { status: error.status || 500 }
    );
  }
}
