"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import AddToCartButton from "@/components/cart/AddToCartButton";
import FavoriteButton from "@/components/favorite/FavoriteButton";

function normalizeFavorites(favorites = []) {
  return favorites.map((favorite) => favorite.product).filter(Boolean);
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const products = useMemo(() => normalizeFavorites(favorites), [favorites]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadFavorites() {
      setError("");
      setIsLoading(true);

      try {
        const response = await fetch("/api/favorites", {
          signal: controller.signal,
        });
        const data = await response.json();

        if (response.status === 401) {
          throw new Error("Please login to view your favorites.");
        }

        if (!response.ok) {
          throw new Error(data.message || "Failed to load favorites.");
        }

        setFavorites(data.favorites || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error.message);
          setFavorites([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadFavorites();

    return () => controller.abort();
  }, []);

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-violet-700">
          Favorites
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
          Saved products
        </h1>
        <p className="max-w-2xl text-slate-600">
          Keep track of items you want to purchase later.
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
          Loading favorites...
        </p>
      ) : null}

      {!isLoading && !error && products.length === 0 ? (
        <Card className="space-y-4 text-center">
          <h2 className="text-lg font-semibold text-slate-100">
            No favorites yet
          </h2>
          <p className="text-sm text-slate-400">
            Start exploring products and save the ones you love.
          </p>
          <div className="flex justify-center gap-3">
            <Button href="/products">Browse Products</Button>
          </div>
        </Card>
      ) : null}

      {!isLoading && !error && products.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="flex h-full flex-col p-0">
              <Link href={`/products/${product.id}`} className="block">
                <div className="aspect-4/3 overflow-hidden rounded-t-xl bg-slate-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={640}
                    height={480}
                    unoptimized
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </Link>

              <div className="flex flex-1 flex-col gap-4 p-5">
                <div className="space-y-2">
                  <Link href={`/products/${product.id}`}>
                    <h2 className="line-clamp-2 text-xl text-center font-semibold text-slate-100 hover:text-violet-700">
                      {product.name}
                    </h2>
                  </Link>
                  <p className="line-clamp-3 text-sm leading-6 text-slate-400">
                    {product.description}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold text-slate-100">
                      ${product.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-300">
                      {product.stock} in stock
                    </p>
                  </div>
                  <Button
                    href={`/products/${product.id}`}
                    size="sm"
                    variant="secondary"
                  >
                    Details
                  </Button>
                </div>

                <AddToCartButton product={product} size="sm" />
                <FavoriteButton
                  productId={product.id}
                  initialFavorited
                  onToggle={(next) => {
                    if (!next) {
                      setFavorites((current) =>
                        current.filter((fav) => fav.product?.id !== product.id)
                      );
                    }
                  }}
                />
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}

