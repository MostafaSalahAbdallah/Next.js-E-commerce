"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import OrderSummary from "@/components/order/OrderSummary";
import StripePaymentForm from "@/components/payment/StripePaymentForm";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export default function CheckoutPage() {
  const [items, setItems] = useState([]);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [cardSetupError, setCardSetupError] = useState("");

  async function placeCashOrder() {
    setError("");
    setSuccess("");
    setIsPlacingOrder(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to place order.");
      }

      setItems([]);
      setSuccess(`Cash on Delivery order #${data.order.id} placed successfully.`);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsPlacingOrder(false);
    }
  }

  function handlePaidOrderSuccess(order) {
    setItems([]);
    setSuccess(`Paid order #${order.id} placed successfully.`);
  }

  useEffect(() => {
    const controller = new AbortController();

    async function loadCart() {
      try {
        const response = await fetch("/api/cart", {
          signal: controller.signal,
        });
        const data = await response.json();

        if (response.status === 401) {
          throw new Error("Please login before checkout.");
        }

        if (!response.ok) {
          throw new Error(data.message || "Failed to load checkout.");
        }

        setItems(data.cart.items);
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error.message);
          setItems([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadCart();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function prepareCardPayment() {
      if (paymentMethod !== "stripe") return;
      if (!stripePublishableKey) {
        setClientSecret("");
        setCardSetupError("Card payment is not configured. Use Cash on Delivery.");
        return;
      }
      if (items.length === 0) return;
      if (clientSecret) return;

      setCardSetupError("");

      try {
        const paymentResponse = await fetch("/api/payments/create-intent", {
          method: "POST",
          signal: controller.signal,
        });
        const paymentData = await paymentResponse.json();

        if (!paymentResponse.ok) {
          setClientSecret("");
          setCardSetupError(
            paymentData.message || "Failed to prepare card payment."
          );
          return;
        }

        setClientSecret(paymentData.clientSecret || "");
        if (!paymentData.clientSecret) {
          setCardSetupError("Card payment is not available right now.");
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setClientSecret("");
          setCardSetupError(error.message || "Failed to prepare card payment.");
        }
      }
    }

    prepareCardPayment();

    return () => controller.abort();
  }, [paymentMethod, items, clientSecret]);

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-violet-700">
          Checkout
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
          Place your order
        </h1>
        <p className="max-w-2xl text-slate-300">
          Confirm your cart and convert it into an order.
        </p>
      </div>

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {success ? (
        <Card className="space-y-4 border-violet-200 bg-emerald-50">
          <p className="font-semibold text-violet-800">{success}</p>
          <Button href="/products" variant="secondary">
            Continue Shopping
          </Button>
        </Card>
      ) : null}

      {isLoading ? (
        <p className="rounded-xl bg-white p-6 text-center text-sm text-slate-600 shadow-md shadow-slate-200/60">
          Loading checkout...
        </p>
      ) : null}

      {!isLoading && !success && items.length === 0 ? (
        <Card className="space-y-4 text-center">
          <h2 className="text-lg font-semibold text-slate-100">
            No items to checkout
          </h2>
          <p className="text-sm text-slate-300">
            Add products to your cart before placing an order.
          </p>
          <div className="flex justify-center gap-3">
            <Button href="/products">Browse Products</Button>
            <Button href="/auth/login" variant="secondary">
              Login
            </Button>
          </div>
        </Card>
      ) : null}

      {!isLoading && !success && items.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <OrderSummary items={items} />

          <Card className="h-fit space-y-4">
            <h2 className="text-lg font-semibold text-slate-100">Payment</h2>

            <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#0b0f14] p-1">
              <button
                type="button"
                onClick={() => setPaymentMethod("stripe")}
                className={[
                  "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                  paymentMethod === "stripe"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-400",
                ].join(" ")}
              >
                Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("cash_on_delivery")}
                className={[
                  "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                  paymentMethod === "cash_on_delivery"
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-600 hover:text-slate-400",
                ].join(" ")}
              >
                Cash
              </button>
            </div>

            {paymentMethod === "stripe" ? (
              <div className="space-y-4">
                {stripePromise && clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <StripePaymentForm onSuccess={handlePaidOrderSuccess} />
                  </Elements>
                ) : (
                  <div className="space-y-3">
                    {cardSetupError ? (
                      <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        {cardSetupError}
                      </p>
                    ) : (
                      <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
                        Loading card payment...
                      </p>
                    )}

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-semibold text-slate-950">
                          Card number
                        </label>
                        <input
                          disabled
                          placeholder="1234 1234 1234 1234"
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-semibold text-slate-950">
                            Expiry
                          </label>
                          <input
                            disabled
                            placeholder="MM/YY"
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-slate-950">
                            CVC
                          </label>
                          <input
                            disabled
                            placeholder="123"
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                          />
                        </div>
                      </div>
                      <Button type="button" className="w-full" disabled>
                        Pay with Card
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm leading-6 text-slate-600">
                  Pay when your order arrives. The order will be created with a
                  pending status.
                </p>
                <Button
                  type="button"
                  className="w-full"
                  onClick={placeCashOrder}
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? "Placing Order..." : "Place COD Order"}
                </Button>
              </div>
            )}
            <Link
              href="/cart"
              className="block text-center text-sm font-semibold text-slate-600 hover:text-slate-950"
            >
              Back to Cart
            </Link>
          </Card>
        </div>
      ) : null}
    </section>
  );
}
