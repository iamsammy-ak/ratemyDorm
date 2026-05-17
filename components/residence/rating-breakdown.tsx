"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

type RatingCategoryKey =
  | "wifiConnectivity"
  | "cleanliness"
  | "socialVibeCommunity"
  | "locationSafety"
  | "amenities"
  | "valueForMoney";

export type RatingBreakdownValue = Record<RatingCategoryKey, number>;

type RatingBreakdownProps = {
  ratings: RatingBreakdownValue;
  averageOverallRating?: number;
  totalReviews?: number;
  className?: string;
};

const CATEGORY_CONFIG: Array<{
  key: RatingCategoryKey;
  label: string;
  shortLabel: string;
}> = [
  { key: "wifiConnectivity", label: "Wi-Fi & Connectivity", shortLabel: "Wi-Fi" },
  { key: "cleanliness", label: "Cleanliness", shortLabel: "Cleanliness" },
  { key: "socialVibeCommunity", label: "Social Vibe & Community", shortLabel: "Social Vibe" },
  { key: "locationSafety", label: "Location & Safety", shortLabel: "Location" },
  { key: "amenities", label: "Amenities", shortLabel: "Amenities" },
  { key: "valueForMoney", label: "Value for Money", shortLabel: "Value" },
];

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(5, Math.max(0, value));
}

function scoreToPercent(score: number): number {
  return (clampScore(score) / 5) * 100;
}

function formatScore(score: number): string {
  return clampScore(score).toFixed(1);
}

export default function RatingBreakdown({
  ratings,
  averageOverallRating,
  totalReviews,
  className,
}: RatingBreakdownProps) {
  const radarData = CATEGORY_CONFIG.map((category) => ({
    subject: category.shortLabel,
    score: clampScore(ratings[category.key] ?? 0),
    fullMark: 5,
  }));

  const safeOverall =
    averageOverallRating !== undefined
      ? clampScore(averageOverallRating)
      : CATEGORY_CONFIG.reduce((sum, category) => {
          return sum + clampScore(ratings[category.key] ?? 0);
        }, 0) / CATEGORY_CONFIG.length;

  return (
    <section
      className={[
        "glass-card p-5 md:p-6",
        className ? className : "",
      ].join(" ")}
      aria-labelledby="rating-breakdown-title"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="rating-breakdown-title"
            className="text-lg font-semibold text-slate-900 md:text-xl"
          >
            Rating breakdown
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Crowdsourced scores across 6 categories
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Overall
          </p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-semibold text-slate-900">
              {formatScore(safeOverall)}
            </p>
            <p className="pb-0.5 text-sm text-slate-500">/ 5</p>
          </div>
          {typeof totalReviews === "number" ? (
            <p className="text-xs text-slate-500">{totalReviews} reviews</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {CATEGORY_CONFIG.map((category) => {
            const score = clampScore(ratings[category.key] ?? 0);
            const percent = scoreToPercent(score);

            return (
              <div key={category.key} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-700">
                    {category.label}
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatScore(score)}
                  </p>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-coral-500 transition-all duration-500"
                    style={{ width: `${percent}%` }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-[280px] rounded-2xl border border-slate-200 bg-white p-3">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="72%">
              <PolarGrid stroke="#dbe3ef" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#475569", fontSize: 12, fontWeight: 500 }}
              />
              <Radar
                name="Average rating"
                dataKey="score"
                stroke="#2f7dff"
                fill="#2f7dff"
                fillOpacity={0.28}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}