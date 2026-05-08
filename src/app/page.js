"use client";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useEffect, useState } from "react";
const featuredCategories = [
  {
    title: "New Arrivals",
    description: "Fresh products added for the latest shopping season.",
  },
  {
    title: "Best Sellers",
    description: "Popular picks trusted by customers across the store.",
  },
  {
    title: "Exclusive Deals",
    description: "Limited offers curated for better value and faster checkout.",
  },
];
export default function HomePage() {
  const [counts, setCounts] = useState({ products: 0, categories: 0 });
  const [countError, setCountError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadCounts() {
      setCountError("");

      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch("/api/products", { signal: controller.signal }),
          fetch("/api/categories", { signal: controller.signal }),
        ]);

        const [productsData, categoriesData] = await Promise.all([
          productsResponse.json(),
          categoriesResponse.json(),
        ]);

        if (!productsResponse.ok) {
          throw new Error(productsData.message || "Failed to load products.");
        }

        if (!categoriesResponse.ok) {
          throw new Error(categoriesData.message || "Failed to load categories.");
        }

        setCounts({
          products: Array.isArray(productsData.products)
            ? productsData.products.length
            : 0,
          categories: Array.isArray(categoriesData.categories)
            ? categoriesData.categories.length
            : 0,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          setCountError(error.message);
        }
      }
    }

    loadCounts();

    return () => controller.abort();
  }, []);

  return (
    
    <section className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
  <div className="relative group">
    <img src="https://images.pexels.com/photos/4573596/pexels-photo-4573596.jpeg" className="rounded-lg shadow-lg object-cover" alt="Corsair Keyboard"/>
    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
  </div>
  <div className="relative group">
    <img src="https://images.pexels.com/photos/34552789/pexels-photo-34552789.jpeg" className="rounded-lg shadow-lg" alt="Corsair Keyboard"/>
    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
  </div>
 
 
</div>
      <div className="grid gap-8 rounded-xl border border-[#744577]/15 bg-[#0b0f14] p-6 shadow-md shadow-[#744577]/10 md:grid-cols-[1.2fr_0.8fr] md:p-10">
        <div className="flex flex-col justify-center gap-6">
          <div className="space-y-3">
            <p className="text-xl font-semibold uppercase tracking-wide text-[#744577]">
              Best deals here!
            </p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl">
              Computer Store
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              The home of computer parts in Egypt.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button href="/products" >Start Shopping</Button>
            <Button href="/auth/login" variant="secondary">
              Sign In
            </Button>
          </div>
        </div>

        <div className="grid content-center gap-3 rounded-xl bg-[#744577] p-5 text-white">
          <p className=" font-medium text-slate-200 text-center text-xl">Store preview</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-2xl font-bold">{counts.products}</p>
              <p className="text-sm text-white/80">Products</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-2xl font-bold">{counts.categories}</p>
              <p className="text-sm text-white/80">Categories</p>
            </div>
          </div>
          {countError ? (
            <p className="text-xs text-[#f0e9b6] opacity-90">{countError}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {featuredCategories.map((category) => (
          <Card key={category.title}>
            <h2 className="text-lg font-semibold text-slate-300">
              {category.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {category.description}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
