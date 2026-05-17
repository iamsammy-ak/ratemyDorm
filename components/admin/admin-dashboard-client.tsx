"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  Flag,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { createClient } from "@/utils/supabase/client";

type AdminTab = "submissions" | "photos" | "reviews";

type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";
type ReviewStatus = "PUBLISHED" | "HIDDEN" | "FLAGGED";

type ResidenceSubmissionRow = {
  id: string;
  submitted_by_id: string;
  residence_id: string | null;
  proposed_name: string;
  proposed_city: "TURIN" | "MILAN" | "OTHER";
  proposed_address: string;
  proposed_housing_type: "PUBLIC_REGIONAL" | "PRIVATE";
  proposed_public_entity: string | null;
  proposed_private_brand: string | null;
  proposed_operator_name: string | null;
  proposed_website_url: string | null;
  notes: string | null;
  status: SubmissionStatus;
  reviewed_by_id: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
};

type ResidencePhotoRow = {
  id: string;
  residence_id: string;
  uploaded_by_id: string | null;
  review_id: string | null;
  kind: "OFFICIAL" | "STUDENT";
  area_type: string;
  image_url: string;
  caption: string | null;
  is_cover: boolean;
  is_approved: boolean;
  created_at: string;
};

type ReviewRow = {
  id: string;
  residence_id: string;
  user_id: string;
  title: string | null;
  body: string;
  overall_rating: number;
  status: ReviewStatus;
  created_at: string;
};

type ResidenceRow = {
  id: string;
  name: string;
  slug: string;
  city: "TURIN" | "MILAN" | "OTHER";
};

type AppUserLookupRow = {
  id: string;
  email: string;
  role: "STUDENT" | "MODERATOR" | "ADMIN";
};

type DraftModeration = {
  latitude: string;
  longitude: string;
  minMonthlyRent: string;
  maxMonthlyRent: string;
  markVerified: boolean;
  rejectionReason: string;
};

type Notice = { type: "success" | "error"; message: string } | null;

