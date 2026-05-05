import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User, { USER_ROLES } from "@/models/User";

function createAdminServiceError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validateObjectId(id, message) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createAdminServiceError(message, 400);
  }
}

function serializeUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    isBlocked: user.isBlocked,
    deletedAt: user.deletedAt,
    createdAt: user.createdAt,
  };
}

function serializeCategory(category) {
  return {
    id: category._id.toString(),
    name: category.name,
    description: category.description,
    deletedAt: category.deletedAt,
    createdAt: category.createdAt,
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
    seller: product.seller ? product.seller.toString() : null,
    category: product.category
      ? {
          id: product.category._id.toString(),
          name: product.category.name,
        }
      : null,
    deletedAt: product.deletedAt,
    createdAt: product.createdAt,
  };
}

function serializeOrder(order) {
  return {
    id: order._id.toString(),
    user: order.user
      ? {
          id: order.user._id.toString(),
          email: order.user.email,
        }
      : null,
    total: order.total,
    status: order.status,
    paymentMethod: order.paymentMethod,
    shippingDetails: {
      address: order.shippingDetails?.address || "",
      phone: order.shippingDetails?.phone || "",
      city: order.shippingDetails?.city || "",
    },
    items: order.items.map((item) => ({
      product: item.product.toString(),
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

function validateProductInput({ name, price, description, image, stock }) {
  if (!name?.trim() || !description?.trim() || !image?.trim()) {
    throw createAdminServiceError("Name, description, and image are required.");
  }

  if (Number(price) < 0 || Number.isNaN(Number(price))) {
    throw createAdminServiceError("Price must be a valid number.");
  }

  if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
    throw createAdminServiceError("Stock must be a valid number.");
  }
}

export async function getAdminUsers() {
  await connectDB();

  const users = await User.find().sort({ createdAt: -1 });
  return users.map(serializeUser);
}

export async function updateAdminUser(id, { isBlocked, role }) {
  validateObjectId(id, "Invalid user id.");
  await connectDB();

  const update = {};

  if (typeof isBlocked === "boolean") {
    update.isBlocked = isBlocked;
  }

  if (role && USER_ROLES.includes(role)) {
    update.role = role;
  }

  const user = await User.findByIdAndUpdate(id, update, { new: true });

  if (!user) {
    throw createAdminServiceError("User not found.", 404);
  }

  return serializeUser(user);
}

export async function softDeleteAdminUser(id) {
  validateObjectId(id, "Invalid user id.");
  await connectDB();

  const user = await User.findByIdAndUpdate(
    id,
    { deletedAt: new Date(), isBlocked: true },
    { new: true }
  );

  if (!user) {
    throw createAdminServiceError("User not found.", 404);
  }

  return serializeUser(user);
}

export async function getAdminCategories() {
  await connectDB();

  const categories = await Category.find({ deletedAt: null }).sort({
    createdAt: -1,
  });
  return categories.map(serializeCategory);
}

export async function createAdminCategory({ name, description = "" }) {
  if (!name?.trim()) {
    throw createAdminServiceError("Category name is required.");
  }

  await connectDB();

  const category = await Category.create({
    name: name.trim(),
    description: description.trim(),
  });

  return serializeCategory(category);
}

export async function updateAdminCategory(id, { name, description = "" }) {
  validateObjectId(id, "Invalid category id.");

  if (!name?.trim()) {
    throw createAdminServiceError("Category name is required.");
  }

  await connectDB();

  const category = await Category.findByIdAndUpdate(
    id,
    { name: name.trim(), description: description.trim() },
    { new: true }
  );

  if (!category) {
    throw createAdminServiceError("Category not found.", 404);
  }

  return serializeCategory(category);
}

export async function deleteAdminCategory(id) {
  validateObjectId(id, "Invalid category id.");
  await connectDB();

  const category = await Category.findByIdAndUpdate(
    id,
    { deletedAt: new Date() },
    { new: true }
  );

  if (!category) {
    throw createAdminServiceError("Category not found.", 404);
  }

  await Product.updateMany({ category: id }, { category: null });

  return serializeCategory(category);
}

export async function getAdminProducts() {
  await connectDB();

  const products = await Product.find({ deletedAt: null })
    .populate("category", "name")
    .sort({ createdAt: -1 });

  return products.map(serializeProduct);
}

export async function getAdminOrders() {
  await connectDB();

  const orders = await Order.find()
    .populate("user", "email")
    .sort({ createdAt: -1 });

  return orders.map(serializeOrder);
}

export async function createAdminProduct(payload) {
  validateProductInput(payload);
  await connectDB();

  const product = await Product.create({
    name: payload.name.trim(),
    price: Number(payload.price),
    description: payload.description.trim(),
    image: payload.image.trim(),
    stock: Number(payload.stock),
    category: payload.category || null,
    seller: payload.seller || null,
  });

  await product.populate("category", "name");
  return serializeProduct(product);
}

export async function updateAdminProduct(id, payload) {
  validateObjectId(id, "Invalid product id.");
  validateProductInput(payload);
  await connectDB();

  const product = await Product.findByIdAndUpdate(
    id,
    {
      name: payload.name.trim(),
      price: Number(payload.price),
      description: payload.description.trim(),
      image: payload.image.trim(),
      stock: Number(payload.stock),
      category: payload.category || null,
      seller: payload.seller || null,
    },
    { new: true }
  ).populate("category", "name");

  if (!product) {
    throw createAdminServiceError("Product not found.", 404);
  }

  return serializeProduct(product);
}

export async function deleteAdminProduct(id) {
  validateObjectId(id, "Invalid product id.");
  await connectDB();

  const product = await Product.findByIdAndDelete(id).populate(
    "category",
    "name"
  );

  if (!product) {
    throw createAdminServiceError("Product not found.", 404);
  }

  return serializeProduct(product);
}
