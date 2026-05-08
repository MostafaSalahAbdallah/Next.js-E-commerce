"use client";

import { useState } from "react";
import { MdOutlineFavoriteBorder, MdFavorite } from "react-icons/md";
import { BsInfoCircleFill } from "react-icons/bs"; 
import Link from "next/link";

export default function ProductActions({
  productId,
  initialFavorited = false,
  onToggle,
}) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);

  async function toggleFavorite() {
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

      if (response.ok) {
        const nextFavorited = !isFavorited;
        setIsFavorited(nextFavorited);
        onToggle?.(nextFavorited);
      }
    } catch (error) {
      console.error("Favorite Error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleFavorite}
        disabled={isLoading}
        aria-label="Favorite"
        className={`
          flex items-center justify-center p-2 rounded-full transition-all active:scale-90
          ${isFavorited 
            ? "bg-[#744577]/10 text-[#744577]" 
            : "bg-gray-100 text-gray-400 hover:text-[#744577] hover:bg-gray-200"}
        `}
      >
        {isFavorited ? (
          <MdFavorite className="w-5 h-5" />
        ) : (
          <MdOutlineFavoriteBorder className="w-5 h-5" />
        )}
      </button>

      <Link
        href={`/products/${productId}`}
        aria-label="View Details"
        className="flex items-center justify-center p-2 rounded-full bg-gray-600 text-gray-400 hover:bg-[#744577]/10 hover:text-[#744577] transition-all active:scale-90"
      >
        <BsInfoCircleFill className="w-5 h-5" />
      </Link>
    </div>
  );
}