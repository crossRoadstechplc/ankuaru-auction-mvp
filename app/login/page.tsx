"use client";

import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center p-4 font-display">
      {/* Main Login Container */}
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

        {/* Authentication Card */}
        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-8 flex flex-col gap-6">
          <div className="text-center mb-2">
            <h2 className="text-xl font-bold text-coffee-bean dark:text-slate-100">Welcome Back</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Sign in to access your auction dashboard</p>
          </div>

          {/* Illustration / Image placeholder */}
          <div className="w-full h-32 rounded-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/30"></div>
            <img
              alt="Coffee Beans"
              className="w-full h-full object-cover opacity-60 mix-blend-overlay"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAn0paDiJU44mytkJBeZLTI4IM8-SVAQuuL0ci9pa6b-ro0m7hL9J3wko-xzM-Kur8yHQ0GSq_cBJDY9qsKkB5VLYuAB_9HCLEYBNwHPNeMLvO57LgOpJFis_mtULJVUdY9NZh599nWeSstIE4dTvX_EmESlHEFYwSE0bBo4-RXJaYXxGKuIL-jOLgugn_JNJJiwtQEPyUIi58l7IOA3WA-gKqHIv26mPRh7uICRSS0FZKdAmBQk0oSTJQDM4OMv1YXBpBYpknfcy8"
            />
          </div>

          <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
            {/* Name Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 px-1">Name</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-xl">
                  person
                </span>
                <input
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  placeholder="Enter your name"
                  type="text"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <Link className="text-xs font-medium text-primary hover:underline" href="#">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-xl">
                  lock
                </span>
                <input
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  placeholder="••••••••"
                  type="password"
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  type="button"
                >
                  <span className="material-symbols-outlined text-xl">visibility</span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 px-1">
              <input
                className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                id="remember"
                type="checkbox"
              />
              <label className="text-sm text-slate-600 dark:text-slate-400" htmlFor="remember">
                Keep me logged in
              </label>
            </div>

            {/* Login Button */}
            <Link
              href="/feed"
              className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] text-white font-bold py-3.5 rounded-lg shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2"
            >
              Login to Auction
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </Link>
          </form>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-400">Partners</span>
            </div>
          </div>

          {/* Request Access */}
          <button className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-xl">how_to_reg</span>
            Request Platform Access
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
            Ankuaru B2B Coffee Platform © 2024
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
