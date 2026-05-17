import "server-only";

import type {
  City,
  HousingType,
  PrivateBrand,
  PublicEntity,
  RatingBreakdown,
  RatingCategoryKey,
  ResidenceDetails,
  ResidencePhoto,
  ResidenceReview,
  ResidenceSummaryStats,
  ReviewerType,
} from "@/lib/types";
import { createServerSupabaseClient } from "@/utils/supabase/server";

const PUBLISHED_STATUS = "PUBLISHED";

const ratingCategoryMap: Record<string, RatingCategoryKey> = {
  WIFI_CONNECTIVITY: "wifiConnectivity",
  CLEANLINESS: "cleanliness",
  SOCIAL_VIBE_COMMUNITY: "socialVibeCommunity",
  LOCATION_SAFETY: "locationSafety",
  AMENITIES: "amenities",
  VALUE_FOR_MONEY: "valueForMoney",
};

type ResidenceListingFilters = {
  city?: City;
  housingType?: HousingType;
  publicEntity?: PublicEntity;
  privateBrand?: PrivateBrand;
  search?: string;
  minMonthlyRent?: number;
  maxMonthlyRent?: number;
  verifiedOnly?: boolean;
  limit?: number;
  offset?: number;
};

type ResidenceListItem = {
  id: string;
  slug: string;
  name: string;
  city: City;
  address: string;
  housingType: HousingType;
  publicEntity: PublicEntity | null;
  privateBrand: PrivateBrand | null;
  operatorName: string | null;
  websiteUrl: string | null;
  latitude: number;
  longitude: number;
  minMonthlyRent: number | null;
  maxMonthlyRent: number | null;
  averageOverallRating: number;
  totalReviews: number;
  coverPhotoUrl: string | null;
};

type ResidenceListingResult = {
  items: ResidenceListItem[];
  total: number;
  limit: number;
  offset: number;
};

type ResidenceRow = {
  id: string;
  slug: string;
  name: string;
  city: City;
  address: string;
  province: string | null;
  postal_code: string | null;
  housing_type: HousingType;
  public_entity: PublicEntity | null;
  private_brand: PrivateBrand | null;
  operator_name: string | null;
  website_url: string | null;
  description: string | null;
  latitude: number | string;
  longitude: number | string;
  min_monthly_rent: number | null;
  max_monthly_rent: number | null;
  status: string;
  verified: boolean;
  created_at: string;
};

type ResidencePhotoRow = {
  id: string;
  residence_id: string;
  image_url: string;
  thumb_url: string | null;
  caption: string | null;
  kind: "OFFICIAL" | "STUDENT";
  area_type: string;
  is_cover: boolean;
  created_at: string;
};

type ReviewRow = {
  id: string;
  residence_id: string;
  user_id: string;
  title: string | null;
  body: string;
  overall_rating: number;
  reviewer_type: ReviewerType;
  lived_here_year: number | null;
  stay_from: string | null;
  stay_to: string | null;
  would_recommend: boolean | null;
  created_at: string;
  status: string;
};

type ReviewCategoryRatingRow = {
  id: string;
  review_id: string;
  category: string;
  score: number;
};

type ReviewHelpfulVoteRow = {
  id: string;
  review_id: string;
};

type UserRow = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  university: string | null;
};

type ResidenceAmenityRow = {
  id: string;
  amenity: string;
  available: boolean;
  notes: string | null;
};

function clampRating(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(5, Number(value.toFixed(2))));
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function emptyRatingBreakdown(): RatingBreakdown {
  return {
    wifiConnectivity: 0,
    cleanliness: 0,
    socialVibeCommunity: 0,
    locationSafety: 0,
    amenities: 0,
    valueForMoney: 0,
  };
}

