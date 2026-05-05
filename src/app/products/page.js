"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ProductsPage() {
  const [filters, setFilters] = useState({
    search: "",
    minPrice: "",
    maxPrice: "",
    category: "",
  });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function fetchProducts(nextFilters = filters) {
    setError("");
    setIsLoading(true);

    const params = new URLSearchParams();

    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    try {
      const queryString = params.toString();
      const response = await fetch(
        queryString ? `/api/products?${queryString}` : "/api/products"
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load products.");
      }

      setProducts(data.products);
    } catch (error) {
      setError(error.message);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    fetchProducts(filters);
  }

  function handleReset() {
    const nextFilters = { search: "", minPrice: "", maxPrice: "", category: "" };
    setFilters(nextFilters);
    fetchProducts(nextFilters);
  }

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch("/api/products", { signal: controller.signal }),
          fetch("/api/categories", { signal: controller.signal }),
        ]);
        const [data, categoriesData] = await Promise.all([
          productsResponse.json(),
          categoriesResponse.json(),
        ]);

        if (!productsResponse.ok) {
          throw new Error(data.message || "Failed to load products.");
        }

        if (!categoriesResponse.ok) {
          throw new Error(categoriesData.message || "Failed to load categories.");
        }

        setProducts(data.products);
        setCategories(categoriesData.categories);
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error.message);
          setProducts([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Products
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Browse our products
        </h1>
        <p className="max-w-2xl text-slate-600">
          Search by product name, category, or price.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-md shadow-slate-200/60 md:grid-cols-[1fr_170px_140px_140px_auto_auto]"
      >
        <Input
          name="search"
          value={filters.search}
          onChange={handleChange}
          placeholder="Search products"
        />
        <Input
          name="minPrice"
          type="number"
          min="0"
          value={filters.minPrice}
          onChange={handleChange}
          placeholder="Min price"
        />
        <Input
          name="maxPrice"
          type="number"
          min="0"
          value={filters.maxPrice}
          onChange={handleChange}
          placeholder="Max price"
        />
        <select
          name="category"
          value={filters.category}
          onChange={handleChange}
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <Button type="submit" disabled={isLoading}>
          Search
        </Button>
        <Button type="button" variant="secondary" onClick={handleReset}>
          Reset
        </Button>
      </form>

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="rounded-xl bg-white p-6 text-center text-sm text-slate-600 shadow-md shadow-slate-200/60">
          Loading products...
        </p>
      ) : null}

      {!isLoading && products.length === 0 && !error ? (
        <p className="rounded-xl bg-white p-6 text-center text-sm text-slate-600 shadow-md shadow-slate-200/60">
          No products found.
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
