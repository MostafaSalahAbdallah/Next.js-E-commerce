import { NextResponse } from "next/server";
import { getProducts } from "@/services/product.service";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = {};

    if (searchParams.has("search")) {
      params.search = searchParams.get("search");
    }

    if (searchParams.has("minPrice")) {
      params.minPrice = searchParams.get("minPrice");
    }

    if (searchParams.has("maxPrice")) {
      params.maxPrice = searchParams.get("maxPrice");
    }

    if (searchParams.has("category")) {
      params.category = searchParams.get("category");
    }

    const products = await getProducts(params);

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch products." },
      { status: error.status || 500 }
    );
  }
}
