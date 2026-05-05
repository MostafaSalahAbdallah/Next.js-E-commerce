"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Verifying email...");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    async function verifyEmail() {
      if (!token) {
        setError("Verification token is missing.");
        setStatus("");
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Email verification failed.");
        }

        setStatus("Email verified. Redirecting...");
        router.push(data.user?.role === "seller" ? "/seller" : "/");
        router.refresh();
      } catch (error) {
        setError(error.message);
        setStatus("");
      }
    }

    verifyEmail();
  }, [router, searchParams]);

  return (
    <section className="mx-auto max-w-md">
      <Card className="space-y-5 p-6 text-center sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">
          Email verification
        </h1>
        {status ? <p className="text-sm text-slate-600">{status}</p> : null}
        {error ? (
          <>
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
            <Button href="/auth/register" variant="secondary">
              Register Again
            </Button>
          </>
        ) : null}
      </Card>
    </section>
  );
}
