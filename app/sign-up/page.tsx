"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type VerificationMethod = "university_email" | "student_id_manual";
type Notice = { type: "success" | "error" | "info"; message: string } | null;

function isLikelyAcademicEmail(email: string): boolean {
  const value = email.trim().toLowerCase();

  if (!value.includes("@")) return false;

  const domain = value.split("@")[1] ?? "";
  return (
    domain.includes("student") ||
    domain.includes("studenti") ||
    domain.endsWith(".edu") ||
    domain.endsWith(".edu.it") ||
    domain.endsWith(".ac.uk") ||
    domain.endsWith(".it")
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [university, setUniversity] = useState("");
  const [isInternational, setIsInternational] = useState(false);
  const [verificationMethod, setVerificationMethod] =
    useState<VerificationMethod>("university_email");
  const [studentIdNote, setStudentIdNote] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<null | "google" | "apple">(null);

  async function handleOAuth(provider: "google" | "apple") {
    setNotice(null);
    setIsOAuthLoading(provider);

    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });

      if (error) {
        setNotice({ type: "error", message: error.message });
      }
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to start OAuth sign-in. Please try again.",
      });
    } finally {
      setIsOAuthLoading(null);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanUniversity = university.trim();
    const cleanPassword = password;

    if (!cleanName || !cleanEmail || !cleanPassword || !cleanUniversity) {
      setNotice({
        type: "error",
        message: "Please complete all required fields.",
      });
      return;
    }

    if (cleanPassword.length < 8) {
      setNotice({
        type: "error",
        message: "Password must be at least 8 characters.",
      });
      return;
    }

    if (verificationMethod === "university_email" && !isLikelyAcademicEmail(cleanEmail)) {
      setNotice({
        type: "error",
        message:
          "Please use a student/university email address for instant verification.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const emailRedirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined;

      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          emailRedirectTo,
          data: {
            full_name: cleanName,
            university: cleanUniversity,
            is_international: isInternational,
          },
        },
      });

      if (error) {
        setNotice({ type: "error", message: error.message });
        return;
      }

      setNotice({
        type: "success",
        message:
          "Account created. Check your inbox to confirm your email.",
      });

      setTimeout(() => {
        router.push("/sign-in");
      }, 1600);
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong while creating your account.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 py-10">
      <section className="glass-card p-6 md:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          Create your student account
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign up to write verified residence reviews and submit new residences.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => handleOAuth("google")}
            disabled={isOAuthLoading !== null || isSubmitting}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isOAuthLoading === "google" ? "Connecting..." : "Continue with Google"}
          </button>
          <button
            type="button"
            onClick={() => handleOAuth("apple")}
            disabled={isOAuthLoading !== null || isSubmitting}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isOAuthLoading === "apple" ? "Connecting..." : "Continue with Apple"}
          </button>
        </div>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">or sign up with email</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none ring-brand-500 transition placeholder:text-slate-400 focus:ring-2"
                placeholder="e.g. Sofia Marino"
              />
            </div>

            <div>
              <label htmlFor="university" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                University
              </label>
              <input
                id="university"
                name="university"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                autoComplete="organization"
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none ring-brand-500 transition placeholder:text-slate-400 focus:ring-2"
                placeholder="e.g. Politecnico di Torino"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Student email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none ring-brand-500 transition placeholder:text-slate-400 focus:ring-2"
                placeholder="name@studenti.polito.it"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none ring-brand-500 transition placeholder:text-slate-400 focus:ring-2"
                placeholder="At least 8 characters"
              />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isInternational}
              onChange={(e) => setIsInternational(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            I am an international student
          </label>

          {notice ? (
            <div
              className={[
                "rounded-xl px-3 py-2 text-sm",
                notice.type === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                  : notice.type === "error"
                    ? "border border-rose-200 bg-rose-50 text-rose-800"
                    : "border border-slate-200 bg-slate-50 text-slate-700",
              ].join(" ")}
            >
              {notice.message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || isOAuthLoading !== null}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-xs text-slate-500">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold no-underline">
            Go to sign in
          </Link>
        </p>
      </section>
    </main>
  );
}