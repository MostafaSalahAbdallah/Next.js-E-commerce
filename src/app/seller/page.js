"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

const emptyProduct = {
  name: "",
  price: "",
  description: "",
  image: "",
  stock: "",
  category: "",
};

export default function SellerDashboardPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingProductId, setEditingProductId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  function handleProductChange(event) {
    const { name, value } = event.target;
    setProductForm((current) => ({ ...current, [name]: value }));
  }

  function resetProductForm() {
    setProductForm(emptyProduct);
    setEditingProductId("");
  }

  async function refreshSellerData(signal) {
    setError("");

    const [productsResponse, categoriesResponse] = await Promise.all([
      fetch("/api/seller/products", signal ? { signal } : undefined),
      fetch("/api/seller/categories", signal ? { signal } : undefined),
    ]);

    const [productsData, categoriesData] = await Promise.all([
      productsResponse.json(),
      categoriesResponse.json(),
    ]);

    if (!productsResponse.ok) {
      throw new Error(productsData.message || "Failed to load your products.");
    }

    if (!categoriesResponse.ok) {
      throw new Error(categoriesData.message || "Failed to load categories.");
    }

    setProducts(productsData.products || []);
    setCategories(categoriesData.categories || []);
  }

  async function submitProduct(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        editingProductId
          ? `/api/seller/products/${editingProductId}`
          : "/api/seller/products",
        {
          method: editingProductId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productForm),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save product.");
      }

      resetProductForm();
      setMessage(data.message);
      await refreshSellerData();
    } catch (error) {
      setError(error.message);
    }
  }

  async function deleteProduct(productId) {
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/seller/products/${productId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete product.");
      }

      if (editingProductId === productId) {
        resetProductForm();
      }

      setMessage(data.message);
      await refreshSellerData();
    } catch (error) {
      setError(error.message);
    }
  }

  function editProduct(product) {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.image,
      stock: product.stock,
      category: product.category?.id || "",
    });
  }

  useEffect(() => {
    const controller = new AbortController();

    async function loadSellerData() {
      try {
        await refreshSellerData(controller.signal);
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadSellerData();

    return () => controller.abort();
  }, []);

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-violet-700">
          Seller
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
          Dashboard
        </h1>
        <p className="max-w-2xl text-slate-300">
          Create, update, and remove your products.
        </p>
      </div>

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-violet-700">
          {message}
        </p>
      ) : null}

      {isLoading ? (
        <p className="rounded-xl bg-white p-6 text-center text-sm text-slate-200 shadow-md shadow-slate-200/60">
          Loading seller dashboard...
        </p>
      ) : null}

      {!isLoading ? (
        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <Card className="space-y-5">
            <h2 className="text-xl font-semibold text-slate-100">
              {editingProductId ? "Edit Product" : "Add Product"}
            </h2>
            <form onSubmit={submitProduct} className="space-y-4">
              <Input
                name="name"
                value={productForm.name}
                onChange={handleProductChange}
                placeholder="Product name"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={productForm.price}
                  onChange={handleProductChange}
                  placeholder="Price"
                  required
                />
                <Input
                  name="stock"
                  type="number"
                  min="0"
                  value={productForm.stock}
                  onChange={handleProductChange}
                  placeholder="Stock"
                  required
                />
              </div>
              <Input
                name="image"
                value={productForm.image}
                onChange={handleProductChange}
                placeholder="Image URL"
                required
              />
              <select
                name="category"
                value={productForm.category}
                onChange={handleProductChange}
                className="h-11 w-full rounded-xl border border-slate-300 bg-slate-900 px-4 text-sm text-slate-100 shadow-sm focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-600/20"
              >
                <option value="">No category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <textarea
                name="description"
                value={productForm.description}
                onChange={handleProductChange}
                placeholder="Description"
                className="min-h-28 w-full rounded-xl border border-slate-300 bg-slate-900 px-4 py-3 text-sm text-slate-100 shadow-sm focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-600/20"
                required
              />
              <div className="flex gap-2">
                <Button type="submit">
                  {editingProductId ? "Update" : "Create"}
                </Button>
                {editingProductId ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={resetProductForm}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </Card>

          <Card className="space-y-5 overflow-x-auto">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-100">
                Manage Products
              </h2>
              <p className="text-sm text-slate-300">{products.length} products</p>
            </div>

            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-200">
                <tr>
                  <th className="py-3 pr-4 font-semibold">Name</th>
                  <th className="py-3 pr-4 font-semibold">Category</th>
                  <th className="py-3 pr-4 font-semibold">Price</th>
                  <th className="py-3 pr-4 font-semibold">Stock</th>
                  <th className="py-3 pr-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="py-3 pr-4 font-medium text-slate-100">
                      {product.name}
                    </td>
                    <td className="py-3 pr-4 text-slate-200">
                      {product.category?.name || "-"}
                    </td>
                    <td className="py-3 pr-4 text-slate-200">
                      ${Number(product.price).toFixed(2)}
                    </td>
                    <td className="py-3 pr-4 text-slate-200">{product.stock}</td>
                    <td className="flex gap-2 py-3 pr-4">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => editProduct(product)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteProduct(product.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {products.length === 0 ? (
              <p className="text-sm text-slate-400">No products yet.</p>
            ) : null}
          </Card>
        </div>
      ) : null}
    </section>
  );
}

