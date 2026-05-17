import * as React from "react";

type CanonicalHousingType = "PUBLIC_REGIONAL" | "PRIVATE";
type LegacyHousingType = "PUBLIC_DSU" | "PRIVATE";

type HousingBadgeProps = {
  type: CanonicalHousingType | LegacyHousingType;
  className?: string;
};

function normalizeHousingType(
  value: CanonicalHousingType | LegacyHousingType,
): CanonicalHousingType {
  return value === "PUBLIC_DSU" ? "PUBLIC_REGIONAL" : value;
}

export function HousingBadge({ type, className }: HousingBadgeProps) {
  const normalized = normalizeHousingType(type);
  const isPublic = normalized === "PUBLIC_REGIONAL";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        isPublic
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-brand-200 bg-brand-50 text-brand-700",
        className ?? "",
      ]
        .join(" ")
        .trim()}
      aria-label={isPublic ? "Public or regional residence" : "Private residence"}
    >
      {isPublic ? "Public / DSU" : "Private"}
    </span>
  );
}

export default HousingBadge;