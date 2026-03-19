"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AuthForm,
  FormField
} from "../../components/auth/AuthForm";
import { AuthLayout } from "../../components/auth/AuthLayout";
import {
  RegisterData,
  registerDataSchema,
  safeParse,
} from "../../lib/validation";
import { useAuthStore } from "../../stores/auth.store";

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterData>({
    username: "",
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, isLoading, error: authError } = useAuthStore();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field errors when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const result = safeParse(registerDataSchema, formData);

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

    if (!validateForm()) {
      return;
    }

    try {
      await register(formData);
      setSuccess(true);

      // Redirect to feed after successful registration
      setTimeout(() => {
        router.push("/feed");
      }, 2000);
    } catch {
      // Error is already captured in the store
    }
  };

  if (success) {
    return (
      <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md mx-auto">
          <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-green-600 dark:text-green-400">
                check_circle
              </span>
            </div>
            <h2 className="text-2xl font-bold text-coffee-bean dark:text-slate-100 mb-2">
              Registration Successful!
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Welcome to Ankuaru. Redirecting to your dashboard...
            </p>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full animate-pulse"
                style={{ width: "100%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout imagePosition="left">
      <AuthForm
        title="Create Account"
        subtitle="Join our community of auction enthusiasts"
        onSubmit={handleSubmit}
        submitText="Create Account"
        submitIcon="arrow_forward"
        loading={isLoading}
        error={authError}
        footer={
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-400">
                  Already have an account?
                </span>
              </div>
            </div>

            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">login</span>
              Sign In Instead
            </Link>
          </>
        }
      >
        <FormField
          label="Username"
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Choose a username"
          error={fieldErrors.username}
          disabled={isLoading}
          required
          icon="person"
        />

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
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Create a strong password"
          error={fieldErrors.password}
          disabled={isLoading}
          required
          minLength={6}
          icon="lock"
          showPasswordToggle
          showPassword={showPassword}
          onPasswordToggle={() => setShowPassword((prev) => !prev)}
        />

        <div className="flex items-start gap-2 px-1">
          <input
            className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary mt-0.5"
            id="terms"
            type="checkbox"
            required
          />
          <label
            className="text-sm text-slate-600 dark:text-slate-400"
            htmlFor="terms"
          >
            I agree to the{" "}
            <Link href="#" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </label>
        </div>
      </AuthForm>
    </AuthLayout>
  );
}
