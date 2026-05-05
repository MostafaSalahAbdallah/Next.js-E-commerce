"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "./Button";
import Container from "./Container";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/favorites", label: "Favorites" },
  { href: "/orders", label: "Orders" },
  { href: "/cart", label: "Cart" },
];

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          signal: controller.signal,
        });

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        if (error.name !== "AbortError") {
          setUser(null);
        }
      }
    }

    loadUser();

    return () => {
      controller.abort();
    };
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <Container>
        <nav className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-slate-950"
          >
            Ecommerce
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
              >
                {link.label}
              </Link>
            ))}
            {user?.role === "admin" ? (
              <Link
                href="/admin"
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
              >
                Admin
              </Link>
            ) : null}
            {user?.role === "seller" ? (
              <Link
                href="/seller"
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
              >
                Seller
              </Link>
            ) : null}
          </div>

          {user ? (
            <Button type="button" size="sm" variant="secondary" onClick={logout}>
              Logout
            </Button>
          ) : (
            <Button href="/auth/login" size="sm">
              Login
            </Button>
          )}
        </nav>
      </Container>
    </header>
  );
}
