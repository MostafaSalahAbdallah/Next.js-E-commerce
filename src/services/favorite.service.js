import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Favorite from "@/models/Favorite";
import Product from "@/models/Product";
import "@/models/Category";

function createFavoriteError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validateObjectId(id, message) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createFavoriteError(message, 400);
  }
}

function serializeFavorite(favorite) {
  const product = favorite.product;

  return {
    id: favorite._id.toString(),
    product: {
      id: product._id.toString(),
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.image,
      stock: product.stock,
      category: product.category
        ? {
            id: product.category._id.toString(),
            name: product.category.name,
          }
        : null,
    },
    createdAt: favorite.createdAt,
  };
}

export async function getFavorites(userId) {
  validateObjectId(userId, "Invalid user id.");
  await connectDB();

  const favorites = await Favorite.find({ user: userId })
    .populate({
      path: "product",
      match: { deletedAt: null },
      populate: { path: "category", select: "name" },
    })
    .sort({ createdAt: -1 });

  return favorites.filter((favorite) => favorite.product).map(serializeFavorite);
}

export async function addFavorite(userId, { productId }) {
  validateObjectId(userId, "Invalid user id.");
  validateObjectId(productId, "Invalid product id.");

  await connectDB();

  const product = await Product.findOne({ _id: productId, deletedAt: null });

  if (!product) {
    throw createFavoriteError("Product not found.", 404);
  }

  await Favorite.updateOne(
    { user: userId, product: productId },
    { $setOnInsert: { user: userId, product: productId } },
    { upsert: true }
  );

  return getFavorites(userId);
}

export async function removeFavorite(userId, productId) {
  validateObjectId(userId, "Invalid user id.");
  validateObjectId(productId, "Invalid product id.");

  await connectDB();

  await Favorite.deleteOne({ user: userId, product: productId });
  return getFavorites(userId);
}
