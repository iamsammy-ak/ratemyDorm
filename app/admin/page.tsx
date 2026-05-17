import Link from "next/link";
import { redirect } from "next/navigation";

import AdminDashboardClient from "@/components/admin/admin-dashboard-client";
import { createServerSupabaseClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type AppUserRole = "STUDENT" | "MODERATOR" | "ADMIN";

function isAdminRole(role: AppUserRole | null | undefined): boolean {
  return role === "ADMIN" || role === "MODERATOR";
}

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user?.email) {
    redirect("/sign-in?next=%2Fadmin");
  }

  const normalizedEmail = authData.user.email.toLowerCase();

  const { data: userRow, error: userError } = await supabase
    .from("users")
    .select("id,email,role")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (userError) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 md:px-8">
        <section className="glass-card p-6 md:p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Admin access unavailable
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            We could not verify your admin privileges right now.
          </p>
        </section>
      </main>
    );
  }

  const appUser = userRow as { id: string; email: string; role: AppUserRole } | null;

  if (!appUser || !isAdminRole(appUser.role)) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 md:px-8">
        <section className="glass-card p-6 md:p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Forbidden
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            You are signed in, but your account does not have admin privileges.
          </p>
          <div className="mt-5">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white no-underline transition hover:bg-brand-700"
            >
              Go to home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return <AdminDashboardClient />;
}