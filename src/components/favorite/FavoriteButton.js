"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export default function FavoriteButton({
  productId,
  initialFavorited = false,
  size = "sm",
}) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function toggleFavorite() {
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        isFavorited ? `/api/favorites?productId=${productId}` : "/api/favorites",
        {
          method: isFavorited ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: isFavorited ? undefined : JSON.stringify({ productId }),
        }
      );
      const data = await response.json();

      if (response.status === 401) {
        throw new Error("Login to save favorites.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to update favorites.");
      }

      setIsFavorited((current) => !current);
      setMessage(isFavorited ? "Removed from favorites." : "Saved to favorites.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        size={size}
        variant={isFavorited ? "secondary" : "ghost"}
        onClick={toggleFavorite}
        disabled={isLoading}
      >
        {isLoading ? "Saving..." : isFavorited ? "Favorited" : "Favorite"}
      </Button>
      {message ? <p className="text-xs text-slate-600">{message}</p> : null}
    </div>
  );
}
