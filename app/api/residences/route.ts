import { NextRequest, NextResponse } from "next/server";
import { City, HousingType, PrivateBrand, PublicEntity } from "@prisma/client";

import { getResidenceListings, type ResidenceListingFilters } from "@/lib/residence-service";

export const dynamic = "force-dynamic";

const CITY_VALUES = new Set<City>(Object.values(City));
const HOUSING_TYPE_VALUES = new Set<HousingType>(Object.values(HousingType));

function normalizeParam(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseInteger(value: string | null): number | undefined {
  const normalized = normalizeParam(value);
  if (!normalized) return undefined;
  const parsed = Number.parseInt(normalized, 10);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed;
}

function parseBoolean(value: string | null): boolean | undefined {
  const normalized = normalizeParam(value)?.toLowerCase();
  if (!normalized) return undefined;
  if (normalized === "true" || normalized === "1" || normalized === "yes") return true;
  if (normalized === "false" || normalized === "0" || normalized === "no") return false;
  return undefined;
}

function parseCity(value: string | null): City | undefined {
  const normalized = normalizeParam(value);
  if (!normalized) return undefined;
  const upper = normalized.toUpperCase();
  if (upper === "TURIN" || upper === "TORINO") return City.TURIN;
  if (upper === "MILAN" || upper === "MILANO") return City.MILAN;
  if (upper === "OTHER") return City.OTHER;
  if (CITY_VALUES.has(upper as City)) return upper as City;
  return undefined;
}

function parseHousingType(value: string | null): HousingType | undefined {
  const normalized = normalizeParam(value);
  if (!normalized) return undefined;
  const upper = normalized.toUpperCase();
  if (upper === "PUBLIC_DSU" || upper === "PUBLIC") return HousingType.PUBLIC_REGIONAL;
  if (upper === "PRIVATE") return HousingType.PRIVATE;
  if (HOUSING_TYPE_VALUES.has(upper as HousingType)) return upper as HousingType;
  return undefined;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: ResidenceListingFilters = {
      city: parseCity(searchParams.get("city")),
      housingType: parseHousingType(searchParams.get("housingType")),
      search: normalizeParam(searchParams.get("q")) ?? undefined,
      minMonthlyRent: parseInteger(searchParams.get("minMonthlyRent")),
      maxMonthlyRent: parseInteger(searchParams.get("maxMonthlyRent")),
      verifiedOnly: parseBoolean(searchParams.get("verifiedOnly")),
      limit: parseInteger(searchParams.get("limit")) ?? 48,
      offset: parseInteger(searchParams.get("offset")) ?? 0,
    };

    const data = await getResidenceListings(filters);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("GET /api/residences failed", error);
    return NextResponse.json({ error: "Failed to load residences" }, { status: 500 });
  }
}