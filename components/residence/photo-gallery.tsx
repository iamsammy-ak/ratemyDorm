"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Camera, ImageOff, ShieldCheck, Users } from "lucide-react";

import type { ResidencePhoto } from "@/lib/types";
import { cn } from "@/lib/utils";

type GalleryTab = "OFFICIAL" | "STUDENT";

interface PhotoGalleryProps {
  officialPhotos: ResidencePhoto[];
  studentPhotos: ResidencePhoto[];
  className?: string;
}

function EmptyGalleryState({ activeTab }: { activeTab: GalleryTab }) {
  const isOfficial = activeTab === "OFFICIAL";

  return (
    <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <ImageOff className="mb-3 h-8 w-8 text-slate-400" />
      <h3 className="text-base font-semibold text-slate-900">
        No {isOfficial ? "official" : "student"} photos yet
      </h3>
      <p className="mt-1 max-w-md text-sm text-slate-600">
        {isOfficial
          ? "Official marketing photos will appear here when available."
          : "Be the first to upload real student photos of rooms, kitchens, and bathrooms."}
      </p>
    </div>
  );
}

export function PhotoGallery({
  officialPhotos,
  studentPhotos,
  className,
}: PhotoGalleryProps) {
  const defaultTab: GalleryTab =
    officialPhotos.length > 0 ? "OFFICIAL" : "STUDENT";

  const [activeTab, setActiveTab] = useState<GalleryTab>(defaultTab);

  const activePhotos = useMemo(
    () => (activeTab === "OFFICIAL" ? officialPhotos : studentPhotos),
    [activeTab, officialPhotos, studentPhotos],
  );

  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(
    activePhotos[0]?.id ?? null,
  );

  useEffect(() => {
    if (activePhotos.length === 0) {
      setSelectedPhotoId(null);
      return;
    }

    const stillExists = activePhotos.some(
      (photo) => photo.id === selectedPhotoId,
    );
    if (!stillExists) {
      setSelectedPhotoId(activePhotos[0].id);
    }
  }, [activePhotos, selectedPhotoId]);

  const selectedPhoto =
    activePhotos.find((photo) => photo.id === selectedPhotoId) ??
    activePhotos[0] ??
    null;

  const hasNoPhotos = officialPhotos.length === 0 && studentPhotos.length === 0;

  if (hasNoPhotos) {
    return (
      <section className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <h2 className="section-title">Photo Gallery</h2>
        </div>
        <EmptyGalleryState activeTab="OFFICIAL" />
      </section>
    );
  }

  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="section-title">Photo Gallery</h2>

        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setActiveTab("OFFICIAL")}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition",
              activeTab === "OFFICIAL"
                ? "bg-brand-600 text-white"
                : "text-slate-600 hover:bg-slate-100",
            )}
          >
            <ShieldCheck className="h-4 w-4" />
            Official Photos
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-xs",
                activeTab === "OFFICIAL"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600",
              )}
            >
              {officialPhotos.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("STUDENT")}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition",
              activeTab === "STUDENT"
                ? "bg-coral-500 text-white"
                : "text-slate-600 hover:bg-slate-100",
            )}
          >
            <Users className="h-4 w-4" />
            Student Photos
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-xs",
                activeTab === "STUDENT"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600",
              )}
            >
              {studentPhotos.length}
            </span>
          </button>
        </div>
      </div>

      {activePhotos.length === 0 ? (
        <EmptyGalleryState activeTab={activeTab} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
          <div className="glass-card overflow-hidden">
            <div className="relative aspect-[16/10] w-full bg-slate-100">
              {selectedPhoto && (
                <Image
                  src={selectedPhoto.url}
                  alt={selectedPhoto.caption || "Residence photo"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 70vw"
                  priority
                />
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 p-4">
              <p className="text-sm text-slate-700">
                {selectedPhoto?.caption || "Photo"}
              </p>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                  activeTab === "OFFICIAL"
                    ? "bg-brand-50 text-brand-700"
                    : "bg-coral-50 text-coral-700",
                )}
              >
                {activeTab === "OFFICIAL" ? "Official" : "Student-uploaded"}
              </span>
            </div>
          </div>

          <aside className="glass-card p-3">
            <div className="mb-2 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Camera className="h-3.5 w-3.5" />
              Thumbnails
            </div>

            <div className="grid max-h-[520px] grid-cols-2 gap-2 overflow-auto pr-1 lg:grid-cols-1">
              {activePhotos.map((photo) => {
                const isSelected = selectedPhoto?.id === photo.id;

                return (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setSelectedPhotoId(photo.id)}
                    className={cn(
                      "group relative overflow-hidden rounded-xl border text-left transition",
                      isSelected
                        ? "border-brand-500 ring-2 ring-brand-200"
                        : "border-slate-200 hover:border-slate-300",
                    )}
                  >
                    <div className="relative aspect-[4/3] w-full bg-slate-100">
                      <Image
                        src={photo.url}
                        alt={photo.caption || "Thumbnail"}
                        fill
                        className="object-cover transition duration-200 group-hover:scale-[1.03]"
                        sizes="(max-width: 1024px) 40vw, 240px"
                      />
                    </div>
                    <div className="border-t border-slate-200 bg-white px-2 py-1.5">
                      <p className="line-clamp-1 text-xs text-slate-600">
                        {photo.caption || "Photo"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}

export default PhotoGallery;