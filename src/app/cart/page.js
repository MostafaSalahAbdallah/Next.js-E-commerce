"use client";

import { useEffect, useState } from "react";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import Button from "@/components/ui/Button";
import {
  getGuestCart,
  removeGuestCartItem,
  updateGuestCartItem,
} from "@/lib/cart-storage";

export default function CartPage() {
  const [cartType, setCartType] = useState("guest");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  function normalizeItems(cartItems) {
    return cartItems.map((item) => ({
      product: item.product,
      quantity: item.quantity,
    }));
  }

  async function updateQuantity(productId, quantity) {
    const nextQuantity = Number(quantity);

    if (!Number.isInteger(nextQuantity) || nextQuantity < 1) {
      return;
    }

    if (cartType === "guest") {
      setItems(normalizeItems(updateGuestCartItem(productId, nextQuantity)));
      return;
    }

    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: nextQuantity }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update cart.");
      }

      setItems(normalizeItems(data.cart.items));
    } catch (error) {
      setError(error.message);
    }
  }

  async function removeItem(productId) {
    if (cartType === "guest") {
      setItems(normalizeItems(removeGuestCartItem(productId)));
      return;
    }

    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove item.");
      }

      setItems(normalizeItems(data.cart.items));
    } catch (error) {
      setError(error.message);
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    async function loadInitialCart() {
      try {
        const response = await fetch("/api/cart", {
          signal: controller.signal,
        });

        if (response.status === 401) {
          setCartType("guest");
          setItems(normalizeItems(getGuestCart()));
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load cart.");
        }

        setCartType("user");
        setItems(normalizeItems(data.cart.items));
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

    loadInitialCart();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-violet-700">
            Cart
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
            Shopping cart
          </h1>
          <p className="text-slate-400">
            {cartType === "guest"
              ? "Your guest cart is saved in this browser."
              : "Your cart is saved to your account."}
          </p>
        </div>
        <Button href="/products" variant="secondary">
          Continue Shopping
        </Button>
      </div>

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="rounded-xl bg-[#0b0f14] p-6 text-center text-sm text-slate-600 shadow-violet-950 shadow-xs">
          Loading cart...
        </p>
      ) : null}

      {!isLoading && items.length === 0 ? (
        <div className="rounded-xl bg-[#0f1620] p-8 text-center shadow-slate-900 shadow-xs">
          <h2 className="text-lg font-semibold text-slate-100">
            Your cart is empty
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Add products to your cart and they will appear here.
          </p>
        </div>
      ) : null}

      {!isLoading && items.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {items.map((item) => (
              <CartItem
                key={item.product.id}
                item={item}
                onRemove={removeItem}
                onUpdateQuantity={updateQuantity}
              />
            ))}
          </div>

          <CartSummary items={items} />
        </div>
      ) : null}
    </section>
  );
}
