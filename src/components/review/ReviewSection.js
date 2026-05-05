"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function ReviewSection({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ count: 0, averageRating: 0 });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadReviews = useCallback(async (signal) => {
    const response = await fetch(`/api/products/${productId}/reviews`, {
      signal,
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load reviews.");
    }

    setReviews(data.reviews);
    setSummary(data.summary);
  }, [productId]);

  async function submitReview(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save review.");
      }

      setComment("");
      setMessage(data.message);
      await loadReviews();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    async function loadInitialReviews() {
      try {
        await loadReviews(controller.signal);
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialReviews();

    return () => {
      controller.abort();
    };
  }, [loadReviews]);

  return (
    <Card className="space-y-6 lg:col-span-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Reviews
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            Customer ratings
          </h2>
        </div>
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <span className="font-bold text-slate-950">
            {summary.averageRating.toFixed(1)}
          </span>{" "}
          / 5 from {summary.count} reviews
        </div>
      </div>

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}

      <form onSubmit={submitReview} className="space-y-4 rounded-xl bg-slate-50 p-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Rating</label>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className={[
                  "h-10 w-10 rounded-xl text-sm font-bold transition-colors",
                  rating === value
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-100",
                ].join(" ")}
                aria-label={`${value} out of 5`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="review-comment"
            className="text-sm font-medium text-slate-700"
          >
            Review
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Share your experience with this product"
            className="min-h-28 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            required
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Submit Review"}
        </Button>
      </form>

      {isLoading ? (
        <p className="text-center text-sm text-slate-600">Loading reviews...</p>
      ) : null}

      {!isLoading && reviews.length === 0 ? (
        <p className="rounded-xl border border-slate-200 p-4 text-sm text-slate-600">
          No reviews yet.
        </p>
      ) : null}

      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-xl border border-slate-200 p-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-950">
                  {review.user.email}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
              <p className="rounded-xl bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
                {review.rating} / 5
              </p>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {review.comment}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
