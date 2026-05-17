import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  Globe,
  GraduationCap,
  MapPin,
  MessageSquare,
  Upload,
} from "lucide-react";

import { HousingBadge } from "@/components/residence/housing-badge";
import PhotoGallery from "@/components/residence/photo-gallery";
import RatingBreakdown from "@/components/residence/rating-breakdown";
import ReviewFeed from "@/components/residence/review-feed";
import StarRating from "@/components/residence/star-rating";
import { getResidenceDetailsBySlug } from "@/lib/residence-service";
import {
  RATING_CATEGORY_LABELS,
  type RatingBreakdown as RatingBreakdownType,
} from "@/lib/types";

type PageProps = {
  params: {
    slug: string;
  };
};

const cityLabelMap: Record<string, string> = {
  TURIN: "Turin",
  MILAN: "Milan",
  OTHER: "Other",
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const residence = await getResidenceDetailsBySlug(params.slug);

  if (!residence) {
    return {
      title: "Residence not found",
    };
  }

  const city = cityLabelMap[residence.city] ?? "Italy";

  return {
    title: `${residence.name} · ${city}`,
    description: `${residence.name} in ${city}. Compare official and student photos, 6-category rating breakdown, and crowdsourced student reviews.`,
  };
}

function CategoryMiniGrid({ ratings }: { ratings: RatingBreakdownType }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Object.entries(RATING_CATEGORY_LABELS).map(([key, label]) => {
        const score = ratings[key as keyof RatingBreakdownType] ?? 0;

        return (
          <div
            key={key}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2"
          >
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {score.toFixed(1)} / 5
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default async function ResidenceDetailsPage({ params }: PageProps) {
  const residence = await getResidenceDetailsBySlug(params.slug);

  if (!residence) {
    notFound();
  }

  const cityLabel = cityLabelMap[residence.city] ?? "Italy";
  const isPublic = residence.operator.housingType === "PUBLIC_REGIONAL";

  const areaLabel = residence.areaLabel
    ? `${cityLabel} · ${residence.areaLabel}`
    : cityLabel;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <section className="glass-card p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <HousingBadge type={residence.operator.housingType} />
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                {cityLabel}
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                {areaLabel}
              </span>
            </div>

            <div>
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                {residence.name}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4 text-slate-400" />
                {residence.address}
              </p>
            </div>

            {residence.description ? (
              <p className="max-w-3xl text-sm leading-relaxed text-slate-700 md:text-base">
                {residence.description}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <StarRating
                value={residence.stats.averageOverallRating}
                size={18}
              />
              <span className="text-sm text-slate-600">
                {residence.stats.totalReviews} review
                {residence.stats.totalReviews === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <div className="w-full max-w-sm space-y-3 lg:shrink-0">
            <Link
              href={`/review/new?residence=${residence.slug}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white no-underline transition hover:bg-brand-700"
            >
              <MessageSquare className="h-4 w-4" />
              Write a Review
            </Link>

            <Link
              href={`/review/new?residence=${residence.slug}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 no-underline transition hover:bg-slate-50"
            >
              <Upload className="h-4 w-4" />
              Upload Student Photos
            </Link>

            {residence.websiteUrl ? (
              <a
                href={residence.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 no-underline transition hover:bg-slate-100"
              >
                <Globe className="h-4 w-4" />
                Official Website
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <PhotoGallery
        officialPhotos={residence.photos.official}
        studentPhotos={residence.photos.student}
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <RatingBreakdown
          ratings={residence.stats.ratingBreakdown}
          averageOverallRating={residence.stats.averageOverallRating}
          totalReviews={residence.stats.totalReviews}
        />

        <aside className="space-y-4">
          <article className="glass-card p-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Residence Snapshot
            </h2>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <p className="flex items-start gap-2">
                <Building2 className="mt-0.5 h-4 w-4 text-slate-400" />
                <span>
                  <span className="font-semibold text-slate-900">
                    Operator:
                  </span>{" "}
                  {residence.operator.operatorName ?? "N/A"}
                </span>
              </p>

              <p className="flex items-start gap-2">
                <GraduationCap className="mt-0.5 h-4 w-4 text-slate-400" />
                <span>
                  <span className="font-semibold text-slate-900">Type:</span>{" "}
                  {isPublic
                    ? "Public / Regional (DSU / EDISU)"
                    : "Private Student Housing"}
                </span>
              </p>

              <p className="text-slate-600">
                Students can compare official marketing galleries with
                student-uploaded photos to understand real room, kitchen, and
                bathroom conditions before applying.
              </p>
            </div>
          </article>

          <article className="glass-card p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              6-Category Scores
            </h3>
            <div className="mt-3">
              <CategoryMiniGrid ratings={residence.stats.ratingBreakdown} />
            </div>
          </article>
        </aside>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="section-title">Student Reviews</h2>
            <p className="mt-1 text-sm text-slate-600">
              Reviews are loaded from the database and rendered with native
              typed review integration.
            </p>
          </div>
        </div>

        <ReviewFeed reviews={residence.reviews} />
      </section>
    </div>
  );
}