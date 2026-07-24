import { forwardRef, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, id, type, className = "", ...props },
  ref,
) {
  const inputId = id ?? props.name;
  const isPasswordField = type === "password";
  const [showPassword, setShowPassword] = useState(false);

  const activeType = isPasswordField ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-medium gd-text">
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          ref={ref}
          id={inputId}
          type={activeType}
          className={`h-11 w-full rounded-xl border gd-border gd-surface-2 px-3 ${
            isPasswordField ? "pr-10" : ""
          } text-sm gd-text outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${className}`}
          {...props}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
            className="absolute right-3 p-1 text-gray-400 hover:text-gray-200 transition-colors focus:outline-none"
            aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
          >
            {showPassword ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
          </button>
        )}
      </div>
    </div>
  );
});
