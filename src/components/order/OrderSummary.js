"use client";

import Image from "next/image";
import Card from "@/components/ui/Card";

export default function OrderSummary({ items }) {
  const total = items.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  return (
    <Card className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Order Summary</h2>
        <p className="mt-1 text-sm text-slate-600">
          Review your items before placing the order.
        </p>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="grid grid-cols-[64px_1fr_auto] gap-3 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0"
          >
            <div className="overflow-hidden rounded-xl bg-slate-100">
              <Image
                src={item.product.image}
                alt={item.product.name}
                width={128}
                height={128}
                unoptimized
                className="aspect-square h-full w-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-950">
                {item.product.name}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Qty {item.quantity} x ${item.product.price.toFixed(2)}
              </p>
            </div>
            <p className="text-sm font-semibold text-slate-950">
              ${(item.product.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t border-slate-200 pt-4 text-sm">
        <div className="flex items-center justify-between text-slate-600">
          <span>Subtotal</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span>Shipping</span>
          <span>Free</span>
        </div>
        <div className="flex items-center justify-between text-base font-bold text-slate-950">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </Card>
  );
}
