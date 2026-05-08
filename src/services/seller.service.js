import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";

function createSellerError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validateObjectId(id, message) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createSellerError(message, 400);
  }
}

function serializeCategory(category) {
  return {
    id: category._id.toString(),
    name: category.name,
    description: category.description,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
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
    seller: product.seller?.toString() || null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

function validateProductInput({ name, price, description, image, stock }) {
  if (!name?.trim() || !description?.trim() || !image?.trim()) {
    throw createSellerError("Name, description, and image are required.");
  }

  if (Number(price) < 0 || Number.isNaN(Number(price))) {
    throw createSellerError("Price must be a valid number.");
  }

  if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
    throw createSellerError("Stock must be a valid number.");
  }
}

async function assertSellerCategoryAccess(categoryId, sellerId) {
  if (!categoryId) {
    return null;
  }

  validateObjectId(categoryId, "Invalid category id.");

  const category = await Category.findOne({
    _id: categoryId,
    deletedAt: null,
    $or: [{ createdBy: sellerId }, { createdBy: null }],
  });

  if (!category) {
    throw createSellerError("Category not found.", 404);
  }

  return category._id;
}

export async function getSellerProducts(sellerId) {
  validateObjectId(sellerId, "Invalid seller id.");
  await connectDB();

  const products = await Product.find({ seller: sellerId, deletedAt: null })
    .populate("category", "name")
    .sort({ createdAt: -1 });

  return products.map(serializeProduct);
}

export async function createSellerProduct(sellerId, payload) {
  validateObjectId(sellerId, "Invalid seller id.");
  validateProductInput(payload);
  await connectDB();

  const category = await assertSellerCategoryAccess(payload.category, sellerId);
  const product = await Product.create({
    name: payload.name.trim(),
    price: Number(payload.price),
    description: payload.description.trim(),
    image: payload.image.trim(),
    stock: Number(payload.stock),
    category,
    seller: sellerId,
  });

  await product.populate("category", "name");
  return serializeProduct(product);
}

export async function updateSellerProduct(sellerId, productId, payload) {
  validateObjectId(sellerId, "Invalid seller id.");
  validateObjectId(productId, "Invalid product id.");
  validateProductInput(payload);
  await connectDB();

  const category = await assertSellerCategoryAccess(payload.category, sellerId);
  const product = await Product.findOneAndUpdate(
    { _id: productId, seller: sellerId, deletedAt: null },
    {
      name: payload.name.trim(),
      price: Number(payload.price),
      description: payload.description.trim(),
      image: payload.image.trim(),
      stock: Number(payload.stock),
      category,
    },
    { new: true }
  ).populate("category", "name");

  if (!product) {
    throw createSellerError("Product not found.", 404);
  }

  return serializeProduct(product);
}

export async function updateSellerProductStock(sellerId, productId, stock) {
  validateObjectId(sellerId, "Invalid seller id.");
  validateObjectId(productId, "Invalid product id.");

  if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
    throw createSellerError("Stock must be a valid number.");
  }

  await connectDB();

  const product = await Product.findOneAndUpdate(
    { _id: productId, seller: sellerId, deletedAt: null },
    { stock: Number(stock) },
    { new: true }
  ).populate("category", "name");

  if (!product) {
    throw createSellerError("Product not found.", 404);
  }

  return serializeProduct(product);
}

export async function deleteSellerProduct(sellerId, productId) {
  validateObjectId(sellerId, "Invalid seller id.");
  validateObjectId(productId, "Invalid product id.");
  await connectDB();

  const product = await Product.findOneAndUpdate(
    { _id: productId, seller: sellerId, deletedAt: null },
    { deletedAt: new Date() },
    { new: true }
  ).populate("category", "name");

  if (!product) {
    throw createSellerError("Product not found.", 404);
  }

  return serializeProduct(product);
}

export async function getSellerCategories(sellerId) {
  validateObjectId(sellerId, "Invalid seller id.");
  await connectDB();

  const categories = await Category.find({
    deletedAt: null,
    $or: [{ createdBy: sellerId }, { createdBy: null }],
  }).sort({ createdAt: -1 });

  return categories.map(serializeCategory);
}

export async function createSellerCategory(sellerId, { name, description = "" }) {
  validateObjectId(sellerId, "Invalid seller id.");

  if (!name?.trim()) {
    throw createSellerError("Category name is required.");
  }

  await connectDB();

  const category = await Category.create({
    name: name.trim(),
    description: description.trim(),
    createdBy: sellerId,
  });

  return serializeCategory(category);
}

export async function updateSellerCategory(
  sellerId,
  categoryId,
  { name, description = "" }
) {
  validateObjectId(sellerId, "Invalid seller id.");
  validateObjectId(categoryId, "Invalid category id.");

  if (!name?.trim()) {
    throw createSellerError("Category name is required.");
  }

  await connectDB();

  const category = await Category.findOneAndUpdate(
    { _id: categoryId, createdBy: sellerId, deletedAt: null },
    { name: name.trim(), description: description.trim() },
    { new: true }
  );

  if (!category) {
    throw createSellerError("Category not found.", 404);
  }

  return serializeCategory(category);
}

export async function deleteSellerCategory(sellerId, categoryId) {
  validateObjectId(sellerId, "Invalid seller id.");
  validateObjectId(categoryId, "Invalid category id.");
  await connectDB();

  const category = await Category.findOneAndUpdate(
    { _id: categoryId, createdBy: sellerId, deletedAt: null },
    { deletedAt: new Date() },
    { new: true }
  );

  if (!category) {
    throw createSellerError("Category not found.", 404);
  }

  await Product.updateMany(
    { seller: sellerId, category: categoryId },
    { category: null }
  );

  return serializeCategory(category);
}
