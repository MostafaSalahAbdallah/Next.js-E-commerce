"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

export default function VerifyEmailPage() {
  const [formData, setFormData] = useState({ email: "", code: "" });
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
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verification failed.");
      }

      setMessage(data.message || "Email verified successfully.");
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
            Verify your email
          </h1>
          <p className="text-sm text-slate-300">
            Enter the 4-digit code sent to your Gmail to activate your account.
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
            <p className="text-xs text-violet-600">
              Your email is now verified. You can login below.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex rounded-full bg-[#744577]/10 px-4 py-2 text-sm font-semibold text-[#744577] transition hover:bg-[#744577]/20"
            >
              Go to login
            </Link>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-300">
              Registered email
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
            <label htmlFor="code" className="text-sm font-medium text-slate-300">
              Verification code
            </label>
            <Input
              id="code"
              name="code"
              type="text"
              value={formData.code}
              onChange={handleChange}
              placeholder="1234"
              maxLength={4}
              pattern="\d{4}"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || Boolean(message)}>
            {isLoading ? "Verifying..." : "Verify email"}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-600">
          Didn’t receive the code? Check your spam folder or try registering again.
        </p>
      </Card>
    </section>
  );
}
