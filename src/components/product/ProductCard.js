import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/cart/AddToCartButton";
import FavoriteButton from "@/components/favorite/FavoriteButton";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function ProductCard({ product }) {
  return (
    <Card className="flex h-full flex-col overflow-hidden p-0">
      <Link href={`/products/${product.id}`} className="block">
        <div className="aspect-4/3 overflow-hidden rounded-t-xl bg-slate-100">
          <Image
            src={product.image}
            alt={product.name}
            width={640}
            height={480}
            unoptimized
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-2">
          <Link href={`/products/${product.id}`}>
            <h2 className="line-clamp-2 text-xl text-center mb-1 font-semibold text-slate-100 hover:text-violet-700">
              {product.name}
            </h2>
          </Link>
          <p className="line-clamp-3 text-sm leading-6 text-slate-300">
            {product.description}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-slate-100">
              ${product.price.toFixed(2)}
            </p>
            <p className="text-xs text-slate-300">{product.stock} in stock</p>
          </div>
        <FavoriteButton productId={product.id} />
        </div>
        <AddToCartButton product={product} size="md"  />

      </div>
    </Card>
  );
}
