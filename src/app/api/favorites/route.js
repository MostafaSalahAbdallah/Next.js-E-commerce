import { NextResponse } from "next/server";
import { requireAuth } from "@/middleware/auth.middleware";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "@/services/favorite.service";

export async function GET() {
  try {
    const user = await requireAuth();
    const favorites = await getFavorites(user.id);

    return NextResponse.json({ favorites }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch favorites." },
      { status: error.status || 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const favorites = await addFavorite(user.id, body);

    return NextResponse.json(
      { message: "Product added to favorites.", favorites },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to add favorite." },
      { status: error.status || 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const body = await request.json().catch(() => ({}));
    const productId = body.productId || searchParams.get("productId");
    const favorites = await removeFavorite(user.id, productId);

    return NextResponse.json(
      { message: "Product removed from favorites.", favorites },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to remove favorite." },
      { status: error.status || 500 }
    );
  }
}
