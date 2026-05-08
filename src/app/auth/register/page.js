"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "customer",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setMessage(data.message || "Registration successful!");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md">
      <Card className="space-y-6 p-6 sm:p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Create account in AX<span className="text-violet-900">O</span>
          </h1>
          <p className="text-sm text-slate-300">
              Register to save your cart and orders.
            </p>
          </div>

          {error ? (
            <p className="rounded-xl bg-red-950 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          ) : null}

          {message ? (
            <div className="space-y-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-violet-700">
              <p>{message}</p>
              <p className="text-xs text-violet-600">Check your Gmail for the 4-digit verification code and enter it on the verification screen.</p>
              <Link href="/auth/verify" className="inline-flex rounded-full bg-[#744577]/10 px-4 py-2 text-sm font-semibold text-[#744577] transition hover:bg-[#744577]/20">
                Verify your email
              </Link>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-300">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium text-slate-300">
                Account type
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-800 bg-[0b0f14] px-4 text-sm text-slate-600 shadow-sm focus:border-violet-900 focus:outline-none focus:ring-2 focus:ring-violet-600/20 mt-0.5"
              >
                <option value="customer">Customer</option>
                <option value="seller">Seller</option>
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-300"
              >
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || Boolean(message)}>
              {isLoading ? "Creating account..." : "Register"}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Login
          </Link>
        </p>
      </Card>
    </section>
  );
}
