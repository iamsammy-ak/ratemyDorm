import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";

import { HousingBadge } from "@/components/residence/housing-badge";
import type { ResidenceListItem } from "@/lib/residence-service";
import { cn, formatCurrencyEUR } from "@/lib/utils";

type ResidenceCardProps = {
  residence: ResidenceListItem;
  className?: string;
};

const cityLabelMap: Record<ResidenceListItem["city"], string> = {
  TURIN: "Turin",
  MILAN: "Milan",
  OTHER: "Italy",
};

function formatRating(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "—";
  return value.toFixed(1);
}

function formatReviewCount(count: number): string {
  if (!Number.isFinite(count) || count <= 0) return "No reviews yet";
  return `${new Intl.NumberFormat("en-IT").format(count)} review${count === 1 ? "" : "s"}`;
}

function formatRentRange(min: number | null, max: number | null): string {
  if (typeof min !== "number" && typeof max !== "number") return "Rent not listed";
  if (typeof min === "number" && typeof max === "number") {
    return `${formatCurrencyEUR(min)} - ${formatCurrencyEUR(max)}/month`;
  }
  if (typeof min === "number") return `From ${formatCurrencyEUR(min)}/month`;
  return `Up to ${formatCurrencyEUR(max as number)}/month`;
}

export default function ResidenceCard({ residence, className }: ResidenceCardProps) {
  const cityLabel = cityLabelMap[residence.city] ?? "Italy";
  const ratingLabel = formatRating(residence.averageOverallRating);
  const coverUrl = residence.coverPhotoUrl;

  return (
    <article
      className={cn(
        "glass-card overflow-hidden transition-transform duration-200 hover:-translate-y-0.5",
        className,
      )}
    >
      <Link
        href={`/residences/${residence.slug}`}
        className="block no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <div className="relative h-44 w-full bg-gradient-to-br from-slate-100 via-slate-50 to-brand-50">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={`${residence.name} cover photo`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : null}
        </div>
      </Link>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 text-base font-semibold text-slate-900">
            <Link
              href={`/residences/${residence.slug}`}
              className="no-underline hover:text-brand-700"
            >
              {residence.name}
            </Link>
          </h3>
          <HousingBadge type={residence.housingType} />
        </div>

        <p className="inline-flex items-center gap-1.5 text-sm text-slate-600">
          <MapPin className="h-4 w-4 text-slate-400" />
          {cityLabel}
        </p>

        <p className="line-clamp-1 text-sm text-slate-600">{residence.address}</p>

        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 text-amber-600">
            <Star className="h-4 w-4 fill-current" />
            <span className="font-semibold text-slate-900">{ratingLabel}</span>
            <span className="text-slate-500">· {formatReviewCount(residence.totalReviews)}</span>
          </div>
        </div>

        <p className="text-sm font-medium text-slate-700">
          {formatRentRange(residence.minMonthlyRent, residence.maxMonthlyRent)}
        </p>
      </div>
    </article>
  );
}