"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function CartSummary({ items }) {
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-950">Cart Summary</h2>

      <div className="space-y-3 text-sm text-slate-600">
        <div className="flex items-center justify-between">
          <span>Items</span>
          <span>{totalItems}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-950">
          <span>Total</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {items.length > 0 ? (
        <Button href="/checkout" className="w-full">
          Checkout
        </Button>
      ) : (
        <Button className="w-full" disabled>
          Checkout
        </Button>
      )}
    </Card>
  );
}
