"use client";

import { useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import Button from "@/components/ui/Button";

export default function StripePaymentForm({ onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error: submitError } = await elements.submit();

      if (submitError) {
        throw new Error(submitError.message || "Payment details are invalid.");
      }

      const { error: confirmError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          redirect: "if_required",
        });

      if (confirmError) {
        throw new Error(confirmError.message || "Payment failed.");
      }

      if (paymentIntent?.status !== "succeeded") {
        throw new Error("Payment was not completed.");
      }

      const response = await fetch("/api/payments/success", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to place paid order.");
      }

      onSuccess(data.order);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        className="w-full"
        disabled={!stripe || !elements || isProcessing}
      >
        {isProcessing ? "Processing..." : "Pay with Card"}
      </Button>
    </form>
  );
}
