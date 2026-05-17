import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();
  try {
    const supabase = await createServerSupabaseClient();
    const { count, error } = await supabase
      .from("residences")
      .select("id", { count: "exact", head: true })
      .eq("status", "PUBLISHED");
    if (error) {
      return NextResponse.json({ ok: false, status: "degraded", message: error.message, timestamp }, { status: 503 });
    }
    return NextResponse.json({ ok: true, status: "healthy", publishedResidences: count ?? 0, timestamp }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ ok: false, status: "down", message, timestamp }, { status: 500 });
  }
}