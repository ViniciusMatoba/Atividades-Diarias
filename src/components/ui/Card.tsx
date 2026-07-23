import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`gd-surface rounded-[var(--radius-card)] border gd-border p-4 ${className}`}
      {...props}
    />
  );
}