function amenityLabel(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace("24 7", "24/7")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function reviewerTypeLabel(type: ReviewerType): string {
  switch (type) {
    case "ERASMUS_STUDENT": return "Erasmus Student";
    case "INTERNATIONAL_STUDENT": return "International Student";
    case "ITALIAN_STUDENT": return "Italian Student";
    case "PHD_STUDENT": return "PhD Student";
    default: return "Student";
  }
}

function mapPhoto(row: ResidencePhotoRow): ResidencePhoto {
  return {
    id: row.id,
    url: row.image_url,
    thumbnailUrl: row.thumb_url,
    caption: row.caption,
    kind: row.kind,
    areaType: row.area_type as any,
    isCover: row.is_cover,
    createdAt: row.created_at,
  };
}

function parseLimit(value?: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 24;
  return Math.min(100, Math.max(1, Math.trunc(value)));
}

function parseOffset(value?: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.trunc(value));
}

function parseBudget(value?: number): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.trunc(value));
}

function escapeSearchTerm(term: string): string {
  return term.replace(/[%]/g, "").replace(/[,]/g, " ");
}

function mapReview(
  review: ReviewRow,
  userById: Map<string, UserRow>,
  categoryByReviewId: Map<string, ReviewCategoryRatingRow[]>,
  helpfulCountByReviewId: Map<string, number>,
): ResidenceReview {
  const categories = categoryByReviewId.get(review.id) ?? [];
  const breakdown = emptyRatingBreakdown();

  for (const row of categories) {
    const key = ratingCategoryMap[row.category];
    if (key) {
      breakdown[key] = clampRating(row.score);
    }
  }

  const user = userById.get(review.user_id);
  const baseTag = reviewerTypeLabel(review.reviewer_type);
  const tags = [baseTag];
  if (review.lived_here_year) tags.push(`Lived here ${review.lived_here_year}`);

  return {
    id: review.id,
    title: review.title,
    body: review.body,
    overallRating: clampRating(review.overall_rating),
    categoryRatings: breakdown,
    reviewer: {
      id: review.user_id,
      displayName: user?.display_name ?? "Anonymous Student",
      avatarUrl: user?.avatar_url ?? null,
      reviewerType: review.reviewer_type,
      university: user?.university ?? null,
      tags,
    },
    livedHereYear: review.lived_here_year,
    stayFrom: review.stay_from,
    stayTo: review.stay_to,
    wouldRecommend: review.would_recommend,
    helpfulCount: helpfulCountByReviewId.get(review.id) ?? 0,
    createdAt: review.created_at,
  };
}

function computeStats(reviews: ResidenceReview[]): ResidenceSummaryStats {
  if (reviews.length === 0) {
    return {
      averageOverallRating: 0,
      totalReviews: 0,
      recommendationRate: null,
      ratingBreakdown: emptyRatingBreakdown(),
    };
  }

  const breakdown = emptyRatingBreakdown();
  let overallTotal = 0;
  let recommendKnown = 0;
  let recommendPositive = 0;


  for (const review of reviews) {
    overallTotal += review.overallRating;

    for (const key of Object.keys(breakdown) as RatingCategoryKey[]) {
      breakdown[key] += review.categoryRatings[key];
    }

    if (typeof review.wouldRecommend === "boolean") {
      recommendKnown += 1;
      if (review.wouldRecommend) recommendPositive += 1;
    }
  }

  for (const key of Object.keys(breakdown) as RatingCategoryKey[]) {
    breakdown[key] = clampRating(breakdown[key] / reviews.length);
  }

  return {
    averageOverallRating: clampRating(overallTotal / reviews.length),
    totalReviews: reviews.length,
    recommendationRate:
      recommendKnown > 0
        ? Number(((recommendPositive / recommendKnown) * 100).toFixed(1))
        : null,
    ratingBreakdown: breakdown,
  };
}

