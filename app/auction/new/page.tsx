"use client";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import apiClient from "../../../lib/api";
import { CreateAuctionData } from "../../../lib/types";

export default function PostAuctionPage() {
  const [activeTab, setActiveTab] = useState("sell");
  const [selectedVisibility, setSelectedVisibility] = useState<
    "PUBLIC" | "FOLLOWERS" | "CUSTOM"
  >("PUBLIC");
  const [formData, setFormData] = useState<CreateAuctionData>({
    title: "",
    auctionCategory: "Coffee",
    itemDescription: "",
    reservePrice: "",
    minBid: "",
    auctionType: "SELL",
    visibility: "PUBLIC",
    startAt: new Date().toISOString(),
    endAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const fields = [
    {
      id: "title",
      label: "Auction Title",
      placeholder: "e.g. Ethiopia Sidamo G1 Natural",
      type: "text",
      required: true,
    },
    {
      id: "auctionCategory",
      label: "Category",
      type: "select",
      options: [
        { value: "Coffee", label: "Coffee" },
        { value: "Electronics", label: "Electronics" },
        { value: "Equipment", label: "Equipment" },
        { value: "Other", label: "Other" },
      ],
      required: true,
    },
    {
      id: "itemDescription",
      label: "Description",
      placeholder: "Detailed description of your item",
      type: "textarea",
      required: true,
    },
    {
      id: "minBid",
      label: "Initial Bid",
      placeholder: "e.g. 100",
      type: "number",
      required: true,
    },
    {
      id: "startAt",
      label: "Start Date",
      type: "date",
      required: true,
    },
    {
      id: "endAt",
      label: "End Date",
      type: "date",
      required: true,
    },
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.title || !formData.itemDescription || !formData.minBid) {
      setError("All required fields must be filled");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Format date to proper ISO format
      const formatDate = (dateString: string) => {
        if (!dateString) return new Date().toISOString();
        return new Date(dateString).toISOString();
      };

      // Prepare auction data based on active tab
      const auctionData = {
        title: formData.title,
        auctionCategory: formData.auctionCategory,
        itemDescription: formData.itemDescription,
        reservePrice: formData.minBid, // Use minBid as reservePrice for simplicity
        minBid: formData.minBid,
        auctionType: activeTab.toUpperCase() as "SELL" | "BUY",
        visibility: selectedVisibility,
        startAt: formatDate(formData.startAt),
        endAt: formatDate(formData.endAt),
      };

      console.log("Submitting auction data:", auctionData);
      await apiClient.createAuction(auctionData);
      setSuccess(true);

      // Redirect to feed after successful creation
      setTimeout(() => {
        router.push("/feed");
      }, 2000);
    } catch (err) {
      console.error("Auction creation error:", err);
      setError(err instanceof Error ? err.message : "Failed to create auction");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
        <Header />
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 md:px-10">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Please login to create an auction
            </p>
            <Link
              href="/login"
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Login
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (success) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
        <Header />
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 md:px-10">
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-green-600 dark:text-green-400">
                check_circle
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Auction Created Successfully!
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Redirecting to your auction feed...
            </p>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full animate-pulse"
                style={{ width: "100%" }}
              ></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
      <Header />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 md:px-10">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link className="hover:text-primary" href="/dashboard">
            Dashboard
          </Link>
          <span className="material-symbols-outlined text-xs">
            chevron_right
          </span>
          <Link className="hover:text-primary" href="/feed">
            Auctions
          </Link>
          <span className="material-symbols-outlined text-xs">
            chevron_right
          </span>
          <span className="font-medium text-slate-900 dark:text-white">
            Post New Auction
          </span>
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
            className={`group relative flex items-center gap-2 px-6 pb-4 text-sm font-bold tracking-wide transition-all ${
              activeTab === "sell"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <span className="material-symbols-outlined">sell</span>
            Sell Auction
          </button>
          <button
            onClick={() => setActiveTab("buy")}
            className={`group relative flex items-center gap-2 px-6 pb-4 text-sm font-bold tracking-wide transition-all ${
              activeTab === "buy"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              shopping_cart
            </span>
            Buy Auction (Reverse)
          </button>
        </div>

        {/* Form Container */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mx-6 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-sm">
                  error
                </span>
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            </div>
          )}

          <form className="flex flex-col" onSubmit={handleSubmit}>
            {/* Section 1: Product Basics */}
            <div className="p-6 md:p-8">
              <div className="mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  inventory_2
                </span>
                <h2 className="text-lg font-bold">
                  {activeTab === "sell"
                    ? "Product Details"
                    : "Requirement Details"}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {fields.map((field) => (
                  <div key={field.id} className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    {field.type === "select" ? (
                      <select
                        className="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:ring-primary dark:border-slate-800 dark:bg-slate-900 outline-none transition-all focus:ring-2 focus:ring-primary/20"
                        id={field.id}
                        name={field.id}
                        value={formData[field.id as keyof CreateAuctionData]}
                        onChange={handleChange}
                        required={field.required}
                      >
                        <option value="">Select {field.label}</option>
                        {field.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea
                        className="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:ring-primary dark:border-slate-800 dark:bg-slate-900 outline-none transition-all focus:ring-2 focus:ring-primary/20 resize-none"
                        placeholder={field.placeholder}
                        id={field.id}
                        name={field.id}
                        value={formData[field.id as keyof CreateAuctionData]}
                        onChange={handleChange}
                        required={field.required}
                        rows={4}
                      />
                    ) : (
                      <input
                        className="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:ring-primary dark:border-slate-800 dark:bg-slate-900 outline-none transition-all focus:ring-2 focus:ring-primary/20"
                        placeholder={field.placeholder}
                        type={field.type || "text"}
                        id={field.id}
                        name={field.id}
                        value={formData[field.id as keyof CreateAuctionData]}
                        onChange={handleChange}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Visibility Selection */}
            <div className="p-6 md:p-8">
              <div className="mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  groups
                </span>
                <h2 className="text-lg font-bold">Visibility & Audience</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  {
                    value: "PUBLIC",
                    label: "Public",
                    icon: "public",
                    description: "Platform-wide visibility.",
                  },
                  {
                    value: "FOLLOWERS",
                    label: "Followers Only",
                    icon: "stars",
                    description: "Only your followers can bid.",
                  },
                  {
                    value: "CUSTOM",
                    label: "Custom",
                    icon: "person_add",
                    description: "Selected partners only.",
                  },
                ].map((type) => (
                  <label
                    key={type.value}
                    className={`group relative flex cursor-pointer flex-col gap-3 rounded-xl border p-4 transition-all hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 ${
                      selectedVisibility === type.value
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={type.value}
                      checked={selectedVisibility === type.value}
                      onChange={(e) =>
                        setSelectedVisibility(
                          e.target.value as "PUBLIC" | "FOLLOWERS" | "CUSTOM",
                        )
                      }
                      className="sr-only"
                    />
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="material-symbols-outlined">
                        {type.icon}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{type.label}</h4>
                      <p className="text-xs text-slate-500">
                        {type.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Footer Action */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-6 dark:border-slate-800 dark:bg-slate-900/80 md:px-8">
              <button
                className="text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400"
                type="button"
                disabled={isLoading}
              >
                Save as Draft
              </button>
              <div className="flex items-center gap-4">
                <button
                  className="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800"
                  type="button"
                  disabled={isLoading}
                >
                  Preview
                </button>
                <button
                  className="rounded-lg bg-primary-dark px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined text-lg animate-spin">
                        refresh
                      </span>
                      Creating...
                    </>
                  ) : activeTab === "sell" ? (
                    "Create Auction"
                  ) : (
                    "Post Request"
                  )}
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
