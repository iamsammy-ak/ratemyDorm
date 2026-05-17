import type { Metadata } from "next";
import Link from "next/link";
import { City, HousingType } from "@prisma/client";
import { Filter, Search } from "lucide-react";

import ResidenceCard from "@/components/residence/residence-card";
import { getResidenceListings } from "@/lib/residence-service";

export const metadata: Metadata = {
  title: "Residences",
  description:
    "Browse student residences in Italy, including public/DSU and private options with community reviews.",
};

type ResidencesPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseCity(value?: string): City | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toUpperCase();

  if (normalized === "TURIN" || normalized === "TORINO") return City.TURIN;
  if (normalized === "MILAN" || normalized === "MILANO") return City.MILAN;
  if (normalized === "OTHER") return City.OTHER;

  return undefined;
}

function parseHousingType(value?: string): HousingType | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toUpperCase();

  if (normalized === "PRIVATE") return HousingType.PRIVATE;
  if (
    normalized === "PUBLIC_DSU" ||
    normalized === "PUBLIC_REGIONAL" ||
    normalized === "PUBLIC"
  ) {
    return HousingType.PUBLIC_REGIONAL;
  }

  return undefined;
}

function toBoolean(value?: string): boolean | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();

  if (normalized === "true" || normalized === "1" || normalized === "yes")
    return true;
  if (normalized === "false" || normalized === "0" || normalized === "no")
    return false;

  return undefined;
}

const cityLabelMap: Record<City, string> = {
  TURIN: "Turin",
  MILAN: "Milan",
  OTHER: "Other Cities",
};

export default async function ResidencesIndexPage({
  searchParams,
}: ResidencesPageProps) {
  const city = parseCity(first(searchParams?.city));
  const housingType = parseHousingType(first(searchParams?.housingType));
  const query = first(searchParams?.q)?.trim();
  const verifiedOnly = toBoolean(first(searchParams?.verifiedOnly));

  let listing: Awaited<ReturnType<typeof getResidenceListings>> | null = null;

  try {
    listing = await getResidenceListings({
      city,
      housingType,
      search: query || undefined,
      verifiedOnly,
      limit: 48,
      offset: 0,
    });
  } catch (error) {
    console.error("Failed to load residences page listing:", {
      city,
      housingType,
      query,
      verifiedOnly,
      error,
    });
  }

  if (!listing) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-10">
        <section className="glass-card p-10 text-center">
          <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
            Residences are temporarily unavailable
          </h1>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            We could not load the residence list right now. Please refresh the
            page in a moment.
          </p>
          <div className="mt-5">
            <Link
              href="/residences"
              className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white no-underline transition hover:bg-brand-700"
            >
              Retry
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-10">
      <section className="glass-card p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Residences
            </h1>
            <p className="mt-2 text-sm text-slate-600 md:text-base">
              Explore verified public/DSU and private student housing across
              Italy.
            </p>
          </div>

          <Link
            href="/add-residence"
            className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white no-underline transition hover:bg-brand-700"
          >
            Add a Residence
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
            <Filter className="h-3.5 w-3.5" />
            Filters
          </span>

          {city ? (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
              City: {cityLabelMap[city]}
            </span>
          ) : null}

          {housingType ? (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
              Type:{" "}
              {housingType === "PUBLIC_REGIONAL" ? "Public / DSU" : "Private"}
            </span>
          ) : null}

          {query ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
              <Search className="h-3.5 w-3.5" />
              {query}
            </span>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            {listing.total} residence{listing.total === 1 ? "" : "s"} found
          </p>
          <Link
            href="/search"
            className="text-sm font-medium text-brand-600 no-underline hover:text-brand-700"
          >
            Open advanced search
          </Link>
        </div>
      </section>

      <section className="mt-6">
        {listing.items.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <h2 className="text-lg font-semibold text-slate-900">
              No residences found
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Try adjusting your filters, or add the residence if it is missing.
            </p>
            <div className="mt-5">
              <Link
                href="/add-residence"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 no-underline transition hover:bg-slate-50"
              >
                Submit a new residence
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-auto-fill-cards gap-4">
            {listing.items.map((residence) => (
              <ResidenceCard key={residence.id} residence={residence} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}