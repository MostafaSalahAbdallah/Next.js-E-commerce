import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Review from "@/models/Review";
import "@/models/User";

function createReviewError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validateObjectId(id, message) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createReviewError(message, 400);
  }
}

function serializeReview(review) {
  return {
    id: review._id.toString(),
    product: review.product.toString(),
    user: {
      id: review.user._id.toString(),
      email: review.user.email,
    },
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
  };
}

function getReviewSummary(reviews) {
  const count = reviews.length;
  const averageRating =
    count === 0
      ? 0
      : reviews.reduce((total, review) => total + review.rating, 0) / count;

  return {
    count,
    averageRating: Number(averageRating.toFixed(1)),
  };
}

export async function getProductReviews(productId) {
  validateObjectId(productId, "Invalid product id.");
  await connectDB();

  const reviews = await Review.find({ product: productId })
    .populate("user", "email")
    .sort({ createdAt: -1 });

  return {
    reviews: reviews.map(serializeReview),
    summary: getReviewSummary(reviews),
  };
}

export async function addProductReview(productId, userId, { rating, comment }) {
  validateObjectId(productId, "Invalid product id.");
  validateObjectId(userId, "Invalid user id.");

  const nextRating = Number(rating);
  const nextComment = comment?.trim();

  if (!Number.isInteger(nextRating) || nextRating < 1 || nextRating > 5) {
    throw createReviewError("Rating must be between 1 and 5.");
  }

  if (!nextComment) {
    throw createReviewError("Review comment is required.");
  }

  await connectDB();

  const product = await Product.findOne({ _id: productId, deletedAt: null });

  if (!product) {
    throw createReviewError("Product not found.", 404);
  }

  try {
    const review = await Review.findOneAndUpdate(
      { product: productId, user: userId },
      { rating: nextRating, comment: nextComment },
      { new: true, upsert: true, runValidators: true }
    ).populate("user", "email");

    return serializeReview(review);
  } catch (error) {
    if (error.code === 11000) {
      throw createReviewError("You already reviewed this product.", 409);
    }

    throw error;
  }
}
