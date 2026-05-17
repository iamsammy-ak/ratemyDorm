import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import {
  ArrowRight,
  MapPinned,
  Search,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { City } from "@prisma/client";

import ResidenceCard from "@/components/residence/residence-card";
import {
  getResidenceListings,
  type ResidenceListItem,
} from "@/lib/residence-service";

export const dynamic = "force-dynamic";

type HomeData = {
  featured: ResidenceListItem[];
  turin: ResidenceListItem[];
  milan: ResidenceListItem[];
};

async function loadHomeData(): Promise<HomeData> {
  const [featuredResult, turinResult, milanResult] = await Promise.all([
    getResidenceListings({
      verifiedOnly: true,
      limit: 6,
      offset: 0,
    }),
    getResidenceListings({
      city: City.TURIN,
      verifiedOnly: true,
      limit: 6,
      offset: 0,
    }),
    getResidenceListings({
      city: City.MILAN,
      verifiedOnly: true,
      limit: 6,
      offset: 0,
    }),
  ]);

  return {
    featured: featuredResult.items,
    turin: turinResult.items,
    milan: milanResult.items,
  };
}

function CitySection({
  title,
  subtitle,
  link,
  residences,
}: {
  title: string;
  subtitle: string;
  link: Route;
  residences: ResidenceListItem[];
}) {
  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="section-title">{title}</h2>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        </div>
        <Link
          href={link}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 no-underline hover:text-brand-700"
        >
          Explore all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {residences.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-sm text-slate-600">
            No published residences yet for this city.
          </p>
        </div>
      ) : (
        <div className="grid grid-auto-fill-cards gap-4">
          {residences.map((residence) => (
            <ResidenceCard key={residence.id} residence={residence} />
          ))}
        </div>
      )}
    </section>
  );
}

export default async function HomePage() {
  let data: HomeData = { featured: [], turin: [], milan: [] };
  let loadError = false;

  try {
    data = await loadHomeData();
  } catch {
    loadError = true;
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-4 pb-16 pt-8 md:px-8 md:pt-12">
      <section className="glass-card overflow-hidden p-6 md:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-center">
          <div className="space-y-5">
            <span className="pill-badge pill-badge-private border-coral-200 bg-coral-50 text-coral-700">
              Built for international students in Italy
            </span>

            <h1 className="text-balance text-3xl font-semibold leading-tight text-slate-900 md:text-5xl">
              Find your residence in Milan, Turin, and beyond.
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
              Compare verified student reviews, browse real photos, and filter
              by{" "}
              <span className="font-semibold text-slate-800">Public / DSU</span>{" "}
              or <span className="font-semibold text-slate-800">Private</span>{" "}
              housing to make a confident decision.
            </p>

            <form
              method="GET"
              action="/residences"
              className="flex flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="q" className="sr-only">
                Search residence
              </label>
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="q"
                  name="q"
                  type="text"
                  placeholder="Find your residence in Milan, Turin..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none ring-brand-500 transition placeholder:text-slate-400 focus:ring-2"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                Erasmus-friendly
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                Real student photos
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                6-category ratings
              </span>
            </div>
          </div>

          <div className="relative h-[420px] overflow-hidden rounded-2xl border border-slate-200">
            <Image
              src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1800&q=80"
              alt="Modern student residence room"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-900/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white md:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                Live Residence Discovery
              </p>
              <h2 className="mt-2 text-2xl font-semibold leading-tight md:text-3xl">
                Real student feedback. Better housing decisions.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-white/85">
                Browse verified listings, compare category scores, and read student-first reviews before you book.
              </p>
            </div>
          </div>
        </div>
      </section>

      {loadError ? (
        <section className="glass-card p-8 text-center">
          <p className="text-sm text-slate-700">
            Live listings could not be loaded. Check your database connection
            and try again.
          </p>
        </section>
      ) : (
        <>
          <section className="space-y-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="section-title">Featured Residences</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Recently published and verified residences from the live
                  database.
                </p>
              </div>
              <Link
                href="/residences"
                className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 no-underline hover:text-brand-700"
              >
                Browse all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {data.featured.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-sm text-slate-600">
                  No featured residences available yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-auto-fill-cards gap-4">
                {data.featured.map((residence) => (
                  <ResidenceCard key={residence.id} residence={residence} />
                ))}
              </div>
            )}
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="glass-card p-5">
              <div className="mb-3 inline-flex rounded-lg bg-brand-50 p-2 text-brand-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                Verified Listings
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Live Supabase-backed residences with publication status control.
              </p>
            </div>

            <div className="glass-card p-5">
              <div className="mb-3 inline-flex rounded-lg bg-brand-50 p-2 text-brand-600">
                <Star className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                6-Point Ratings
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Wi-Fi, cleanliness, social vibe, location, amenities, and value.
              </p>
            </div>

            <div className="glass-card p-5">
              <div className="mb-3 inline-flex rounded-lg bg-brand-50 p-2 text-brand-600">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                Crowdsourced Reviews
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Student-driven reviews from Erasmus and full-degree communities.
              </p>
            </div>

            <div className="glass-card p-5">
              <div className="mb-3 inline-flex rounded-lg bg-brand-50 p-2 text-brand-600">
                <MapPinned className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                Milan + Turin First
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Expansion-ready architecture for all major Italian university
                cities.
              </p>
            </div>
          </section>

          <CitySection
            title="Turin"
            subtitle="Live residences synced from the database."
            link="/search?city=turin"
            residences={data.turin}
          />

          <CitySection
            title="Milan"
            subtitle="Live residences synced from the database."
            link="/search?city=milan"
            residences={data.milan}
          />
        </>
      )}
    </main>
  );
}