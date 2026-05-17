import type { Metadata } from "next";
import Link from "next/link";
import { City, HousingType } from "@prisma/client";
import { Filter, Search } from "lucide-react";

import ResidenceCard from "@/components/residence/residence-card";
import {
  getResidenceListings,
  type ResidenceListingFilters,
} from "@/lib/residence-service";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search and filter student residences in Milan, Turin, and across Italy.",
};

type SearchPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function normalized(value: string | string[] | undefined): string | undefined {
  const raw = firstParam(value)?.trim();
  return raw && raw.length > 0 ? raw : undefined;
}

function parseNumberParam(
  value: string | string[] | undefined,
): number | undefined {
  const raw = normalized(value);
  if (!raw) return undefined;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.max(0, parsed);
}

function parseBooleanParam(
  value: string | string[] | undefined,
): boolean | undefined {
  const raw = normalized(value)?.toLowerCase();
  if (!raw) return undefined;
  if (raw === "true" || raw === "1" || raw === "yes") return true;
  if (raw === "false" || raw === "0" || raw === "no") return false;
  return undefined;
}

function parseCityParam(
  value: string | string[] | undefined,
): City | undefined {
  const raw = normalized(value)?.toUpperCase();
  if (!raw) return undefined;

  if (raw === "TURIN" || raw === "TORINO") return City.TURIN;
  if (raw === "MILAN" || raw === "MILANO") return City.MILAN;
  if (raw === "OTHER") return City.OTHER;
  return undefined;
}

function parseHousingTypeParam(
  value: string | string[] | undefined,
): HousingType | undefined {
  const raw = normalized(value)?.toUpperCase();
  if (!raw) return undefined;

  if (raw === "PUBLIC_DSU" || raw === "PUBLIC" || raw === "PUBLIC_REGIONAL") {
    return HousingType.PUBLIC_REGIONAL;
  }
  if (raw === "PRIVATE") return HousingType.PRIVATE;

  return undefined;
}

const cityOptions: Array<{ value: City; label: string }> = [
  { value: City.TURIN, label: "Turin" },
  { value: City.MILAN, label: "Milan" },
  { value: City.OTHER, label: "Other cities" },
];

const housingTypeOptions: Array<{ value: HousingType; label: string }> = [
  { value: HousingType.PUBLIC_REGIONAL, label: "Public / DSU" },
  { value: HousingType.PRIVATE, label: "Private" },
];

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const q = normalized(searchParams?.q);
  const city = parseCityParam(searchParams?.city);
  const housingType = parseHousingTypeParam(searchParams?.housingType);
  const verifiedOnly = parseBooleanParam(searchParams?.verifiedOnly);
  const minMonthlyRent = parseNumberParam(searchParams?.minMonthlyRent);
  const maxMonthlyRent = parseNumberParam(searchParams?.maxMonthlyRent);

  const filters: ResidenceListingFilters = {
    search: q,
    city,
    housingType,
    verifiedOnly,
    minMonthlyRent,
    maxMonthlyRent,
    limit: 48,
    offset: 0,
  };

  let result: Awaited<ReturnType<typeof getResidenceListings>> | null = null;

  try {
    result = await getResidenceListings(filters);
  } catch (error) {
    console.error("Failed to load advanced search results:", {
      filters,
      error,
    });
  }

  if (!result) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-10">
        <section className="glass-card p-10 text-center">
          <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
            Search is temporarily unavailable
          </h1>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            We couldn&apos;t load search results right now. Please retry in a moment.
          </p>
          <div className="mt-5">
            <Link
              href="/search"
              className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white no-underline transition hover:bg-brand-700"
            >
              Retry search
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const hasActiveFilters =
    Boolean(q) ||
    Boolean(city) ||
    Boolean(housingType) ||
    typeof minMonthlyRent === "number" ||
    typeof maxMonthlyRent === "number" ||
    verifiedOnly === true;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-10">
      <section className="glass-card p-6 md:p-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              Search Residences
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Filter public/regional and private residences with live database
              listings.
            </p>
          </div>

          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{result.total}</span>{" "}
            result{result.total === 1 ? "" : "s"}
          </p>
        </div>

        <form
          method="GET"
          className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-12"
        >
          <div className="md:col-span-4">
            <label
              htmlFor="q"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="q"
                name="q"
                defaultValue={q ?? ""}
                placeholder="Name, address, operator"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none ring-brand-500 transition placeholder:text-slate-400 focus:ring-2"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="city"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              City
            </label>
            <select
              id="city"
              name="city"
              defaultValue={city ?? ""}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none ring-brand-500 transition focus:ring-2"
            >
              <option value="">All cities</option>
              {cityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="housingType"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Housing type
            </label>
            <select
              id="housingType"
              name="housingType"
              defaultValue={housingType ?? ""}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none ring-brand-500 transition focus:ring-2"
            >
              <option value="">Public + Private</option>
              {housingTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="minMonthlyRent"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Min € / month
            </label>
            <input
              id="minMonthlyRent"
              name="minMonthlyRent"
              type="number"
              min={0}
              step={10}
              defaultValue={
                typeof minMonthlyRent === "number" ? minMonthlyRent : ""
              }
              placeholder="e.g. 300"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none ring-brand-500 transition placeholder:text-slate-400 focus:ring-2"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="maxMonthlyRent"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Max € / month
            </label>
            <input
              id="maxMonthlyRent"
              name="maxMonthlyRent"
              type="number"
              min={0}
              step={10}
              defaultValue={
                typeof maxMonthlyRent === "number" ? maxMonthlyRent : ""
              }
              placeholder="e.g. 900"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none ring-brand-500 transition placeholder:text-slate-400 focus:ring-2"
            />
          </div>

          <div className="flex items-center gap-3 md:col-span-12 md:justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="verifiedOnly"
                value="true"
                defaultChecked={verifiedOnly === true}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              Verified residences only
            </label>

            <div className="flex items-center gap-2">
              {hasActiveFilters ? (
                <Link
                  href="/search"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 no-underline transition hover:bg-slate-50"
                >
                  Reset
                </Link>
              ) : null}

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                <Filter className="h-4 w-4" />
                Apply filters
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="mt-6">
        {result.items.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-900">
              No residences match these filters
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Adjust the city, housing type, or budget range to broaden your
              results.
            </p>
            <div className="mt-4">
              <Link
                href="/search"
                className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white no-underline transition hover:bg-brand-700"
              >
                Clear filters
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-auto-fill-cards gap-4">
            {result.items.map((residence) => (
              <ResidenceCard key={residence.id} residence={residence} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}