import { Star } from "lucide-react";
import type { StarRating as Rating } from "@/lib/stars";

interface StarRatingProps {
  value: Rating | null;
  size?: number;
}

/** Estrelas de resultado. Acessível: aria-label textual além da cor. */
export function StarRating({ value, size = 18 }: StarRatingProps) {
  const filled = value ?? 0;
  return (
    <div
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={value ? `${value} de 3 estrelas` : "Sem estrelas ainda"}
    >
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= filled ? "text-[var(--color-warning)]" : "gd-muted opacity-40"}
          fill={i <= filled ? "currentColor" : "none"}
          aria-hidden
        />
      ))}
    </div>
  );
}
