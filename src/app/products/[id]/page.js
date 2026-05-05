import Image from "next/image";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/cart/AddToCartButton";
import FavoriteButton from "@/components/favorite/FavoriteButton";
import ReviewSection from "@/components/review/ReviewSection";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { getProductById } from "@/services/product.service";

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
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-md shadow-slate-200/60">
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
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Product details
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {product.name}
          </h1>
          <p className="text-2xl font-bold text-slate-950">
            ${product.price.toFixed(2)}
          </p>
        </div>

        <p className="leading-7 text-slate-600">{product.description}</p>

        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
          <span className="font-semibold text-slate-950">{product.stock}</span>{" "}
          items available
        </div>

        <div className="flex flex-wrap gap-3">
          <AddToCartButton product={product} />
          <FavoriteButton productId={product.id} size="md" />
          <Button href="/products" variant="secondary">
            Back to Products
          </Button>
        </div>
      </Card>

      <ReviewSection productId={product.id} />
    </section>
  );
}
