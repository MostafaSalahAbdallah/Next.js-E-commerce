"use client";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";

import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function ReviewSection({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ count: 0, averageRating: 0 });
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0); 
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadReviews = useCallback(async (signal) => {
    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        signal,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load reviews.");
      }

      setReviews(data.reviews);
      setSummary(data.summary);
    } catch (err) {
      if (err.name !== "AbortError") throw err;
    }
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
      setRating(5);
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
        setError(error.message);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialReviews();
    return () => controller.abort();
  }, [loadReviews]);

  return (
    <Card className="space-y-6 lg:col-span-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#744577]">
            Reviews
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-100">
            Customer ratings
          </h2>
        </div>
        <div className="rounded-xl bg-slate-950 px-4 py-3 text-sm text-slate-400">
          <span className="font-bold text-[#744577]">
            {summary.averageRating.toFixed(1)}
          </span>{" "}
          / 5 from {summary.count} reviews
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{error}</p>}
      {message && <p className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">{message}</p>}

      <form onSubmit={submitReview} className="space-y-4 rounded-xl bg-slate-950 p-6 border border-slate-800">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Your Rating</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHover(value)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform active:scale-90 focus:outline-none"
              >
                {value <= (hover || rating) ? (
                  <AiFillStar className="h-8 w-8 text-[#744577]" />
                ) : (
                  <AiOutlineStar className="h-8 w-8 text-slate-600 hover:text-[#744577]/50" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="review-comment" className="text-sm font-medium text-slate-300">
            Review
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you think of the product?"
            className="min-h-28 w-full rounded-xl border border-slate-700 bg-[#0f1620] px-4 py-3 text-sm text-slate-100 focus:border-[#744577] focus:ring-1 focus:ring-[#744577] outline-none transition-all"
            required
          />
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="bg-[#744577] hover:bg-[#5d375f] text-white w-full sm:w-auto"
        >
          {isSubmitting ? "Saving..." : "Submit Review"}
        </Button>
      </form>

      <div className="space-y-4 pt-6">
        {isLoading ? (
          <p className="text-center py-10 text-slate-500 animate-pulse">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-center py-10 text-slate-500 border border-dashed border-slate-800 rounded-xl">No reviews yet. Be the first!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-slate-200">{review.user.email.split('@')[0]}</p>
                  <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <AiFillStar key={s} className={`h-4 w-4 ${s <= review.rating ? "text-yellow-300" : "text-slate-900"}`} />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}