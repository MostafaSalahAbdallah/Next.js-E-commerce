"use client";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useState } from "react";
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
async function  fetchingAllDataNeeded (){
  const [categories, setCategories] = useState([]);
  const [productForm, setProductForm] = useState(emptyProduct);
const [usersResponse, productsResponse, categoriesResponse] =
      await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
      ]);
    }
    fetchingAllDataNeeded();
export default function HomePage() {
  return (
    <section className="space-y-10">
      <div className="grid gap-8 rounded-xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/60 md:grid-cols-[1.2fr_0.8fr] md:p-10">
        <div className="flex flex-col justify-center gap-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Shop smarter
            </p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Accessories Store
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              The best bags and many others accessories you would found in Egypt.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button href="/products" >Start Shopping</Button>
            <Button href="/auth/login" variant="secondary">
              Sign In
            </Button>
          </div>
        </div>

        <div className="grid content-center gap-3 rounded-xl bg-slate-950 p-5 text-white">
          <p className="text-sm font-medium text-emerald-300">Store preview</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-2xl font-bold">product</p>
              <p className="text-sm text-slate-300">Products</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-2xl font-bold">+120</p>
              <p className="text-sm text-slate-300">Categories</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {featuredCategories.map((category) => (
          <Card key={category.title}>
            <h2 className="text-lg font-semibold text-slate-950">
              {category.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {category.description}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
