"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { RegisterData } from "../../lib/types";

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterData>({
    username: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.username || !formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await register(formData);
      setSuccess(true);

      // Redirect to feed after successful registration
      setTimeout(() => {
        router.push("/feed");
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center p-4 font-display">
        <div className="w-full max-w-[440px] flex flex-col items-center">
          <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-green-600 dark:text-green-400">check_circle</span>
            </div>
            <h2 className="text-2xl font-bold text-coffee-bean dark:text-slate-100 mb-2">Registration Successful!</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Welcome to Ankuaru. Redirecting to your dashboard...</p>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-full animate-pulse" style={{ width: "100%" }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center p-4 font-display">
      {/* Main Register Container */}
      <div className="w-full max-w-[440px] flex flex-col items-center">
        {/* Logo Header */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="size-12 bg-primary flex items-center justify-center rounded-xl text-white shadow-lg shadow-primary/20">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-coffee-bean dark:text-slate-100">Ankuaru</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">B2B Coffee Auction Platform</p>
        </div>

        {/* Registration Card */}
        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-8 flex flex-col gap-6">
          <div className="text-center mb-2">
            <h2 className="text-xl font-bold text-coffee-bean dark:text-slate-100">Create Account</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Join the coffee marketplace</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-sm">error</span>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Illustration / Image placeholder */}
          {/* <div className="w-full h-32 rounded-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/30"></div>
            <img
              alt="Coffee Beans"
              className="w-full h-full object-cover opacity-60 mix-blend-overlay"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAn0paDiJU44mytkJBeZLTI4IM8-SVAQuuL0ci9pa6b-ro0m7hL9J3wko-xzM-Kur8yHQ0GSq_cBJDY9qsKkB5VLYuAB_9HCLEYBNwHPNeMLvO57LgOpJFis_mtULJVUdY9NZh599nWeSstIE4dTvX_EmESlHEFYwSE0bBo4-RXJaYXxGKuIL-jOLgugn_JNJJiwtQEPyUIi58l7IOA3WA-gKqHIv26mPRh7uICRSS0FZKdAmBQk0oSTJQDM4OMv1YXBpBYpknfcy8"
            />
          </div> */}

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 px-1">Username</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-xl">
                  person
                </span>
                <input
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  placeholder="Choose a username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 px-1">Email</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-xl">
                  email
                </span>
                <input
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  placeholder="Enter your email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 px-1">Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-xl">
                  lock
                </span>
                <input
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  placeholder="Create a strong password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(prev => !prev)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>


            {/* Terms and Conditions */}
            <div className="flex items-start gap-2 px-1">
              <input
                className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary mt-0.5"
                id="terms"
                type="checkbox"
                required
              />
              <label className="text-sm text-slate-600 dark:text-slate-400" htmlFor="terms">
                I agree to the <Link href="#" className="text-primary hover:underline">Terms of Service</Link> and <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
              </label>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-xl animate-spin">refresh</span>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-400">Already have an account?</span>
            </div>
          </div>

          {/* Login Link */}
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">login</span>
            Sign In Instead
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
            Ankuaru B2B Coffee Platform © 2026
            <span className="mx-1">•</span>
            <Link className="hover:text-primary underline decoration-primary/30" href="#">
              Terms
            </Link>
            <span className="mx-1">•</span>
            <Link className="hover:text-primary underline decoration-primary/30" href="#">
              Privacy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
