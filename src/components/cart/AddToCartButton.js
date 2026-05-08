"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { addGuestCartItem } from "@/lib/cart-storage";

export default function AddToCartButton({ product, className = "", size = "md" }) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleAddToCart() {
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });

      if (response.status === 401) {
        addGuestCartItem(
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            stock: product.stock,
          },
          1
        );
        setMessage("Added to guest cart.");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add product.");
      }

      setMessage("Added to cart.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={["space-y-2", className].filter(Boolean).join(" ")}>
      <Button
        type="button"
        size={size}
        className="w-full"
        onClick={handleAddToCart}
        disabled={isLoading || product.stock < 1}
      >
        {isLoading ? "Adding..." : "Add to Cart"}
      </Button>
      {message ? <p className="text-xs text-green-200">{message}</p> : null}
    </div>
  );
}
