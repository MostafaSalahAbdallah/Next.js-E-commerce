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

const emptyCategory = {
  name: "",
  description: "",
};

export default function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [editingProductId, setEditingProductId] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  function handleProductChange(event) {
    const { name, value } = event.target;
    setProductForm((current) => ({ ...current, [name]: value }));
  }

  function handleCategoryChange(event) {
    const { name, value } = event.target;
    setCategoryForm((current) => ({ ...current, [name]: value }));
  }

  function resetProductForm() {
    setProductForm(emptyProduct);
    setEditingProductId("");
  }

  function resetCategoryForm() {
    setCategoryForm(emptyCategory);
    setEditingCategoryId("");
  }

  async function refreshAdminData() {
    setError("");

    const [usersResponse, productsResponse, categoriesResponse] =
      await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
      ]);

    const [usersData, productsData, categoriesData] = await Promise.all([
      usersResponse.json(),
      productsResponse.json(),
      categoriesResponse.json(),
    ]);

    if (!usersResponse.ok) {
      throw new Error(usersData.message || "Failed to load users.");
    }

    if (!productsResponse.ok) {
      throw new Error(productsData.message || "Failed to load products.");
    }

    if (!categoriesResponse.ok) {
      throw new Error(categoriesData.message || "Failed to load categories.");
    }

    setUsers(usersData.users);
    setProducts(productsData.products);
    setCategories(categoriesData.categories);
  }

  async function submitProduct(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        editingProductId
          ? `/api/admin/products/${editingProductId}`
          : "/api/admin/products",
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
      await refreshAdminData();
    } catch (error) {
      setError(error.message);
    }
  }

  async function submitCategory(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        editingCategoryId
          ? `/api/admin/categories/${editingCategoryId}`
          : "/api/admin/categories",
        {
          method: editingCategoryId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(categoryForm),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save category.");
      }

      resetCategoryForm();
      setMessage(data.message);
      await refreshAdminData();
    } catch (error) {
      setError(error.message);
    }
  }

  async function updateUser(userId, payload) {
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update user.");
      }

      setMessage(data.message);
      await refreshAdminData();
    } catch (error) {
      setError(error.message);
    }
  }

  async function deleteResource(type, id) {
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/${type}/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to delete ${type}.`);
      }

      setMessage(data.message);
      await refreshAdminData();
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

  function editCategory(category) {
    setEditingCategoryId(category.id);
    setCategoryForm({
      name: category.name,
      description: category.description,
    });
  }

  useEffect(() => {
    const controller = new AbortController();

    async function loadAdminData() {
      try {
        const [usersResponse, productsResponse, categoriesResponse] =
          await Promise.all([
            fetch("/api/admin/users", { signal: controller.signal }),
            fetch("/api/admin/products", { signal: controller.signal }),
            fetch("/api/admin/categories", { signal: controller.signal }),
          ]);

        const [usersData, productsData, categoriesData] = await Promise.all([
          usersResponse.json(),
          productsResponse.json(),
          categoriesResponse.json(),
        ]);

        if (!usersResponse.ok) {
          throw new Error(usersData.message || "Failed to load users.");
        }

        if (!productsResponse.ok) {
          throw new Error(productsData.message || "Failed to load products.");
        }

        if (!categoriesResponse.ok) {
          throw new Error(categoriesData.message || "Failed to load categories.");
        }

        setUsers(usersData.users);
        setProducts(productsData.products);
        setCategories(categoriesData.categories);
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

    loadAdminData();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Admin
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Dashboard
        </h1>
        <p className="max-w-2xl text-slate-600">
          Manage users, products, and categories from one protected panel.
        </p>
      </div>

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}

      {isLoading ? (
        <p className="rounded-xl bg-white p-6 text-center text-sm text-slate-600 shadow-md shadow-slate-200/60">
          Loading admin dashboard...
        </p>
      ) : null}

      {!isLoading ? (
        <>
          <div className="grid gap-5 md:grid-cols-3">
            <Card>
              <p className="text-sm text-slate-500">Users</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {users.length}
              </p>
            </Card>
            <Card>
              <p className="text-sm text-slate-500">Products</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {products.length}
              </p>
            </Card>
            <Card>
              <p className="text-sm text-slate-500">Categories</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {categories.length}
              </p>
            </Card>
          </div>

          <Card className="space-y-5 overflow-x-auto">
            <h2 className="text-xl font-semibold text-slate-950">
              Manage Users
            </h2>
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 pr-4 font-semibold">Email</th>
                  <th className="py-3 pr-4 font-semibold">Role</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                  <th className="py-3 pr-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="py-3 pr-4 text-slate-950">{user.email}</td>
                    <td className="py-3 pr-4">
                      <select
                        value={user.role}
                        onChange={(event) =>
                          updateUser(user.id, { role: event.target.value })
                        }
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {user.deletedAt
                        ? "Deleted"
                        : user.isBlocked
                          ? "Blocked"
                          : "Active"}
                    </td>
                    <td className="flex gap-2 py-3 pr-4">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          updateUser(user.id, { isBlocked: !user.isBlocked })
                        }
                      >
                        {user.isBlocked ? "Unblock" : "Block"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteResource("users", user.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
            <Card className="space-y-5">
              <h2 className="text-xl font-semibold text-slate-950">
                {editingCategoryId ? "Edit Category" : "Add Category"}
              </h2>
              <form onSubmit={submitCategory} className="space-y-4">
                <Input
                  name="name"
                  value={categoryForm.name}
                  onChange={handleCategoryChange}
                  placeholder="Category name"
                  required
                />
                <textarea
                  name="description"
                  value={categoryForm.description}
                  onChange={handleCategoryChange}
                  placeholder="Description"
                  className="min-h-24 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
                <div className="flex gap-2">
                  <Button type="submit">
                    {editingCategoryId ? "Update" : "Create"}
                  </Button>
                  {editingCategoryId ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={resetCategoryForm}
                    >
                      Cancel
                    </Button>
                  ) : null}
                </div>
              </form>
            </Card>

            <Card className="space-y-5 overflow-x-auto">
              <h2 className="text-xl font-semibold text-slate-950">
                Manage Categories
              </h2>
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-3 pr-4 font-semibold">Name</th>
                    <th className="py-3 pr-4 font-semibold">Description</th>
                    <th className="py-3 pr-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="py-3 pr-4 font-medium text-slate-950">
                        {category.name}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {category.description || "-"}
                      </td>
                      <td className="flex gap-2 py-3 pr-4">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => editCategory(category)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            deleteResource("categories", category.id)
                          }
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
            <Card className="space-y-5">
              <h2 className="text-xl font-semibold text-slate-950">
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
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
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
                  className="min-h-28 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
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
              <h2 className="text-xl font-semibold text-slate-950">
                Manage Products
              </h2>
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
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
                      <td className="py-3 pr-4 font-medium text-slate-950">
                        {product.name}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {product.category?.name || "-"}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        ${Number(product.price).toFixed(2)}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {product.stock}
                      </td>
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
                          onClick={() => deleteResource("products", product.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </>
      ) : null}
    </section>
  );
}
