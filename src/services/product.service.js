import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import "@/models/Category";

function createProductError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function serializeProduct(product) {
  return {
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
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export async function getProducts({ search, minPrice, maxPrice, category } = {}) {
  await connectDB();

  const query = { deletedAt: null };
  const normalizedSearch = search?.trim();
  const priceFilter = {};

  if (normalizedSearch) {
    query.name = { $regex: normalizedSearch, $options: "i" };
  }

  if (minPrice !== undefined && minPrice !== "") {
    const min = Number(minPrice);

    if (Number.isNaN(min) || min < 0) {
      throw createProductError("Minimum price must be a valid number.");
    }

    priceFilter.$gte = min;
  }

  if (maxPrice !== undefined && maxPrice !== "") {
    const max = Number(maxPrice);

    if (Number.isNaN(max) || max < 0) {
      throw createProductError("Maximum price must be a valid number.");
    }

    priceFilter.$lte = max;
  }

  if (Object.keys(priceFilter).length > 0) {
    query.price = priceFilter;
  }

  if (category) {
    if (!mongoose.Types.ObjectId.isValid(category)) {
      throw createProductError("Invalid category id.", 400);
    }

    query.category = category;
  }

  const products = await Product.find(query)
    .populate("category", "name")
    .sort({ createdAt: -1 });
  return products.map(serializeProduct);
}

export async function getProductById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createProductError("Invalid product id.", 400);
  }

  await connectDB();

  const product = await Product.findOne({ _id: id, deletedAt: null }).populate(
    "category",
    "name"
  );

  if (!product) {
    throw createProductError("Product not found.", 404);
  }

  return serializeProduct(product);
}
