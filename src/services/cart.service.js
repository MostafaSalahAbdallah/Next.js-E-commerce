import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

function createCartError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validateObjectId(id, message) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createCartError(message, 400);
  }
}

function normalizeQuantity(quantity) {
  const nextQuantity = Number(quantity);

  if (!Number.isInteger(nextQuantity) || nextQuantity < 1) {
    throw createCartError("Quantity must be a positive number.");
  }

  return nextQuantity;
}

function serializeCart(cart) {
  const items = cart.items
    .filter((item) => item.product)
    .map((item) => ({
      product: {
        id: item.product._id.toString(),
        name: item.product.name,
        price: item.product.price,
        image: item.product.image,
        stock: item.product.stock,
      },
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    }));

  return {
    id: cart._id.toString(),
    user: cart.user.toString(),
    items,
    totalItems: items.reduce((total, item) => total + item.quantity, 0),
    totalPrice: items.reduce((total, item) => total + item.subtotal, 0),
  };
}

async function getOrCreateCart(userId) {
  validateObjectId(userId, "Invalid user id.");

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  return cart;
}

async function getPopulatedCart(userId) {
  const cart = await getOrCreateCart(userId);

  await cart.populate({
    path: "items.product",
    select: "name price image stock",
  });

  return serializeCart(cart);
}

export async function getCart(userId) {
  await connectDB();
  return getPopulatedCart(userId);
}

export async function addToCart(userId, { productId, quantity = 1 }) {
  validateObjectId(productId, "Invalid product id.");
  const nextQuantity = normalizeQuantity(quantity);

  await connectDB();

  const product = await Product.findById(productId);

  if (!product) {
    throw createCartError("Product not found.", 404);
  }

  if (product.stock < nextQuantity) {
    throw createCartError("Requested quantity exceeds available stock.");
  }

  const cart = await getOrCreateCart(userId);
  const existingItem = cart.items.find((item) => {
    return item.product.toString() === productId;
  });

  if (existingItem) {
    const updatedQuantity = existingItem.quantity + nextQuantity;

    if (updatedQuantity > product.stock) {
      throw createCartError("Requested quantity exceeds available stock.");
    }

    existingItem.quantity = updatedQuantity;
  } else {
    cart.items.push({ product: productId, quantity: nextQuantity });
  }

  await cart.save();
  return getPopulatedCart(userId);
}

export async function updateCartItem(userId, productId, { quantity }) {
  validateObjectId(productId, "Invalid product id.");
  const nextQuantity = normalizeQuantity(quantity);

  await connectDB();

  const product = await Product.findById(productId);

  if (!product) {
    throw createCartError("Product not found.", 404);
  }

  if (nextQuantity > product.stock) {
    throw createCartError("Requested quantity exceeds available stock.");
  }

  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((cartItem) => {
    return cartItem.product.toString() === productId;
  });

  if (!item) {
    throw createCartError("Cart item not found.", 404);
  }

  item.quantity = nextQuantity;
  await cart.save();

  return getPopulatedCart(userId);
}

export async function removeCartItem(userId, productId) {
  validateObjectId(productId, "Invalid product id.");

  await connectDB();

  const cart = await getOrCreateCart(userId);
  cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  await cart.save();

  return getPopulatedCart(userId);
}

export async function clearCart(userId) {
  await connectDB();

  const cart = await getOrCreateCart(userId);
  cart.items = [];
  await cart.save();

  return getPopulatedCart(userId);
}
