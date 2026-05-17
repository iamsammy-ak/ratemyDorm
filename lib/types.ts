export type City = "TURIN" | "MILAN" | "OTHER";

export type HousingType = "PUBLIC_REGIONAL" | "PRIVATE";

export type PublicEntity = "EDISU_PIEMONTE" | "DSU_LOMBARDIA" | "OTHER";

export type PrivateBrand =
  | "CAMPLUS"
  | "APARTO"
  | "CX"
  | "COLLEGIATE"
  | "IN_DOMUS"
  | "TAURASIA"
  | "OTHER";

export type PhotoKind = "OFFICIAL" | "STUDENT";

export type ResidenceAreaType =
  | "ROOM"
  | "KITCHEN"
  | "BATHROOM"
  | "COMMON_AREA"
  | "EXTERIOR"
  | "STUDY_ROOM"
  | "LAUNDRY"
  | "GYM"
  | "OTHER";

export type ReviewerType =
  | "ERASMUS_STUDENT"
  | "INTERNATIONAL_STUDENT"
  | "ITALIAN_STUDENT"
  | "PHD_STUDENT"
  | "OTHER";

export type RatingCategoryKey =
  | "wifiConnectivity"
  | "cleanliness"
  | "socialVibeCommunity"
  | "locationSafety"
  | "amenities"
  | "valueForMoney";

export const RATING_CATEGORY_LABELS: Record<RatingCategoryKey, string> = {
  wifiConnectivity: "Wi‑Fi & Connectivity",
  cleanliness: "Cleanliness",
  socialVibeCommunity: "Social Vibe & Community",
  locationSafety: "Location & Safety",
  amenities: "Amenities",
  valueForMoney: "Value for Money",
};

export type RatingBreakdown = Record<RatingCategoryKey, number>;

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ResidenceOperator {
  housingType: HousingType;
  publicEntity?: PublicEntity | null;
  privateBrand?: PrivateBrand | null;
  operatorName?: string | null;
}

export interface ResidencePhoto {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  caption?: string | null;
  kind: PhotoKind;
  areaType: ResidenceAreaType;
  isCover?: boolean;
  createdAt?: string;
}

export interface ReviewerProfile {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  reviewerType: ReviewerType;
  university?: string | null;
  tags?: string[];
}

export interface ResidenceReview {
  id: string;
  title?: string | null;
  body: string;
  overallRating: number;
  categoryRatings: RatingBreakdown;
  reviewer: ReviewerProfile;
  livedHereYear?: number | null;
  stayFrom?: string | null;
  stayTo?: string | null;
  wouldRecommend?: boolean | null;
  helpfulCount: number;
  createdAt: string;
}

export interface ResidenceAmenity {
  key: string;
  label: string;
  available: boolean;
  notes?: string | null;
}

export interface ResidenceSummaryStats {
  averageOverallRating: number;
  totalReviews: number;
  recommendationRate?: number | null;
  ratingBreakdown: RatingBreakdown;
}

export interface ResidenceDetails {
  id: string;
  slug: string;
  name: string;
  city: City;
  address: string;
  areaLabel?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
  coordinates: Coordinates;
  operator: ResidenceOperator;
  monthlyRentMin?: number | null;
  monthlyRentMax?: number | null;
  currency?: "EUR";
  amenities: ResidenceAmenity[];
  photos: {
    official: ResidencePhoto[];
    student: ResidencePhoto[];
  };
  stats: ResidenceSummaryStats;
  reviews: ResidenceReview[];
}