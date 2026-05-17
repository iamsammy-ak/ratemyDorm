import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type StarRatingProps = {
  value: number;
  max?: number;
  size?: number;
  showValue?: boolean;
  className?: string;
  valueClassName?: string;
  ariaLabel?: string;
};

export function StarRating({
  value,
  max = 5,
  size = 18,
  showValue = true,
  className,
  valueClassName,
  ariaLabel,
}: StarRatingProps) {
  const clampedValue = Math.max(0, Math.min(value, max));
  const roundedValue = Number(clampedValue.toFixed(1));

  return (
    <div
      className={cn("inline-flex items-center gap-2", className)}
      role="img"
      aria-label={ariaLabel ?? `${roundedValue} out of ${max} stars`}
    >
      <div className="inline-flex items-center gap-1">
        {Array.from({ length: max }).map((_, index) => {
          const fillPercent = Math.max(
            0,
            Math.min(100, (clampedValue - index) * 100)
          );

          return (
            <span key={index} className="relative inline-flex">
              <Star size={size} className="text-slate-300" />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercent}%` }}
                aria-hidden="true"
              >
                <Star size={size} className="fill-amber-400 text-amber-400" />
              </span>
            </span>
          );
        })}
      </div>

      {showValue ? (
        <span className={cn("text-sm font-semibold text-slate-800", valueClassName)}>
          {roundedValue.toFixed(1)}
        </span>
      ) : null}
    </div>
  );
}

export default StarRating;