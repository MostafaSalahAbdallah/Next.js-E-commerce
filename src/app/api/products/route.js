import { NextResponse } from "next/server";
import { getProducts } from "@/services/product.service";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const products = await getProducts({
      search: searchParams.get("search"),
      minPrice: searchParams.get("minPrice"),
      maxPrice: searchParams.get("maxPrice"),
      category: searchParams.get("category"),
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch products." },
      { status: error.status || 500 }
    );
  }
}
