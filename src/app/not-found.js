import Link from "next/link";

export default function notfound() {
  return (
    <div className="min-h-screen bg-[#0b0f14] flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-extrabold text-[#744577] opacity-20">404</h1>
          <div className="-mt-16">
            <h2 className="text-3xl font-bold text-gray-300 tracking-tight">
              Lost in the shop?
            </h2>
            <p className="mt-4 text-base text-gray-100">
              We couldn't find the page you’re looking for. It might have been moved, 
              or the product is currently out of stock,<strong>or you may not be registered.</strong>
            </p>
          </div>
        </div>

        {/* Primary Action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#744577] hover:bg-[#5d375f] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#744577]"
          >
            Back to Home
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-800 text-base font-medium rounded-md text-black bg-white hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Helpful Links/Categories */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Popular Categories
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <Link href="/new-arrivals" className="text-[#744577] hover:underline font-medium">New Arrivals</Link>
            <Link href="/best-sellers" className="text-[#744577] hover:underline font-medium">Best Sellers</Link>
            <Link href="/deals" className="text-[#744577] hover:underline font-medium">Clearance Sale</Link>
            <Link href="/support" className="text-[#744577] hover:underline font-medium">Customer Support</Link>
          </div>
        </div>
      </div>
    </div>
  );
}