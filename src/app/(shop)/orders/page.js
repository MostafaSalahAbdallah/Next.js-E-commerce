"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

function formatDate(dateValue) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  processing: "bg-sky-50 text-sky-800 border-sky-200",
  shipped: "bg-indigo-50 text-indigo-800 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-50 text-red-800 border-red-200",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOrders() {
      setError("");
      setIsLoading(true);

      try {
        const response = await fetch("/api/orders/user", {
          signal: controller.signal,
        });
        const data = await response.json();

        if (response.status === 401) {
          throw new Error("Please login to view your orders.");
        }

        if (!response.ok) {
          throw new Error(data.message || "Failed to load orders.");
        }

        setOrders(data.orders || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error.message);
          setOrders([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadOrders();

    return () => controller.abort();
  }, []);

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-violet-700">
          Orders
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
          Order history
        </h1>
        <p className="max-w-2xl text-slate-400">
          Track previous purchases and order statuses.
        </p>
      </div>

      {error ? (
        <Card className="space-y-4 border-red-200 bg-red-50">
          <p className="text-sm font-semibold text-red-800">{error}</p>
          <div className="flex flex-wrap gap-3">
            <Button href="/auth/login">Login</Button>
            <Button href="/products" variant="secondary">
              Browse Products
            </Button>
          </div>
        </Card>
      ) : null}

      {isLoading ? (
        <p className="rounded-xl bg-white p-6 text-center text-sm text-slate-600 shadow-md shadow-slate-200/60">
          Loading orders...
        </p>
      ) : null}

      {!isLoading && !error && orders.length === 0 ? (
        <Card className="space-y-4 text-center">
          <h2 className="text-lg font-semibold text-slate-100">No orders yet</h2>
          <p className="text-sm text-slate-600">
            Checkout your cart to create an order.
          </p>
          <div className="flex justify-center gap-3">
            <Button href="/products">Browse Products</Button>
            <Button href="/cart" variant="secondary">
              View Cart
            </Button>
          </div>
        </Card>
      ) : null}

      {!isLoading && !error && orders.length > 0 ? (
        <div className="space-y-5">
          {orders.map((order) => {
            const statusClass =
              STATUS_STYLES[order.status] ||
              "bg-slate-50 text-slate-800 border-slate-200";

            return (
              <Card key={order.id} className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-950">
                      Order #{order.id}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={[
                        "rounded-full border px-3 py-1 text-xs font-semibold",
                        statusClass,
                      ].join(" ")}
                    >
                      {order.status}
                    </span>
                    <p className="text-sm font-bold text-slate-950">
                      ${Number(order.total).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div
                      key={`${order.id}-${item.product}-${index}`}
                      className="grid grid-cols-[64px_1fr_auto] gap-3 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="overflow-hidden rounded-xl bg-slate-100">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={128}
                          height={128}
                          unoptimized
                          className="aspect-square h-full w-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-950">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          Qty {item.quantity} x ${Number(item.price).toFixed(2)}
                        </p>
                        <div className="pt-1">
                          <Link
                            href={`/products/${item.product}`}
                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                          >
                            View product
                          </Link>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-slate-950">
                        ${Number(item.subtotal).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm">
                  <div className="text-slate-600">
                    Payment:{" "}
                    <span className="font-semibold text-slate-950">
                      {order.paymentMethod === "cash_on_delivery"
                        ? "Cash on Delivery"
                        : "Card"}
                    </span>
                  </div>
                  <Button href="/products" size="sm" variant="secondary">
                    Continue shopping
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