export async function getResidenceListings(
  filters: ResidenceListingFilters = {},
): Promise<ResidenceListingResult> {
  const supabase = await createServerSupabaseClient();

  const limit = parseLimit(filters.limit);
  const offset = parseOffset(filters.offset);
  const minBudget = parseBudget(filters.minMonthlyRent);
  const maxBudget = parseBudget(filters.maxMonthlyRent);

  let query = supabase
    .from("residences")
    .select(
      "id,slug,name,city,address,housing_type,public_entity,private_brand,operator_name,website_url,latitude,longitude,min_monthly_rent,max_monthly_rent,status,verified",
      { count: "exact" },
    )
    .eq("status", PUBLISHED_STATUS);

  if (filters.city) query = query.eq("city", filters.city);
  if (filters.housingType) query = query.eq("housing_type", filters.housingType);
  if (filters.verifiedOnly === true) query = query.eq("verified", true);

  const search = filters.search?.trim();
  if (search) {
    const term = `%${escapeSearchTerm(search)}%`;
    query = query.or(
      `name.ilike.${term},address.ilike.${term},operator_name.ilike.${term}`,
    );
  }

  if (typeof minBudget === "number") {
    query = query.or(`max_monthly_rent.is.null,max_monthly_rent.gte.${minBudget}`);
  }

  if (typeof maxBudget === "number") {
    query = query.or(`min_monthly_rent.is.null,min_monthly_rent.lte.${maxBudget}`);
  }

  const { data: residences, error, count } = await query
    .order("verified", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to load residences: ${error.message}`);
  }

  const rows = (residences ?? []) as ResidenceRow[];
  const residenceIds = rows.map((row) => row.id);

  if (residenceIds.length === 0) {
    return { items: [], total: count ?? 0, limit, offset };
  }

  const [{ data: photos }, { data: reviews }] = await Promise.all([
    supabase
      .from("residence_photos")
      .select("id,residence_id,image_url,is_cover")
      .in("residence_id", residenceIds)
      .eq("is_approved", true),
    supabase
      .from("reviews")
      .select("id,residence_id,overall_rating")
      .in("residence_id", residenceIds)
      .eq("status", PUBLISHED_STATUS),
  ]);

  const photoByResidenceId = new Map<string, string>();
  for (const row of (photos ?? []) as ResidencePhotoRow[]) {
    if (row.is_cover && !photoByResidenceId.has(row.residence_id)) {
      photoByResidenceId.set(row.residence_id, row.image_url);
    }
  }

  const reviewStatsByResidenceId = new Map<string, { total: number; sumOverall: number }>();
  for (const row of (reviews ?? []) as { residence_id: string; overall_rating: number }[]) {
    const current = reviewStatsByResidenceId.get(row.residence_id) ?? { total: 0, sumOverall: 0 };
    current.total += 1;
    current.sumOverall += row.overall_rating;
    reviewStatsByResidenceId.set(row.residence_id, current);
  }

  const items: ResidenceListItem[] = rows.map((row) => {
    const reviewStats = reviewStatsByResidenceId.get(row.id) ?? { total: 0, sumOverall: 0 };

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      city: row.city,
      address: row.address,
      housingType: row.housing_type,
      publicEntity: row.public_entity,
      privateBrand: row.private_brand,
      operatorName: row.operator_name,
      websiteUrl: row.website_url,
      latitude: toNumber(row.latitude),
      longitude: toNumber(row.longitude),
      minMonthlyRent: row.min_monthly_rent,
      maxMonthlyRent: row.max_monthly_rent,
      averageOverallRating:
        reviewStats.total > 0
          ? clampRating(reviewStats.sumOverall / reviewStats.total)
          : 0,
      totalReviews: reviewStats.total,
      coverPhotoUrl: photoByResidenceId.get(row.id) ?? null,
    };
  });

  return { items, total: count ?? items.length, limit, offset };
}

export async function getResidenceDetailsBySlug(
  slug: string,
): Promise<ResidenceDetails | null> {
  const supabase = await createServerSupabaseClient();

  const normalizedSlug = slug.trim().toLowerCase();

  const { data: residence, error: residenceError } = await supabase
    .from("residences")
    .select("*")
    .eq("slug", normalizedSlug)
    .maybeSingle();

  if (residenceError || !residence) return null;

  const row = residence as ResidenceRow;
  if (row.status !== PUBLISHED_STATUS) return null;

  const [{ data: amenityRows }, { data: photoRows }, { data: reviewRows }] = await Promise.all([
    supabase.from("residence_amenities").select("*").eq("residence_id", row.id),
    supabase.from("residence_photos").select("*").eq("residence_id", row.id).eq("is_approved", true),
    supabase.from("reviews").select("*,user:user_id(*)").eq("residence_id", row.id).eq("status", PUBLISHED_STATUS),
  ]);

  const reviews = (reviewRows ?? []) as ReviewRow[];
  const reviewIds = reviews.map((review) => review.id);
  const userIds = Array.from(new Set(reviews.map((review) => review.user_id)));

  const [{ data: usersData }, { data: categoryData }, { data: helpfulData }] = await Promise.all([
    userIds.length > 0
      ? supabase.from("users").select("id,display_name,avatar_url,university").in("id", userIds)
      : Promise.resolve({ data: [] }),
    reviewIds.length > 0
      ? supabase.from("review_category_ratings").select("*").in("review_id", reviewIds)
      : Promise.resolve({ data: [] }),
    reviewIds.length > 0
      ? supabase.from("review_helpful_votes").select("id,review_id").in("review_id", reviewIds)
      : Promise.resolve({ data: [] }),
  ]);

  const userById = new Map<string, UserRow>();
  for (const user of (usersData ?? []) as UserRow[]) {
    userById.set(user.id, user);
  }

  const categoryByReviewId = new Map<string, ReviewCategoryRatingRow[]>();
  for (const rating of (categoryData ?? []) as ReviewCategoryRatingRow[]) {
    const arr = categoryByReviewId.get(rating.review_id) ?? [];
    arr.push(rating);
    categoryByReviewId.set(rating.review_id, arr);
  }

  const helpfulCountByReviewId = new Map<string, number>();
  for (const vote of (helpfulData ?? []) as ReviewHelpfulVoteRow[]) {
    helpfulCountByReviewId.set(
      vote.review_id,
      (helpfulCountByReviewId.get(vote.review_id) ?? 0) + 1,
    );
  }

  const mappedReviews = reviews.map((review) =>
    mapReview(review, userById, categoryByReviewId, helpfulCountByReviewId),
  );
  const stats = computeStats(mappedReviews);

  const mappedPhotos = ((photoRows ?? []) as ResidencePhotoRow[]).map(mapPhoto);
  const mappedAmenities = ((amenityRows ?? []) as ResidenceAmenityRow[]).map((amenity) => ({
    key: amenity.amenity,
    label: amenityLabel(amenity.amenity),
    available: amenity.available,
    notes: amenity.notes,
  }));

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    city: row.city,
    address: row.address,
    areaLabel: [row.province, row.postal_code].filter(Boolean).join(" · ") || null,
    description: row.description,
    websiteUrl: row.website_url,
    coordinates: { lat: toNumber(row.latitude), lng: toNumber(row.longitude) },
    operator: {
      housingType: row.housing_type,
      publicEntity: row.public_entity,
      privateBrand: row.private_brand,
      operatorName: row.operator_name,
    },
    monthlyRentMin: row.min_monthly_rent,
    monthlyRentMax: row.max_monthly_rent,
    currency: "EUR",
    amenities: mappedAmenities,
    photos: {
      official: mappedPhotos.filter((photo) => photo.kind === "OFFICIAL"),
      student: mappedPhotos.filter((photo) => photo.kind === "STUDENT"),
    },
    stats,
    reviews: mappedReviews,
  };
}

export type { ResidenceListingFilters, ResidenceListItem, ResidenceListingResult };