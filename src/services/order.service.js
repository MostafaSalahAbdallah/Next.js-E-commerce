import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Cart from "@/models/Cart";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import {
  sendOrderPlacedEmail,
  sendOrderStatusEmail,
} from "@/services/email.service";

export const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function createOrderError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validateObjectId(id, message) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createOrderError(message, 400);
  }
}

function normalizeShippingDetails(shippingDetails = {}) {
  const details = {
    address: shippingDetails.address?.trim() || "",
    phone: shippingDetails.phone?.trim() || "",
    city: shippingDetails.city?.trim() || "",
  };

  return details;
}

function serializeOrder(order) {
  const items = order.items.map((item) => ({
    product: item.product.toString(),
    name: item.name,
    price: item.price,
    image: item.image,
    quantity: item.quantity,
    subtotal: item.price * item.quantity,
  }));

  return {
    id: order._id.toString(),
    user: order.user.toString(),
    items,
    total: order.total,
    status: order.status,
    shippingDetails: {
      address: order.shippingDetails?.address || "",
      phone: order.shippingDetails?.phone || "",
      city: order.shippingDetails?.city || "",
    },
    paymentMethod: order.paymentMethod,
    paymentIntentId: order.paymentIntentId,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

export async function createOrderFromCart(
  userId,
  {
    status = "pending",
    paymentMethod = "cash_on_delivery",
    paymentIntentId = "",
    shippingDetails = {},
  } = {}
) {
  validateObjectId(userId, "Invalid user id.");

  if (!ORDER_STATUSES.includes(status)) {
    throw createOrderError("Invalid order status.");
  }

  await connectDB();

  const cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    select: "name price image stock",
  });

  if (!cart || cart.items.length === 0) {
    throw createOrderError("Cart is empty.");
  }

  const orderItems = cart.items.map((item) => {
    if (!item.product) {
      throw createOrderError("A product in your cart is no longer available.");
    }

    if (item.quantity > item.product.stock) {
      throw createOrderError(`${item.product.name} does not have enough stock.`);
    }

    return {
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      quantity: item.quantity,
    };
  });

  const total = orderItems.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  const order = await Order.create({
    user: userId,
    items: orderItems,
    total,
    status,
    shippingDetails: normalizeShippingDetails(shippingDetails),
    paymentMethod,
    paymentIntentId,
  });

  await Promise.all(
    orderItems.map((item) => {
      return Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    })
  );

  cart.items = [];
  await cart.save();

  const serializedOrder = serializeOrder(order);
  const user = await User.findById(userId).select("email");
  await sendOrderPlacedEmail(user?.email, serializedOrder);

  return serializedOrder;
}

export async function getOrders(userId) {
  validateObjectId(userId, "Invalid user id.");
  await connectDB();

  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
  return orders.map(serializeOrder);
}

export async function getUserOrders(userId) {
  return getOrders(userId);
}

export async function getOrderById(orderId, requester) {
  validateObjectId(orderId, "Invalid order id.");
  await connectDB();

  const order = await Order.findById(orderId);

  if (!order) {
    throw createOrderError("Order not found.", 404);
  }

  const ownsOrder = order.user.toString() === requester.id;

  if (!ownsOrder && requester.role !== "admin") {
    throw createOrderError("You are not allowed to view this order.", 403);
  }

  return serializeOrder(order);
}

export async function updateOrderStatus(orderId, status) {
  validateObjectId(orderId, "Invalid order id.");

  if (!ORDER_STATUSES.includes(status)) {
    throw createOrderError("Invalid order status.");
  }

  await connectDB();

  const order = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  );

  if (!order) {
    throw createOrderError("Order not found.", 404);
  }

  const serializedOrder = serializeOrder(order);
  const user = await User.findById(order.user).select("email");
  await sendOrderStatusEmail(user?.email, serializedOrder);

  return serializedOrder;
}
