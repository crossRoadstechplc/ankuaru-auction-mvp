"use client";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Link from "next/link";
import { useState } from "react";

export default function PostAuctionPage() {
  const [activeTab, setActiveTab] = useState("sell");

  const fields = [
    { id: "product_name", label: "Product Name", placeholder: "e.g. Ethiopia Sidamo G1" },
    { id: "region", label: "Region", placeholder: "e.g. Sidama, Ethiopia" },
    { id: "type", label: "Type", placeholder: "e.g. Arabica" },
    { id: "grade", label: "Grade", placeholder: "e.g. Grade 1" },
    { id: "process", label: "Process", placeholder: "e.g. Washed / Natural" },
    { id: "class", label: "Class", placeholder: "e.g. Specialty" },
    { id: "measurement", label: "Measurement", placeholder: "e.g. Per KG / Per Bag" },
    { id: "quantity", label: "Quantity", placeholder: "e.g. 500" },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
      <Header />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 md:px-10">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link className="hover:text-primary" href="/dashboard">Dashboard</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link className="hover:text-primary" href="/feed">Auctions</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="font-medium text-slate-900 dark:text-white">Post New Auction</span>
        </nav>

        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            {activeTab === "sell" ? "Post New Auction" : "Request Buy Order"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {activeTab === "sell"
              ? "Specify your coffee lot details and auction terms to start receiving bids."
              : "Post your requirements to receive offers from top coffee producers."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mb-8 flex w-full border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("sell")}
            className={`group relative flex items-center gap-2 px-6 pb-4 text-sm font-bold tracking-wide transition-all ${activeTab === "sell" ? "text-primary border-b-2 border-primary" : "text-slate-400 hover:text-slate-600"
              }`}
          >
            <span className="material-symbols-outlined">sell</span>
            Sell Auction
          </button>
          <button
            onClick={() => setActiveTab("buy")}
            className={`group relative flex items-center gap-2 px-6 pb-4 text-sm font-bold tracking-wide transition-all ${activeTab === "buy" ? "text-primary border-b-2 border-primary" : "text-slate-400 hover:text-slate-600"
              }`}
          >
            <span className="material-symbols-outlined text-lg">shopping_cart</span>
            Buy Auction (Reverse)
          </button>
        </div>

        {/* Form Container */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
            {/* Section 1: Product Basics */}
            <div className="p-6 md:p-8">
              <div className="mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">inventory_2</span>
                <h2 className="text-lg font-bold">
                  {activeTab === "sell" ? "Product Details" : "Requirement Details"}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {fields.map((field) => (
                  <div key={field.id} className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {field.label}
                    </label>
                    <input
                      className="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:ring-primary dark:border-slate-800 dark:bg-slate-900 outline-none transition-all focus:ring-2 focus:ring-primary/20"
                      placeholder={field.placeholder}
                      type="text"
                      id={field.id}
                      name={field.id}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px w-full bg-slate-100 dark:bg-slate-800"></div>

            {/* Section 2: Visibility */}
            <div className="p-6 md:p-8">
              <div className="mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">groups</span>
                <h2 className="text-lg font-bold">Visibility & Audience</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {['Public', 'Followers', 'Custom List'].map((type, i) => (
                  <label key={type} className="group relative flex cursor-pointer flex-col gap-3 rounded-xl border border-slate-200 p-4 transition-all hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                    <input defaultChecked={i === 0} className="peer absolute top-4 right-4 text-primary focus:ring-primary" name="audience" type="radio" />
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="material-symbols-outlined">{i === 0 ? 'public' : i === 1 ? 'stars' : 'person_add'}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{type}</h4>
                      <p className="text-xs text-slate-500">
                        {i === 0 ? "Platform-wide visibility." : i === 1 ? "Only your followers can bid." : "Selected partners only."}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Footer Action */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-6 dark:border-slate-800 dark:bg-slate-900/80 md:px-8">
              <button className="text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400" type="button">Save as Draft</button>
              <div className="flex items-center gap-4">
                <button className="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800" type="button">Preview</button>
                <button className="rounded-lg bg-primary-dark px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95" type="submit">
                  {activeTab === "sell" ? "Create Auction" : "Post Request"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
