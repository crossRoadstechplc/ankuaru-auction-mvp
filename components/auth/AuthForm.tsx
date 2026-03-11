"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: string;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onPasswordToggle?: () => void;
  rightElement?: ReactNode;
  minLength?: number;
}

export function FormField({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  required = false,
  icon,
  showPasswordToggle = false,
  showPassword = false,
  onPasswordToggle,
  rightElement,
  minLength,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 px-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-xl">
            {icon}
          </span>
        )}
        <Input
          className={cn(
            icon && "pl-11",
            (showPasswordToggle || rightElement) && "pr-12",
            error &&
              "border-red-300 dark:border-red-700 focus:ring-red-100 dark:focus:ring-red-900/20",
          )}
          type={showPasswordToggle && showPassword ? "text" : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          minLength={minLength}
        />
        {showPasswordToggle && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            type="button"
            onClick={onPasswordToggle}
            disabled={disabled}
          >
            <span className="material-symbols-outlined text-xl">
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        )}
        {rightElement && !showPasswordToggle && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 px-1 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

interface AuthFormProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  submitText: string;
  submitIcon?: string;
  loading?: boolean;
  disabled?: boolean;
  error?: string | null;
  footer?: ReactNode;
}

export function AuthForm({
  title,
  subtitle,
  children,
  onSubmit,
  submitText,
  submitIcon,
  loading = false,
  disabled = false,
  error = null,
  footer,
}: AuthFormProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-coffee-bean dark:text-slate-100">
          {title}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {subtitle}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-sm">
            error
          </span>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        {children}

        <Button
          type="submit"
          disabled={disabled || loading}
          className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined text-xl animate-spin">
                refresh
              </span>
              {submitText.replace(/^[^ ]+/, "Processing")}
            </>
          ) : (
            <>
              {submitText}
              {submitIcon && (
                <span className="material-symbols-outlined text-xl">
                  {submitIcon}
                </span>
              )}
            </>
          )}
        </Button>
      </form>

      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="mb-8 flex flex-col items-center gap-2">
      <div className="size-12 bg-primary flex items-center justify-center rounded-xl text-white shadow-lg shadow-primary/20">
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-coffee-bean dark:text-slate-100">
        {title}
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
        {subtitle}
      </p>
    </div>
  );
}

interface AuthFooterProps {
  terms?: boolean;
}

export function AuthFooter({ terms = false }: AuthFooterProps) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 px-8 py-4 border-t border-slate-200 dark:border-slate-700">
      <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
        Ankuaru B2B Coffee Platform © 2026
        <span className="mx-1">•</span>
        <a
          className="hover:text-primary underline decoration-primary/30"
          href="#"
        >
          Terms
        </a>
        <span className="mx-1">•</span>
        <a
          className="hover:text-primary underline decoration-primary/30"
          href="#"
        >
          Privacy
        </a>
        {terms && (
          <>
            <span className="mx-1">•</span>
            <a
              className="hover:text-primary underline decoration-primary/30"
              href="#"
            >
              Guidelines
            </a>
          </>
        )}
      </p>
    </div>
  );
}