function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`.slice(0, 64);
}

function cityLabel(city: "TURIN" | "MILAN" | "OTHER"): string {
  if (city === "TURIN") return "Turin";
  if (city === "MILAN") return "Milan";
  return "Other";
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

function toIntOrNull(value: string): number | null {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function toFloatOrNull(value: string): number | null {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function AdminDashboardPage() {
  const supabase = useMemo(() => createClient(), []);

  const [activeTab, setActiveTab] = useState<AdminTab>("submissions");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice>(null);

  const [pendingSubmissions, setPendingSubmissions] = useState<ResidenceSubmissionRow[]>([]);
  const [pendingPhotos, setPendingPhotos] = useState<ResidencePhotoRow[]>([]);
  const [flaggedReviews, setFlaggedReviews] = useState<ReviewRow[]>([]);
  const [residences, setResidences] = useState<ResidenceRow[]>([]);

  const [drafts, setDrafts] = useState<Record<string, DraftModeration>>({});
  const [rowLoading, setRowLoading] = useState<Record<string, boolean>>({});
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [adminRole, setAdminRole] = useState<AppUserLookupRow["role"] | null>(null);

  function setRowBusy(key: string, value: boolean) {
    setRowLoading((prev) => ({ ...prev, [key]: value }));
  }

  function ensureDraft(id: string): DraftModeration {
    return (
      drafts[id] ?? {
        latitude: "",
        longitude: "",
        minMonthlyRent: "",
        maxMonthlyRent: "",
        markVerified: true,
        rejectionReason: "",
      }
    );
  }

  function updateDraft(id: string, patch: Partial<DraftModeration>) {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...ensureDraft(id),
        ...patch,
      },
    }));
  }

  async function loadDashboardData() {
    setLoading(true);
    setNotice(null);

    try {
      const [submissionsRes, photosRes, reviewsRes, residencesRes, authRes] =
        await Promise.all([
          supabase
            .from("residence_submissions")
            .select("*")
            .eq("status", "PENDING")
            .order("created_at", { ascending: true }),
          supabase
            .from("residence_photos")
            .select("*")
            .eq("is_approved", false)
            .order("created_at", { ascending: true }),
          supabase
            .from("reviews")
            .select("*")
            .eq("status", "FLAGGED")
            .order("created_at", { ascending: true }),
          supabase
            .from("residences")
            .select("id,name,slug,city")
            .order("name", { ascending: true }),
          supabase.auth.getUser(),
        ]);

      if (submissionsRes.error) throw new Error(submissionsRes.error.message);
      if (photosRes.error) throw new Error(photosRes.error.message);
      if (reviewsRes.error) throw new Error(reviewsRes.error.message);
      if (residencesRes.error) throw new Error(residencesRes.error.message);


      const authUser = authRes.data.user;
      if (!authUser?.email) {
        setAdminUserId(null);
        setAdminRole(null);
        setNotice({
          type: "error",
          message:
            "You are not signed in. Admin actions are blocked until you authenticate.",
        });
      } else {
        const profileRes = await supabase
          .from("users")
          .select("id,email,role")
          .eq("email", authUser.email.toLowerCase())
          .maybeSingle();

        if (profileRes.error) throw new Error(profileRes.error.message);

        const profile = (profileRes.data as AppUserLookupRow | null) ?? null;
        setAdminUserId(profile?.id ?? null);
        setAdminRole(profile?.role ?? null);

        if (!profile?.id) {
          setNotice({
            type: "error",
            message:
              "No matching app user profile found. Admin actions are blocked.",
          });
        } else if (profile.role !== "ADMIN" && profile.role !== "MODERATOR") {
          setNotice({
            type: "error",
            message:
              "Your account lacks admin/moderator role. Admin actions are blocked.",
          });
        }
      }

      setPendingSubmissions(
        (submissionsRes.data as ResidenceSubmissionRow[] | null) ?? [],
      );
      setPendingPhotos((photosRes.data as ResidencePhotoRow[] | null) ?? []);
      setFlaggedReviews((reviewsRes.data as ReviewRow[] | null) ?? []);
      setResidences((residencesRes.data as ResidenceRow[] | null) ?? []);
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error instanceof Error
            ? `Failed to load admin dashboard: ${error.message}`
            : "Failed to load admin dashboard.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboardData();
  }, []);

  const residenceMap = useMemo(() => {
    const map = new Map<string, ResidenceRow>();
    residences.forEach((residence) => map.set(residence.id, residence));
    return map;
  }, [residences]);

  async function approveSubmission(submission: ResidenceSubmissionRow) {
    const key = `submission-approve-${submission.id}`;
    setRowBusy(key, true);
    setNotice(null);

    try {
      if (!adminUserId) throw new Error("Admin identity missing. Please sign in again.");
      if (adminRole !== "ADMIN" && adminRole !== "MODERATOR") throw new Error("Insufficient permissions.");

      const draft = ensureDraft(submission.id);
      const latitude = toFloatOrNull(draft.latitude);
      const longitude = toFloatOrNull(draft.longitude);

      if (latitude === null || longitude === null) throw new Error("Latitude and longitude required.");

      const residenceId = createId("res");
      const slugBase = slugify(
        `${submission.proposed_name}-${submission.proposed_city.toLowerCase()}`,
      );
      const slug = `${slugBase}-${residenceId.slice(-6)}`;

      const insertResidence = await supabase.from("residences").insert({
        id: residenceId,
        slug,
        name: submission.proposed_name.trim(),
        city: submission.proposed_city,
        address: submission.proposed_address.trim(),
        housing_type: submission.proposed_housing_type,
        public_entity: submission.proposed_housing_type === "PUBLIC_REGIONAL"
          ? submission.proposed_public_entity
          : null,
        private_brand: submission.proposed_housing_type === "PRIVATE"
          ? submission.proposed_private_brand
          : null,
        operator_name: submission.proposed_operator_name?.trim() || null,
        website_url: submission.proposed_website_url?.trim() || null,
        description: submission.notes || null,
        latitude,
        longitude,
        min_monthly_rent: toIntOrNull(draft.minMonthlyRent),
        max_monthly_rent: toIntOrNull(draft.maxMonthlyRent),
        status: "PUBLISHED",
        verified: draft.markVerified,
        created_by_id: adminUserId,
        approved_by_id: adminUserId,
        published_at: new Date().toISOString(),
      });

      if (insertResidence.error) throw new Error(`Residence creation failed: ${insertResidence.error.message}`);

      await supabase
        .from("residence_submissions")
        .update({
          status: "APPROVED",
          residence_id: residenceId,
          reviewed_by_id: adminUserId,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", submission.id);

      setPendingSubmissions((prev) => prev.filter((row) => row.id !== submission.id));
      setNotice({ type: "success", message: `Approved and published "${submission.proposed_name}".` });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to approve submission.",
      });
    } finally {
      setRowBusy(key, false);
    }
  }

  async function rejectSubmission(submission: ResidenceSubmissionRow) {
    const key = `submission-reject-${submission.id}`;
    setRowBusy(key, true);
    setNotice(null);

    try {
      if (!adminUserId) throw new Error("Admin identity missing. Please sign in again.");

      if (adminRole !== "ADMIN" && adminRole !== "MODERATOR") throw new Error("Insufficient permissions.");

      const draft = ensureDraft(submission.id);
      const reason = draft.rejectionReason.trim();
      if (!reason) throw new Error("Rejection reason required.");

      await supabase
        .from("residence_submissions")
        .update({
          status: "REJECTED",
          rejection_reason: reason,
          reviewed_by_id: adminUserId,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", submission.id);

      setPendingSubmissions((prev) => prev.filter((row) => row.id !== submission.id));
      setNotice({ type: "success", message: `Rejected "${submission.proposed_name}".` });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to reject submission.",
      });
    } finally {
      setRowBusy(key, false);
    }
  }

  async function approvePhoto(photo: ResidencePhotoRow) {
    const key = `photo-approve-${photo.id}`;
    setRowBusy(key, true);
    setNotice(null);

    try {
      const result = await supabase
        .from("residence_photos")
        .update({ is_approved: true })
        .eq("id", photo.id);

      if (result.error) throw new Error(result.error.message);

      setPendingPhotos((prev) => prev.filter((row) => row.id !== photo.id));
      setNotice({ type: "success", message: "Photo approved." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to approve photo.",
      });
    } finally {
      setRowBusy(key, false);
    }
  }

  async function hidePhoto(photo: ResidencePhotoRow) {
    const key = `photo-hide-${photo.id}`;
    setRowBusy(key, true);
    setNotice(null);

    try {
      const result = await supabase
        .from("residence_photos")
        .update({ is_approved: false })
        .eq("id", photo.id);

      if (result.error) throw new Error(result.error.message);

      setPendingPhotos((prev) => prev.filter((row) => row.id !== photo.id));
      setNotice({ type: "success", message: "Photo kept hidden." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to hide photo.",
      });
    } finally {
      setRowBusy(key, false);
    }
  }

  async function publishReview(review: ReviewRow) {
    const key = `review-publish-${review.id}`;
    setRowBusy(key, true);
    setNotice(null);

    try {
      const result = await supabase
        .from("reviews")
        .update({ status: "PUBLISHED" })
        .eq("id", review.id);

      if (result.error) throw new Error(result.error.message);

      setFlaggedReviews((prev) => prev.filter((row) => row.id !== review.id));
      setNotice({ type: "success", message: "Review republished." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to publish review.",
      });
    } finally {
      setRowBusy(key, false);
    }
  }

  async function hideReview(review: ReviewRow) {
    const key = `review-hide-${review.id}`;
    setRowBusy(key, true);
    setNotice(null);

    try {
      const result = await supabase
        .from("reviews")
        .update({ status: "HIDDEN" })
        .eq("id", review.id);

      if (result.error) throw new Error(result.error.message);

      setFlaggedReviews((prev) => prev.filter((row) => row.id !== review.id));
      setNotice({ type: "success", message: "Review hidden." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to hide review.",
      });
    } finally {
      setRowBusy(key, false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 md:px-8">
      <section className="glass-card p-6 md:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Moderate pending residence submissions, student photos, and flagged reviews.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadDashboardData()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Loader2 className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Pending submissions
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {pendingSubmissions.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Pending photos
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {pendingPhotos.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Flagged reviews
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {flaggedReviews.length}
            </p>
          </div>
        </div>

        <div className="mb-5 inline-flex rounded-xl border border-slate-200 bg-white p-1">
          {(
            [
              { key: "submissions" as AdminTab, label: "Pending Residences", icon: Clock3 },
              { key: "photos" as AdminTab, label: "Photo Moderation", icon: ShieldCheck },
              { key: "reviews" as AdminTab, label: "Flagged Reviews", icon: Flag },
            ]
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {notice ? (
          <div
            className={`mb-5 rounded-xl px-3 py-2 text-sm ${
              notice.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {notice.message}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-700">
            Loading moderation queues...
          </div>
        ) : null}

        {!loading && activeTab === "submissions" ? (
          <div className="space-y-4">
            {pendingSubmissions.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-700">
                No pending residence submissions.
              </div>
            ) : (
              pendingSubmissions.map((submission) => {
                const draft = ensureDraft(submission.id);
                const approveKey = `submission-approve-${submission.id}`;
                const rejectKey = `submission-reject-${submission.id}`;
                const busy = rowLoading[approveKey] || rowLoading[rejectKey];

                return (
                  <article
                    key={submission.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                          {submission.proposed_name}
                        </h2>
                        <p className="text-sm text-slate-600">
                          {cityLabel(submission.proposed_city)} ·{" "}
                          {submission.proposed_housing_type === "PUBLIC_REGIONAL"
                            ? "Public / Regional"
                            : "Private"}
                        </p>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                        Pending
                      </span>
                    </div>

                    <p className="text-sm text-slate-700">
                      <span className="font-medium text-slate-900">Address:</span>{" "}
                      {submission.proposed_address}
                    </p>
                    {submission.proposed_website_url ? (
                      <p className="mt-1 text-sm text-slate-700">
                        <span className="font-medium text-slate-900">Website:</span>{" "}
                        <a
                          href={submission.proposed_website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="no-underline hover:underline"
                        >
                          {submission.proposed_website_url}
                        </a>
                      </p>
                    ) : null}

                    {submission.notes ? (
                      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Submitter Notes
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                          {submission.notes}
                        </p>
                      </div>
                    ) : null}

                    <p className="mt-3 text-xs text-slate-500">
                      Submitted: {formatDate(submission.created_at)}
                    </p>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                          Latitude
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          value={draft.latitude}
                          onChange={(e) =>
                            updateDraft(submission.id, { latitude: e.target.value })
                          }
                          placeholder="e.g. 45.0703"
                          className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-brand-500 focus:ring-2"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                          Longitude
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          value={draft.longitude}
                          onChange={(e) =>
                            updateDraft(submission.id, { longitude: e.target.value })
                          }
                          placeholder="e.g. 7.6869"
                          className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-brand-500 focus:ring-2"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                          Min rent (optional)
                        </label>
                        <input
                          type="number"
                          value={draft.minMonthlyRent}
                          onChange={(e) =>
                            updateDraft(submission.id, { minMonthlyRent: e.target.value })
                          }
                          className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-brand-500 focus:ring-2"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                          Max rent (optional)
                        </label>
                        <input
                          type="number"
                          value={draft.maxMonthlyRent}
                          onChange={(e) =>
                            updateDraft(submission.id, { maxMonthlyRent: e.target.value })
                          }
                          className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-brand-500 focus:ring-2"
                        />
                      </div>
                    </div>

                    <label className="mt-3 inline-flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={draft.markVerified}
                        onChange={(e) =>
                          updateDraft(submission.id, { markVerified: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                      Mark as verified
                    </label>

                    <div className="mt-3">
                      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                        Rejection reason (required if rejecting)
                      </label>
                      <textarea
                        rows={2}
                        value={draft.rejectionReason}
                        onChange={(e) =>
                          updateDraft(submission.id, { rejectionReason: e.target.value })
                        }
                        placeholder="Explain why..."
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2"
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void approveSubmission(submission)}
                        disabled={!!busy}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {rowLoading[approveKey] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        Approve & Publish
                      </button>

                      <button
                        type="button"
                        onClick={() => void rejectSubmission(submission)}
                        disabled={!!busy}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {rowLoading[rejectKey] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        Reject
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        ) : null}

        {!loading && activeTab === "photos" ? (
          <div className="space-y-4">
            {pendingPhotos.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-700">
                No pending photos for moderation.
              </div>
            ) : (
              pendingPhotos.map((photo) => {
                const approveKey = `photo-approve-${photo.id}`;
                const hideKey = `photo-hide-${photo.id}`;
                const busy = rowLoading[approveKey] || rowLoading[hideKey];
                const residence = residenceMap.get(photo.residence_id);

                return (
                  <article
                    key={photo.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                          {residence?.name || "Unknown Residence"}
                        </h2>
                        <p className="text-sm text-slate-600">
                          {photo.kind} · {photo.area_type.replaceAll("_", " ")}
                        </p>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                        Pending
                      </span>
                    </div>

                    <a
                      href={photo.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 no-underline hover:bg-slate-100"
                    >
                      Open photo URL
                    </a>

                    {photo.caption ? (
                      <p className="mt-3 text-sm text-slate-700">{photo.caption}</p>
                    ) : null}

                    <p className="mt-2 text-xs text-slate-500">
                      Uploaded: {formatDate(photo.created_at)}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void approvePhoto(photo)}
                        disabled={!!busy}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {rowLoading[approveKey] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        Approve
                      </button>

                      <button
                        type="button"
                        onClick={() => void hidePhoto(photo)}
                        disabled={!!busy}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {rowLoading[hideKey] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                        Keep hidden
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        ) : null}

        {!loading && activeTab === "reviews" ? (
          <div className="space-y-4">
            {flaggedReviews.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-700">
                No flagged reviews at the moment.
              </div>
            ) : (
              flaggedReviews.map((review) => {
                const publishKey = `review-publish-${review.id}`;
                const hideKey = `review-hide-${review.id}`;
                const busy = rowLoading[publishKey] || rowLoading[hideKey];
                const residence = residenceMap.get(review.residence_id);

                return (
                  <article
                    key={review.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                          {review.title || "Untitled review"}
                        </h2>
                        <p className="text-sm text-slate-600">
                          {residence?.name || "Unknown Residence"} · Rating:{" "}
                          {review.overall_rating.toFixed(1)} / 5
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-800">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Flagged
                      </span>
                    </div>

                    <p className="whitespace-pre-wrap text-sm text-slate-700">
                      {review.body}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      Created: {formatDate(review.created_at)}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void publishReview(review)}
                        disabled={!!busy}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {rowLoading[publishKey] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        Republish
                      </button>

                      <button
                        type="button"
                        onClick={() => void hideReview(review)}
                        disabled={!!busy}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {rowLoading[hideKey] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                        Hide
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        ) : null}
      </section>
    </main>
  );
}