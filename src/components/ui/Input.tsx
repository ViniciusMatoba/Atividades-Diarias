import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, id, className = "", ...props },
  ref,
) {
  const inputId = id ?? props.name;
  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-medium gd-text">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={`h-11 w-full rounded-xl border gd-border gd-surface-2 px-3 text-sm gd-text outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${className}`}
        {...props}
      />
    </div>
  );
});
