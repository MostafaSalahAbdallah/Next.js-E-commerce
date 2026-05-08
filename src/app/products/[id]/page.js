import { IoIosArrowBack } from "react-icons/io"; 
import { BiArrowBack } from "react-icons/bi"; 
import { TiArrowBack } from "react-icons/ti";
import Image from "next/image";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/cart/AddToCartButton";
import FavoriteButton from "@/components/favorite/FavoriteButton";
import ReviewSection from "@/components/review/ReviewSection";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { getProductById } from "@/services/product.service";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProductDetailsPage({ params }) {
  const { id } = await params;
  let product;

  try {
    product = await getProductById(id);
  } catch (error) {
    if (error.status === 404 || error.status === 400) {
      notFound();
    }

    throw error;
  }

  return (
    <section className="grid gap-8 lg:grid-cols-2">
      <div className="overflow-hidden rounded-xl border border-slate-900 bg-slate-900 shadow-md shadow-slate-900/60">
        <Image
          src={product.image}
          alt={product.name}
          width={900}
          height={900}
          unoptimized
          className="aspect-square h-full w-full object-cover"
        />
      </div>

      <Card className="flex flex-col justify-center gap-6 p-6 sm:p-8">
        <div className="space-y-3">
          <p className="text-lg font-semibold uppercase tracking-wide text-violet-100">
            Product details
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
            {product.name}
          </h1>
          <p className="text-2xl font-bold text-yellow-300">
            ${product.price.toFixed(2)}
          </p>
        </div>

        <p className="leading-7 text-slate-200">{product.description}</p>

        <div className="rounded-2xl bg-slate-900 p-4 text-sm text-slate-200">
          <span className="font-semibold text-green-200">{product.stock}</span>{" "}
          items available
        </div>

        <div className="flex flex-wrap gap-3">
          <AddToCartButton product={product} />
          <FavoriteButton productId={product.id} size="md" />
          <Link href="/products">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-400 hover:text-[#744577] hover:bg-[#744577]/10 transition-all active:scale-90 shadow-sm">
              <IoIosArrowBack className="text-2xl" />
            </div>
          </Link>
        </div>
      </Card>

      <ReviewSection productId={product.id} />
    </section>
  );
}
