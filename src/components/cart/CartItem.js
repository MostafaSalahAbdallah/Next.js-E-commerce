"use client";

import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function CartItem({ item, onRemove, onUpdateQuantity }) {
  const { product, quantity } = item;

  return (
    <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-md shadow-slate-200/60 sm:grid-cols-[120px_1fr_auto]">
      <Link
        href={`/products/${product.id}`}
        className="block overflow-hidden rounded-xl bg-slate-100"
      >
        <Image
          src={product.image}
          alt={product.name}
          width={240}
          height={240}
          unoptimized
          className="aspect-square h-full w-full object-cover"
        />
      </Link>

      <div className="space-y-2">
        <Link href={`/products/${product.id}`}>
          <h2 className="font-semibold text-slate-100 hover:text-violet-200 text-center text-xl">
            {product.name}
          </h2>
        </Link>
        <p className="text-sm text-slate-400">${product.price.toFixed(2)}</p>
        <p className="text-xs text-slate-300">{product.stock} in stock</p>
      </div>

      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
        <Input
          type="number"
          min="1"
          max={product.stock}
          value={quantity}
          onChange={(event) => {
            onUpdateQuantity(product.id, event.target.value);
          }}
          className="w-24"
          aria-label={`Quantity for ${product.name}`}
        />
        <p className="min-w-20 text-right font-semibold text-slate-100">
          ${(product.price * quantity).toFixed(2)}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(product.id)}
        >
          Remove
        </Button>
      </div>
    </div>
  );
}
