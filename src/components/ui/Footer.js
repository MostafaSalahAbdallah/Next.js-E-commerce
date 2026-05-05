import Link from "next/link";
import Container from "./Container";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <Container>
        <div className="flex flex-col gap-4 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 Ecommerce. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <Link href="/products" className="hover:text-slate-950">
              Products
            </Link>
            <Link href="/cart" className="hover:text-slate-950">
              Cart
            </Link>
            <Link href="/auth/login" className="hover:text-slate-950">
              Login
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
