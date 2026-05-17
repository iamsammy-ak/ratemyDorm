import { NextRequest, NextResponse } from "next/server";
import { getResidenceDetailsBySlug } from "@/lib/residence-service";

export const dynamic = "force-dynamic";

type RouteContext = { params: { slug: string } };

export async function GET(_request: NextRequest, context: RouteContext) {
  const rawSlug = context.params?.slug ?? "";
  const slug = decodeURIComponent(rawSlug).trim().toLowerCase();

  if (!slug) {
    return NextResponse.json({ error: "Missing residence slug." }, { status: 400 });
  }

  try {
    const residence = await getResidenceDetailsBySlug(slug);
    if (!residence) {
      return NextResponse.json({ error: `No published residence found for slug "${slug}".` }, { status: 404 });
    }
    return NextResponse.json({ data: residence }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch residence by slug:", { slug, error });
    return NextResponse.json({ error: "Unable to fetch residence details." }, { status: 500 });
  }
}