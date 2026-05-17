import { NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/utils/supabase/server";

function safeNextPath(value: string | null): string {
  if (!value) return "/";
  if (!value.startsWith("/")) return "/";
  if (value.startsWith("//")) return "/";
  return value;
}

function redirectWithError(request: NextRequest, message: string) {
  const url = new URL("/sign-in", request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = safeNextPath(searchParams.get("next"));
  const redirectUrl = new URL(next, request.url);

  try {
    const supabase = await createServerSupabaseClient();
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) return redirectWithError(request, "Unable to complete sign-in.");
      return NextResponse.redirect(redirectUrl);
    }
    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as EmailOtpType });
      if (error) return redirectWithError(request, "Invalid or expired email link.");
      return NextResponse.redirect(redirectUrl);
    }
    return redirectWithError(request, "Missing authentication callback parameters.");
  } catch {
    return redirectWithError(request, "Authentication callback failed.");
  }
}