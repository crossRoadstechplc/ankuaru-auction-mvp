"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthForm, FormField } from "../../components/auth/AuthForm";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { LoginData, loginDataSchema, safeParse } from "../../lib/validation";
import { useAuthStore } from "../../stores/auth.store";

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing
    if (error) setError(null);
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const result = safeParse(loginDataSchema, formData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path.length > 0) {
          errors[issue.path[0] as string] = issue.message;
        }
      });
      setFieldErrors(errors);
      return false;
    }

    setFieldErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form with Zod
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await login(formData);

      // Redirect to feed after successful login
      router.push("/feed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout imagePosition="right" showImageContent={false}>
      <AuthForm
        title="Welcome Back"
        subtitle="Sign in to access your account"
        onSubmit={handleSubmit}
        submitText="Login to Auction"
        submitIcon="arrow_forward"
        loading={isLoading}
        error={error}
        footer={
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-400">
                  New to Ankuaru?
                </span>
              </div>
            </div>

            <Link
              href="/register"
              className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">
                how_to_reg
              </span>
              Create Account
            </Link>
          </>
        }
      >
        <FormField
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          error={fieldErrors.email}
          disabled={isLoading}
          required
          icon="email"
        />

        <FormField
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          error={fieldErrors.password}
          disabled={isLoading}
          required
          icon="lock"
          showPasswordToggle
          showPassword={showPassword}
          onPasswordToggle={() => setShowPassword(!showPassword)}
          rightElement={
            <Link
              className="text-xs font-medium text-primary hover:underline"
              href="#"
            >
              Forgot password?
            </Link>
          }
        />

        <div className="flex items-center gap-2 px-1">
          <input
            className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
            id="remember"
            type="checkbox"
          />
          <label
            className="text-sm text-slate-600 dark:text-slate-400"
            htmlFor="remember"
          >
            Keep me logged in
          </label>
        </div>
      </AuthForm>
    </AuthLayout>
  );
}
