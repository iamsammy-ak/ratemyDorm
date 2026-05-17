import Image from "next/image";
import { format } from "date-fns";
import { Star, ThumbsUp } from "lucide-react";

import type { ResidenceReview, ReviewerType } from "@/lib/types";
import { cn } from "@/lib/utils";

type ReviewFeedProps = {
  reviews: ResidenceReview[];
  className?: string;
  emptyStateMessage?: string;
};

const reviewerTypeStyles: Record<ReviewerType, string> = {
  ERASMUS_STUDENT: "bg-blue-50 text-blue-700 border-blue-200",
  INTERNATIONAL_STUDENT: "bg-violet-50 text-violet-700 border-violet-200",
  ITALIAN_STUDENT: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PHD_STUDENT: "bg-amber-50 text-amber-700 border-amber-200",
  OTHER: "bg-slate-100 text-slate-700 border-slate-200",
};

function reviewerTypeLabel(type: ReviewerType): string {
  switch (type) {
    case "ERASMUS_STUDENT": return "Erasmus Student";
    case "INTERNATIONAL_STUDENT": return "International Student";
    case "ITALIAN_STUDENT": return "Italian Student";
    case "PHD_STUDENT": return "PhD Student";
    default: return "Student";
  }
}

function RatingStars({ value }: { value: number }) {
  return (
    <div
      className="inline-flex items-center gap-1"
      aria-label={`${value.toFixed(1)} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.round(value);
        return (
          <Star
            key={`star-${i}`}
            className={cn(
              "h-4 w-4",
              filled ? "fill-amber-400 text-amber-400" : "text-slate-300",
            )}
          />
        );
      })}
    </div>
  );
}

function ReviewCard({ review }: { review: ResidenceReview }) {
  const createdAt = format(new Date(review.createdAt), "MMM yyyy");
  const reviewerLabel = reviewerTypeLabel(review.reviewer.reviewerType);
  const reviewerBadgeClass = reviewerTypeStyles[review.reviewer.reviewerType];
  const tags =
    review.reviewer.tags?.filter((tag) => tag !== reviewerLabel) ?? [];

  return (
    <article className="glass-card p-5 md:p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
            {review.reviewer.avatarUrl ? (
              <Image
                src={review.reviewer.avatarUrl}
                alt={`${review.reviewer.displayName} avatar`}
                fill
                className="object-cover"
                sizes="40px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-500">
                {review.reviewer.displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {review.reviewer.displayName}
            </p>
            <p className="text-xs text-slate-500">
              Reviewed {createdAt}
              {review.livedHereYear
                ? ` · Lived here ${review.livedHereYear}`
                : ""}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5">
          <RatingStars value={review.overallRating} />
          <span className="text-sm font-semibold text-slate-800">
            {review.overallRating.toFixed(1)}
          </span>
        </div>
      </header>

      <div className="mt-3 flex flex-wrap gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
            reviewerBadgeClass,
          )}
        >
          {reviewerLabel}
        </span>

        {tags.map((tag) => (
          <span
            key={`${review.id}-${tag}`}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600"
          >
            {tag}
          </span>
        ))}
      </div>

      {review.title ? (
        <h3 className="mt-4 text-base font-semibold text-slate-900">
          {review.title}
        </h3>
      ) : null}

      <p className="mt-2 text-sm leading-relaxed text-slate-700">
        {review.body}
      </p>

      <footer className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-500">
          {review.wouldRecommend === null || review.wouldRecommend === undefined
            ? "Community feedback"
            : review.wouldRecommend
              ? "Would recommend"
              : "Would not recommend"}
        </p>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          Helpful ({review.helpfulCount})
        </button>
      </footer>
    </article>
  );
}

export function ReviewFeed({
  reviews,
  className,
  emptyStateMessage = "No reviews yet. Be the first student to share your experience.",
}: ReviewFeedProps) {
  if (reviews.length === 0) {
    return (
      <section className={cn("glass-card p-8 text-center", className)}>
        <p className="text-sm text-slate-600">{emptyStateMessage}</p>
      </section>
    );
  }

  return (
    <section
      className={cn("space-y-4", className)}
      aria-label="Student reviews feed"
    >
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </section>
  );
}

export default ReviewFeed;