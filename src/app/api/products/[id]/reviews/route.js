import { NextResponse } from "next/server";
import { requireAuth } from "@/middleware/auth.middleware";
import {
  addProductReview,
  getProductReviews,
} from "@/services/review.service";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const data = await getProductReviews(id);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch reviews." },
      { status: error.status || 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const review = await addProductReview(id, user.id, body);

    return NextResponse.json(
      { message: "Review saved.", review },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to save review." },
      { status: error.status || 500 }
    );
  }
}
