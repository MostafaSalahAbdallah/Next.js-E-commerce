import Stripe from "stripe";
import Cart from "@/models/Cart";
import connectDB from "@/lib/db";
import { createOrderFromCart } from "@/services/order.service";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

function createPaymentError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getStripe() {
  if (!STRIPE_SECRET_KEY) {
    throw createPaymentError("STRIPE_SECRET_KEY is required.", 500);
  }

  return new Stripe(STRIPE_SECRET_KEY);
}

async function getCartTotal(userId) {
  await connectDB();

  const cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    select: "name price stock",
  });

  if (!cart || cart.items.length === 0) {
    throw createPaymentError("Cart is empty.");
  }

  return cart.items.reduce((total, item) => {
    if (!item.product) {
      throw createPaymentError("A product in your cart is no longer available.");
    }

    if (item.quantity > item.product.stock) {
      throw createPaymentError(`${item.product.name} does not have enough stock.`);
    }

    return total + item.product.price * item.quantity;
  }, 0);
}

export async function createCartPaymentIntent(userId) {
  const stripe = getStripe();
  const total = await getCartTotal(userId);
  const amount = Math.round(total * 100);

  if (amount < 50) {
    throw createPaymentError("Order total is too low for card payment.");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: { userId },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
}

export async function createPaidOrderFromPayment(
  userId,
  paymentIntentId,
  shippingDetails = {}
) {
  if (!paymentIntentId) {
    throw createPaymentError("Payment intent id is required.");
  }

  const stripe = getStripe();
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.metadata.userId !== userId) {
    throw createPaymentError("Payment does not belong to this user.", 403);
  }

  if (paymentIntent.status !== "succeeded") {
    throw createPaymentError("Payment has not succeeded yet.");
  }

  return createOrderFromCart(userId, {
    status: "processing",
    paymentMethod: "stripe",
    paymentIntentId,
    shippingDetails,
  });
}
