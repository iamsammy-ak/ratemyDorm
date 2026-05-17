"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";
import type { Provider } from "@supabase/supabase-js";

import { createClient } from "@/utils/supabase/client";

export const dynamic = "force-dynamic";

type AuthMode = "password" | "magic";

function SignInPageContent() {
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const rawNextPath = searchParams.get("next");
  const nextPath =
    rawNextPath && rawNextPath.startsWith("/") && !rawNextPath.startsWith("//")
      ? rawNextPath
      : "/";

  const [mode, setMode] = useState<AuthMode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loadingAction, setLoadingAction] = useState<
    "password" | "magic" | "google" | "apple" | null
  >(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearFeedback = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handlePasswordSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearFeedback();

    if (!email || !password) {
      setErrorMessage("Enter both email and password.");
      return;
    }

    setLoadingAction("password");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoadingAction(null);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (typeof window !== "undefined") {
      window.location.assign(nextPath);
    }
  };

  const handleMagicLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearFeedback();

    if (!email) {
      setErrorMessage("Enter your email to receive a magic link.");
      return;
    }

    setLoadingAction("magic");

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });

    setLoadingAction(null);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage(
      "Magic link sent. Check your inbox and open the link to sign in.",
    );
  };

  const handleOAuth = async (provider: Provider) => {
    clearFeedback();
    setLoadingAction(provider as "google" | "apple");

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });

    setLoadingAction(null);

    if (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 py-10">
      <section className="glass-card p-6 md:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Access your account to write reviews, upload student photos, and add
          new residences.
        </p>

        <div className="mt-6 inline-flex rounded-xl border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => {
              clearFeedback();
              setMode("password");
            }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              mode === "password"
                ? "bg-brand-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => {
              clearFeedback();
              setMode("magic");
            }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              mode === "magic"
                ? "bg-brand-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Magic Link
          </button>
        </div>

        <form
          onSubmit={mode === "password" ? handlePasswordSignIn : handleMagicLink}
          className="mt-5 space-y-3"
        >
          <input
            type="email"
            autoComplete="email"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none ring-brand-500 placeholder:text-slate-400 focus:ring-2"
            required
          />

          {mode === "password" ? (
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none ring-brand-500 placeholder:text-slate-400 focus:ring-2"
              required
            />
          ) : null}

          <button
            type="submit"
            disabled={
              loadingAction === "password" ||
              loadingAction === "magic" ||
              loadingAction === "google" ||
              loadingAction === "apple"
            }
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {mode === "password"
              ? loadingAction === "password"
                ? "Signing in..."
                : "Sign in"
              : loadingAction === "magic"
                ? "Sending magic link..."
                : "Send magic link"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Or continue with
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => handleOAuth("google")}
            disabled={loadingAction !== null}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loadingAction === "google" ? "Redirecting..." : "Google"}
          </button>

          <button
            type="button"
            onClick={() => handleOAuth("apple")}
            disabled={loadingAction !== null}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loadingAction === "apple" ? "Redirecting..." : "Apple"}
          </button>
        </div>

        {errorMessage ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {successMessage}
          </p>
        ) : null}

        <p className="mt-5 text-xs text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-medium no-underline">
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex w-full max-w-md flex-col gap-6 py-10">
          <section className="glass-card p-6 md:p-8">
            <p className="text-sm text-slate-600">Loading sign-in form...</p>
          </section>
        </main>
      }
    >
      <SignInPageContent />
    </Suspense>
  );
}