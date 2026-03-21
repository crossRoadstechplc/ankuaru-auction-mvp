"use client";

import Header from "@/components/layout/Header";
import {
  useAuctionFormOptionsQuery,
  useCreateAuctionMutation,
} from "@/src/features/auctions/queries/hooks";
import { profileApi } from "@/src/features/profile/api/profile.api";
import { useMyFollowersQuery } from "@/src/features/profile/queries/hooks";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AuctionSelectOption,
  CreateAuctionData,
  User,
} from "../../../lib/types";
import { useAuthStore } from "../../../stores/auth.store";

type ProductOptionFieldKey =
  | "region"
  | "commodityType"
  | "grade"
  | "process"
  | "transaction"
  | "commodityBrand"
  | "commodityClass"
  | "commoditySize"
  | "quantityUnit";

type ProductOptionFieldDefinition = {
  key: ProductOptionFieldKey;
  label: string;
  loadingText: string;
  unavailableText: string;
  emptyText: string;
};

type FormSection = "details" | "commercial" | "access";

type FormFieldName = keyof CreateAuctionData | "selectedUserIds";

const FIELD_SECTION_MAP: Record<FormFieldName, FormSection> = {
  title: "details",
  auctionCategory: "details",
  productName: "details",
  region: "details",
  commodityType: "details",
  grade: "details",
  process: "details",
  transaction: "details",
  commodityBrand: "details",
  commodityClass: "details",
  commoditySize: "details",
  quantity: "details",
  quantityUnit: "details",
  itemDescription: "commercial",
  reservePrice: "commercial",
  minBid: "commercial",
  auctionType: "details",
  visibility: "access",
  auctionImageUrl: "details",
  startAt: "commercial",
  endAt: "commercial",
  selectedUserIds: "access",
};

const PRODUCT_OPTION_FIELD_DEFINITIONS: ProductOptionFieldDefinition[] = [
  {
    key: "region",
    label: "Region",
    loadingText: "Loading regions...",
    unavailableText: "Unable to load regions",
    emptyText: "No regions for this product",
  },
  {
    key: "commodityType",
    label: "Commodity Type",
    loadingText: "Loading commodity types...",
    unavailableText: "Unable to load commodity types",
    emptyText: "No commodity types for this product",
  },
  {
    key: "grade",
    label: "Grade",
    loadingText: "Loading grades...",
    unavailableText: "Unable to load grades",
    emptyText: "No grades for this product",
  },
  {
    key: "process",
    label: "Process",
    loadingText: "Loading processes...",
    unavailableText: "Unable to load processes",
    emptyText: "No processes for this product",
  },
  {
    key: "transaction",
    label: "Transaction",
    loadingText: "Loading transactions...",
    unavailableText: "Unable to load transactions",
    emptyText: "No transactions for this product",
  },
  {
    key: "commodityBrand",
    label: "Commodity Brand",
    loadingText: "Loading brands...",
    unavailableText: "Unable to load brands",
    emptyText: "No brands for this product",
  },
  {
    key: "commodityClass",
    label: "Commodity Class",
    loadingText: "Loading classes...",
    unavailableText: "Unable to load classes",
    emptyText: "No classes for this product",
  },
  {
    key: "commoditySize",
    label: "Commodity Size",
    loadingText: "Loading sizes...",
    unavailableText: "Unable to load sizes",
    emptyText: "No sizes for this product",
  },
  {
    key: "quantityUnit",
    label: "Quantity Unit",
    loadingText: "Loading quantity units...",
    unavailableText: "Unable to load quantity units",
    emptyText: "No quantity units for this product",
  },
];

function hasOptionValue(
  options: AuctionSelectOption[],
  value: string | undefined,
): boolean {
  if (!value) {
    return false;
  }

  return options.some((option) => option.value === value);
}

function toDateTimeLocalValue(value: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

const INITIAL_AUCTION_FORM_DATA: CreateAuctionData = (() => {
  const now = new Date();
  const start = new Date(now.getTime() + 15 * 60 * 1000);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  return {
    title: "",
    auctionCategory: "",
    productName: "",
    region: "",
    commodityType: "",
    grade: "",
    process: "",
    transaction: "",
    commodityBrand: "",
    commodityClass: "",
    commoditySize: "",
    quantity: "",
    quantityUnit: "",
    itemDescription: "",
    reservePrice: "",
    minBid: "",
    auctionType: "SELL",
    visibility: "PUBLIC",
    auctionImageUrl: null,
    startAt: toDateTimeLocalValue(start.toISOString()),
    endAt: toDateTimeLocalValue(end.toISOString()),
  };
})();

export default function PostAuctionPage() {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"sell" | "buy">(
    requestedTab === "buy" ? "buy" : "sell",
  );
  const [activeFormSection, setActiveFormSection] =
    useState<FormSection>("details");
  const [selectedVisibility, setSelectedVisibility] = useState<
    "PUBLIC" | "FOLLOWERS" | "SELECTED"
  >("PUBLIC");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedBidderSearch, setSelectedBidderSearch] = useState("");
  const [manualSelectedUserId, setManualSelectedUserId] = useState("");
  const [manualSelectedUsers, setManualSelectedUsers] = useState<User[]>([]);
  const [selectedBidderError, setSelectedBidderError] = useState<string | null>(
    null,
  );
  const [isAddingSelectedUser, setIsAddingSelectedUser] = useState(false);
  const [formData, setFormData] = useState<CreateAuctionData>(
    INITIAL_AUCTION_FORM_DATA,
  );
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<FormFieldName, string>>
  >({});

  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const {
    data: followers = [],
    isLoading: isFollowersLoading,
    error: followersErrorState,
  } = useMyFollowersQuery();
  const createAuctionMutation = useCreateAuctionMutation();
  const formOptionsParams = useMemo(
    () => ({
      category: formData.auctionCategory || undefined,
      productName: formData.productName || undefined,
    }),
    [formData.auctionCategory, formData.productName],
  );
  const {
    data: auctionFormOptions,
    isLoading: isFormOptionsLoading,
    error: auctionFormOptionsError,
    refetch: refetchAuctionFormOptions,
  } = useAuctionFormOptionsQuery(formOptionsParams);

  const followersError =
    followersErrorState instanceof Error ? followersErrorState.message : null;
  const formOptionsError =
    auctionFormOptionsError instanceof Error
      ? auctionFormOptionsError.message
      : null;
  const categoryOptions = auctionFormOptions?.categories ?? [];
  const productNameOptions = auctionFormOptions?.productNames ?? [];
  const requiredProductFieldSet = useMemo(
    () => new Set(auctionFormOptions?.requiredFields ?? []),
    [auctionFormOptions?.requiredFields],
  );
  const productOptionMap = useMemo(
    () => ({
      region: auctionFormOptions?.regions ?? [],
      commodityType: auctionFormOptions?.commodityTypes ?? [],
      grade: auctionFormOptions?.grades ?? [],
      process: auctionFormOptions?.processes ?? [],
      transaction: auctionFormOptions?.transactions ?? [],
      commodityBrand: auctionFormOptions?.commodityBrands ?? [],
      commodityClass: auctionFormOptions?.commodityClasses ?? [],
      commoditySize: auctionFormOptions?.commoditySizes ?? [],
      quantityUnit: auctionFormOptions?.quantityUnits ?? [],
    }),
    [auctionFormOptions],
  );
  const isSubmitting = createAuctionMutation.isPending;
  const isFormOptionsErrored = !!formOptionsError;
  const isFormOptionsBusy = isFormOptionsLoading && !isFormOptionsErrored;
  const isWaitingForDependentOptions =
    isFormOptionsBusy &&
    (!!formData.auctionCategory || categoryOptions.length === 0);
  const selectedAuctionImage =
    formData.auctionImageUrl instanceof File ? formData.auctionImageUrl : null;
  const filteredFollowers = useMemo(() => {
    const query = selectedBidderSearch.trim().toLowerCase();

    if (!query) {
      return followers;
    }

    return followers.filter((follower) =>
      [follower.fullName, follower.username, follower.email, follower.id].some(
        (value) => value?.toLowerCase().includes(query),
      ),
    );
  }, [followers, selectedBidderSearch]);
  const selectedBidderUsers = useMemo(() => {
    const selectedUserMap = new Map<string, User>();

    followers.forEach((follower) => {
      if (selectedUserIds.includes(follower.id)) {
        selectedUserMap.set(follower.id, follower);
      }
    });

    manualSelectedUsers.forEach((user) => {
      if (selectedUserIds.includes(user.id)) {
        selectedUserMap.set(user.id, user);
      }
    });

    return Array.from(selectedUserMap.values());
  }, [followers, manualSelectedUsers, selectedUserIds]);

  const isCategorySelectDisabled =
    isSubmitting ||
    ((isFormOptionsBusy || isFormOptionsErrored) &&
      categoryOptions.length === 0);
  const isProductSelectDisabled =
    isSubmitting ||
    !formData.auctionCategory ||
    isFormOptionsBusy ||
    productNameOptions.length === 0;
  const productOptionFields = useMemo(() => {
    if (!formData.productName) {
      return [];
    }

    return PRODUCT_OPTION_FIELD_DEFINITIONS.map((field) => {
      const options = productOptionMap[field.key];
      const required = requiredProductFieldSet.has(field.key);

      return {
        ...field,
        options,
        required,
        disabled: isSubmitting || isFormOptionsBusy || options.length === 0,
      };
    }).filter((field) => field.options.length > 0 || field.required);
  }, [
    formData.productName,
    isFormOptionsBusy,
    isSubmitting,
    productOptionMap,
    requiredProductFieldSet,
  ]);

  const clearFieldErrors = (...fields: FormFieldName[]) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      let didChange = false;

      fields.forEach((field) => {
        if (field in next) {
          delete next[field];
          didChange = true;
        }
      });

      return didChange ? next : prev;
    });
  };

  const focusField = (field: FormFieldName) => {
    const selectors: Record<FormFieldName, string> = {
      title: '[name="title"]',
      auctionCategory: '[name="auctionCategory"]',
      productName: '[name="productName"]',
      region: '[name="region"]',
      commodityType: '[name="commodityType"]',
      grade: '[name="grade"]',
      process: '[name="process"]',
      transaction: '[name="transaction"]',
      commodityBrand: '[name="commodityBrand"]',
      commodityClass: '[name="commodityClass"]',
      commoditySize: '[name="commoditySize"]',
      quantity: '[name="quantity"]',
      quantityUnit: '[name="quantityUnit"]',
      itemDescription: '[name="itemDescription"]',
      reservePrice: '[name="reservePrice"]',
      minBid: '[name="minBid"]',
      auctionType: '[data-field-anchor="auctionType"]',
      visibility: '[data-field-anchor="selectedVisibility"]',
      auctionImageUrl: '[name="auctionImageUrl"]',
      startAt: '[name="startAt"]',
      endAt: '[name="endAt"]',
      selectedUserIds: '[data-field-anchor="selectedUserIds"]',
    };

    const section = FIELD_SECTION_MAP[field];
    setActiveFormSection(section);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const target = document.querySelector<HTMLElement>(selectors[field]);

        if (!target) {
          return;
        }

        target.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        if ("focus" in target) {
          target.focus({ preventScroll: true });
        }
      });
    });
  };

  const showFieldError = (field: FormFieldName, message: string) => {
    setFieldErrors({ [field]: message });
    setError(message);
    focusField(field);
  };

  const renderFieldError = (field: FormFieldName) =>
    fieldErrors[field] ? (
      <p className="text-xs font-medium text-red-600 dark:text-red-400">
        {fieldErrors[field]}
      </p>
    ) : null;

  const handleCategoryChange = (auctionCategory: string) => {
    setFormData((prev) => ({
      ...prev,
      auctionCategory,
      productName: "",
      region: "",
      commodityType: "",
      grade: "",
      process: "",
      transaction: "",
      commodityBrand: "",
      commodityClass: "",
      commoditySize: "",
      quantityUnit: "",
    }));

    clearFieldErrors(
      "auctionCategory",
      "productName",
      "region",
      "commodityType",
      "grade",
      "process",
      "transaction",
      "commodityBrand",
      "commodityClass",
      "commoditySize",
      "quantityUnit",
    );

    if (error) {
      setError(null);
    }
  };

  const handleProductNameChange = (productName: string) => {
    setFormData((prev) => ({
      ...prev,
      productName,
      region: "",
      commodityType: "",
      grade: "",
      process: "",
      transaction: "",
      commodityBrand: "",
      commodityClass: "",
      commoditySize: "",
      quantityUnit: "",
    }));

    clearFieldErrors(
      "productName",
      "region",
      "commodityType",
      "grade",
      "process",
      "transaction",
      "commodityBrand",
      "commodityClass",
      "commoditySize",
      "quantityUnit",
    );

    if (error) {
      setError(null);
    }
  };

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

    clearFieldErrors(name as FormFieldName);

    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = e.target.files?.[0] ?? null;

    setFormData((prev) => ({
      ...prev,
      auctionImageUrl: nextFile,
    }));

    clearFieldErrors("auctionImageUrl");

    if (error) {
      setError(null);
    }
  };

  const toggleSelectedUser = (user: User) => {
    setSelectedUserIds((prev) =>
      prev.includes(user.id)
        ? prev.filter((entry) => entry !== user.id)
        : [...prev, user.id],
    );

    if (error) {
      setError(null);
    }

    if (selectedBidderError) {
      setSelectedBidderError(null);
    }

    clearFieldErrors("selectedUserIds");
  };

  const removeSelectedUser = (userId: string) => {
    setSelectedUserIds((prev) => prev.filter((entry) => entry !== userId));

    if (error) {
      setError(null);
    }

    if (selectedBidderError) {
      setSelectedBidderError(null);
    }

    clearFieldErrors("selectedUserIds");
  };

  const handleManualSelectedUserAdd = async () => {
    const nextUserId = manualSelectedUserId.trim();

    if (!nextUserId) {
      setSelectedBidderError("Enter a user ID to add.");
      return;
    }

    if (selectedUserIds.includes(nextUserId)) {
      setSelectedBidderError("That user is already selected.");
      return;
    }

    try {
      setIsAddingSelectedUser(true);
      setSelectedBidderError(null);

      const user = await profileApi.getUserById(nextUserId);

      setManualSelectedUsers((prev) =>
        prev.some((entry) => entry.id === user.id) ? prev : [user, ...prev],
      );
      setSelectedUserIds((prev) =>
        prev.includes(user.id) ? prev : [...prev, user.id],
      );
      setManualSelectedUserId("");
      clearFieldErrors("selectedUserIds");

      if (error) {
        setError(null);
      }
    } catch (err) {
      setSelectedBidderError(
        err instanceof Error ? err.message : "Unable to add that user ID.",
      );
    } finally {
      setIsAddingSelectedUser(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (isWaitingForDependentOptions) {
      setError("Please wait for product options to finish loading.");
      return;
    }

    const requiredFieldChecks: Array<{
      field: FormFieldName;
      value: string | null | undefined;
      message: string;
    }> = [
      {
        field: "title",
        value: formData.title,
        message: "Enter the auction title.",
      },
      {
        field: "auctionCategory",
        value: formData.auctionCategory,
        message: "Select a category.",
      },
      {
        field: "productName",
        value: formData.productName,
        message: "Select a product name.",
      },
      {
        field: "quantity",
        value: formData.quantity,
        message: "Enter the quantity.",
      },
      {
        field: "itemDescription",
        value: formData.itemDescription,
        message: "Enter the description.",
      },
      {
        field: "reservePrice",
        value: formData.reservePrice,
        message: "Enter the reserve price.",
      },
      {
        field: "minBid",
        value: formData.minBid,
        message: "Enter the initial bid.",
      },
      {
        field: "startAt",
        value: formData.startAt,
        message: "Choose the start date.",
      },
      {
        field: "endAt",
        value: formData.endAt,
        message: "Choose the end date.",
      },
    ];

    const missingRequiredField = requiredFieldChecks.find(
      ({ value }) => !value?.trim(),
    );

    if (missingRequiredField) {
      showFieldError(
        missingRequiredField.field,
        missingRequiredField.message,
      );
      return;
    }

    for (const field of productOptionFields) {
      const value = formData[field.key];

      if (field.required && field.options.length === 0) {
        showFieldError(
          field.key,
          `${field.label} options are unavailable for the selected product.`,
        );
        return;
      }

      if (field.required && !value) {
        showFieldError(field.key, `Please select ${field.label.toLowerCase()}.`);
        return;
      }

      if (value && !hasOptionValue(field.options, value)) {
        showFieldError(
          field.key,
          `Please select a valid ${field.label.toLowerCase()}.`,
        );
        return;
      }
    }

    const reservePrice = Number(formData.reservePrice);
    const minBid = Number(formData.minBid);

    if (!Number.isFinite(reservePrice) || reservePrice <= 0) {
      showFieldError("reservePrice", "Reserve price must be greater than zero.");
      return;
    }

    if (!Number.isFinite(minBid) || minBid <= 0) {
      showFieldError("minBid", "Initial bid must be greater than zero.");
      return;
    }

    if (reservePrice < minBid) {
      showFieldError(
        "reservePrice",
        "Reserve price must be greater than or equal to the initial bid.",
      );
      return;
    }

    const startAt = new Date(formData.startAt);
    const endAt = new Date(formData.endAt);
    const now = Date.now();
    const startGraceWindowMs = 10 * 60 * 1000;

    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      showFieldError("startAt", "Choose valid start and end times.");
      return;
    }

    if (startAt.getTime() < now - startGraceWindowMs) {
      showFieldError(
        "startAt",
        "Start time is too far in the past. Choose now or a future time.",
      );
      return;
    }

    const effectiveStartAt = startAt.getTime() < now ? new Date(now) : startAt;

    if (endAt.getTime() <= effectiveStartAt.getTime()) {
      showFieldError("endAt", "End time must be after the start time.");
      return;
    }

    if (selectedVisibility === "SELECTED" && selectedUserIds.length === 0) {
      showFieldError("selectedUserIds", "Choose at least one selected bidder.");
      return;
    }

    try {
      setError(null);

      // Prepare auction data based on active tab
      const baseAuctionData: CreateAuctionData = {
        title: formData.title,
        auctionCategory: formData.auctionCategory,
        productName: formData.productName,
        region: formData.region || undefined,
        commodityType: formData.commodityType || undefined,
        grade: formData.grade || undefined,
        process: formData.process || undefined,
        transaction: formData.transaction || undefined,
        commodityBrand: formData.commodityBrand || undefined,
        commodityClass: formData.commodityClass || undefined,
        commoditySize: formData.commoditySize || undefined,
        quantity: formData.quantity,
        quantityUnit: formData.quantityUnit || undefined,
        itemDescription: formData.itemDescription,
        reservePrice: formData.reservePrice,
        minBid: formData.minBid,
        auctionType: activeTab.toUpperCase() as "SELL" | "BUY",
        visibility: selectedVisibility,
        selectedUserIds:
          selectedVisibility === "SELECTED" ? selectedUserIds : undefined,
        auctionImageUrl: formData.auctionImageUrl || undefined,
        startAt: effectiveStartAt.toISOString(),
        endAt: endAt.toISOString(),
      };

      await createAuctionMutation.mutateAsync(baseAuctionData);
      toast.success("Auction created successfully!");
      router.push("/feed");
    } catch (err) {
      console.error("Auction creation error:", err);
      const errorMsg =
        err instanceof Error ? err.message : "Failed to create auction";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const bidAccessCard = (
    <div className="rounded-[16px] border border-slate-200/80 bg-slate-50/70 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 md:p-6">
      <div className="mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">groups</span>
        <h2 className="text-lg font-bold">Bid Access</h2>
      </div>
      <div
        className="grid grid-cols-1 gap-3"
        data-field-anchor="selectedVisibility"
        tabIndex={-1}
      >
        {[
          {
            value: "PUBLIC",
            label: "Public",
            icon: "public",
            description:
              "Anyone who opens the auction can bid immediately once it is open.",
            disabled: false,
            badge: "Open bidding",
          },
          {
            value: "FOLLOWERS",
            label: "Followers",
            icon: "groups",
            description:
              "Followers bid directly. Other viewers request access from the detail page.",
            disabled: false,
            badge: isFollowersLoading
              ? "Loading..."
              : `${followers.length} follower${followers.length === 1 ? "" : "s"}`,
          },
          {
            value: "SELECTED",
            label: "Selected bidders",
            icon: "person_add",
            description:
              "Only the users you choose can bid. Pick from followers or add a user by ID.",
            disabled: false,
            badge:
              selectedUserIds.length > 0
                ? `${selectedUserIds.length} selected`
                : "Private list",
          },
        ].map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => {
              if (!type.disabled) {
                setSelectedVisibility(
                  type.value as "PUBLIC" | "FOLLOWERS" | "SELECTED",
                );
                clearFieldErrors("visibility", "selectedUserIds");
                if (error) {
                  setError(null);
                }
              }
            }}
            disabled={type.disabled}
            className={`group relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
              type.disabled
                ? "cursor-not-allowed border-dashed border-slate-200 bg-slate-100/60 opacity-75 dark:border-slate-700 dark:bg-slate-900/60"
                : "cursor-pointer hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
            } ${
              selectedVisibility === type.value
                ? "border-primary bg-primary/5"
                : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined">{type.icon}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-bold">{type.label}</h4>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  {type.badge}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {type.description}
              </p>
            </div>
          </button>
        ))}
      </div>
      {renderFieldError("selectedUserIds")}

      {(selectedVisibility === "FOLLOWERS" ||
        selectedVisibility === "SELECTED") && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Bid access behavior
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {selectedVisibility === "FOLLOWERS"
                  ? "Feed stays public. Followers can bid directly, while other viewers use request access from the detail page."
                  : "Only the selected users can bid. Start with followers or add someone directly by user ID."}
              </p>
            </div>
            {isFollowersLoading && (
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Loading followers...
              </div>
            )}
          </div>

          {followersError && (
            <div className="mt-3 text-xs text-red-600 dark:text-red-400">
              {followersError}
            </div>
          )}

          {selectedVisibility === "FOLLOWERS" && (
            <div className="mt-3 text-xs text-slate-600 dark:text-slate-300">
              Followers connected:{" "}
              <span className="font-semibold">{followers.length}</span>
            </div>
          )}

          {selectedVisibility === "SELECTED" && (
            <div className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <input
                  type="text"
                  value={selectedBidderSearch}
                  onChange={(e) => setSelectedBidderSearch(e.target.value)}
                  placeholder="Search followers by name, email, or user ID"
                  data-field-anchor="selectedUserIds"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-950"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualSelectedUserId}
                    onChange={(e) => setManualSelectedUserId(e.target.value)}
                    placeholder="Add by user ID"
                    className="w-full min-w-[180px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-950"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      void handleManualSelectedUserAdd();
                    }}
                    disabled={isAddingSelectedUser || isSubmitting}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                  >
                    {isAddingSelectedUser ? "Adding..." : "Add"}
                  </button>
                </div>
              </div>

              {selectedBidderError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                  {selectedBidderError}
                </div>
              )}

              {selectedBidderUsers.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    Selected bidders
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedBidderUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => removeSelectedUser(user.id)}
                        className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/15"
                      >
                        <span className="max-w-[180px] truncate">
                          {user.fullName || user.username || user.id}
                        </span>
                        <span className="material-symbols-outlined text-sm">
                          close
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Followers list
                    </h4>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    {filteredFollowers.length} shown
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto px-2 py-2">
                  {filteredFollowers.length > 0 ? (
                    filteredFollowers.map((follower) => {
                      const isChecked = selectedUserIds.includes(follower.id);

                      return (
                        <label
                          key={follower.id}
                          className="flex cursor-pointer items-start justify-between gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/70"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                              {follower.fullName || follower.username}
                            </div>
                            <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                              {follower.email}
                            </div>
                            <div className="truncate text-[11px] text-slate-400 dark:text-slate-500">
                              {follower.id}
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectedUser(follower)}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                          />
                        </label>
                      );
                    })
                  ) : (
                    <div className="px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                      {followers.length === 0
                        ? "You do not have any followers available to select yet."
                        : "No followers match your search."}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

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

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[linear-gradient(180deg,#f7f4ee_0%,#efe7da_100%)] dark:bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)]">
      <Header />

      <main className="mx-auto flex w-full max-w-6xl flex-1 items-start justify-center px-4 py-6 md:px-6">
        <div className="w-full max-w-5xl overflow-hidden rounded-[18px] border border-slate-200/80 bg-white/95 shadow-[0_32px_120px_-64px_rgba(15,23,42,0.45)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
          <div className="border-b border-slate-200/80 bg-[linear-gradient(180deg,rgba(16,185,129,0.10)_0%,rgba(255,255,255,0)_100%)] px-5 py-4 dark:border-slate-800 dark:bg-[linear-gradient(180deg,rgba(16,185,129,0.18)_0%,rgba(15,23,42,0)_100%)] md:px-7">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-primary">
                  <span className="material-symbols-outlined text-sm">
                    {activeTab === "sell" ? "sell" : "shopping_cart"}
                  </span>
                  {activeTab === "sell" ? "Sell Auction" : "Buy Auction"}
                </div>
              </div>

              <Link
                href="/feed"
                className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span className="material-symbols-outlined text-sm">close</span>
                Close
              </Link>
            </div>

            <div className="mt-4 inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm dark:border-slate-800 dark:bg-slate-950/60">
              <button
                onClick={() => {
                  setActiveTab("sell");
                  setActiveFormSection("details");
                }}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all md:text-xs ${
                  activeTab === "sell"
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
                type="button"
              >
                Sell Auction
              </button>
              <button
                onClick={() => {
                  setActiveTab("buy");
                  setActiveFormSection("details");
                }}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all md:text-xs ${
                  activeTab === "buy"
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
                type="button"
              >
                Buy Auction
              </button>
            </div>
          </div>

          <div className="overflow-hidden bg-white dark:bg-slate-950/40">
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

            <form
              className="grid gap-5 p-5 md:p-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)]"
              onSubmit={handleSubmit}
            >
              <div className="space-y-5">
                <div className="flex w-full flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-950/60 sm:inline-flex sm:w-auto sm:flex-nowrap">
                  <button
                    type="button"
                    onClick={() => setActiveFormSection("details")}
                    className={`flex-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all md:text-xs ${
                      activeFormSection === "details"
                        ? "bg-primary text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    {activeTab === "sell"
                      ? "Product Details"
                      : "Requirement Details"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFormSection("commercial")}
                    className={`flex-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all md:text-xs ${
                      activeFormSection === "commercial"
                        ? "bg-primary text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    Commercial Terms
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFormSection("access")}
                    className={`flex-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all md:text-xs ${
                      activeFormSection === "access"
                        ? "bg-primary text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    Bid Access
                  </button>
                </div>

                {/* Section 1: Product Basics */}
                {activeFormSection === "details" && (
                  <div className="rounded-[16px] border border-slate-200/80 bg-slate-50/70 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 md:p-6">
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
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Auction Title
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          className="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:ring-primary dark:border-slate-800 dark:bg-slate-900 outline-none transition-all focus:ring-2 focus:ring-primary/20"
                          placeholder="e.g. Ethiopia Sidamo G1 Natural"
                          type="text"
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          required
                          aria-invalid={Boolean(fieldErrors.title)}
                        />
                        {renderFieldError("title")}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Category
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                          className="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:ring-primary dark:border-slate-800 dark:bg-slate-900 outline-none transition-all focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                          name="auctionCategory"
                          value={formData.auctionCategory}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          required
                          disabled={isCategorySelectDisabled}
                          aria-invalid={Boolean(fieldErrors.auctionCategory)}
                        >
                          <option value="">
                            {isFormOptionsBusy && categoryOptions.length === 0
                              ? "Loading categories..."
                              : isFormOptionsErrored &&
                                  categoryOptions.length === 0
                                ? "Unable to load categories"
                                : categoryOptions.length === 0
                                  ? "No categories available"
                                  : "Select category"}
                          </option>
                          {categoryOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {categoryOptions.length === 0 && !isFormOptionsBusy && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {isFormOptionsErrored
                              ? "Auction categories are currently unavailable."
                              : "No auction categories are available from the backend."}
                          </p>
                        )}
                        {renderFieldError("auctionCategory")}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Product Name
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                          className="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:ring-primary dark:border-slate-800 dark:bg-slate-900 outline-none transition-all focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                          name="productName"
                          value={formData.productName ?? ""}
                          onChange={(e) =>
                            handleProductNameChange(e.target.value)
                          }
                          required
                          disabled={isProductSelectDisabled}
                          aria-invalid={Boolean(fieldErrors.productName)}
                        >
                          <option value="">
                            {!formData.auctionCategory
                              ? "Select category first"
                              : isFormOptionsBusy
                                ? "Loading products..."
                                : isFormOptionsErrored
                                  ? "Unable to load products"
                                  : productNameOptions.length === 0
                                    ? "No products available"
                                    : "Select product name"}
                          </option>
                          {productNameOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {formData.auctionCategory &&
                          productNameOptions.length === 0 &&
                          !isFormOptionsBusy && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {isFormOptionsErrored
                                ? "Products could not be loaded for this category."
                                : "This category has no products available yet."}
                            </p>
                          )}
                        {renderFieldError("productName")}
                      </div>

                      {productOptionFields.map((field) => (
                        <div key={field.key} className="flex flex-col gap-1.5">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {field.label}
                            {field.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </label>
                          <select
                            className="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:ring-primary dark:border-slate-800 dark:bg-slate-900 outline-none transition-all focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                            name={field.key}
                            value={formData[field.key] ?? ""}
                            onChange={handleChange}
                            required={field.required}
                            disabled={field.disabled}
                            aria-invalid={Boolean(fieldErrors[field.key])}
                          >
                            <option value="">
                              {!formData.productName
                                ? "Select product first"
                                : isFormOptionsBusy
                                  ? field.loadingText
                                  : isFormOptionsErrored
                                    ? field.unavailableText
                                    : field.options.length === 0
                                      ? field.emptyText
                                      : `Select ${field.label.toLowerCase()}`}
                            </option>
                            {field.options.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {formData.productName &&
                            field.options.length === 0 &&
                            !isFormOptionsBusy && (
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {isFormOptionsErrored
                                  ? `${field.label} options could not be loaded for this product.`
                                  : `${field.label} is not available for this product.`}
                              </p>
                            )}
                          {renderFieldError(field.key)}
                        </div>
                      ))}

                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Quantity
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          className="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:ring-primary dark:border-slate-800 dark:bg-slate-900 outline-none transition-all focus:ring-2 focus:ring-primary/20"
                          placeholder="e.g. 1000"
                          type="number"
                          id="quantity"
                          name="quantity"
                          value={formData.quantity ?? ""}
                          onChange={handleChange}
                          required
                          min="0"
                          aria-invalid={Boolean(fieldErrors.quantity)}
                        />
                        {renderFieldError("quantity")}
                      </div>

                      <div className="md:col-span-2 flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-3">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Product Image
                          </label>
                          {selectedAuctionImage && (
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  auctionImageUrl: null,
                                }))
                              }
                              className="text-xs font-semibold text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-5 text-center transition-colors hover:border-primary/50 hover:bg-primary/5 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-primary/60 dark:hover:bg-primary/10">
                          <span className="material-symbols-outlined text-[22px] text-primary">
                            add_photo_alternate
                          </span>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                              {selectedAuctionImage
                                ? "Change product image"
                                : "Upload a product image"}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              PNG, JPG, and WEBP are supported.
                            </p>
                          </div>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                            {selectedAuctionImage
                              ? "Choose another file"
                              : "Choose file"}
                          </span>
                          <input
                            accept="image/*"
                            className="sr-only"
                            disabled={isSubmitting}
                            key={selectedAuctionImage?.name ?? "empty"}
                            name="auctionImageUrl"
                            onChange={handleImageChange}
                            type="file"
                          />
                        </label>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {selectedAuctionImage
                            ? `Selected image: ${selectedAuctionImage.name}`
                            : "Optional. The selected image will be sent when the auction is created."}
                        </p>
                      </div>

                      {formOptionsError && (
                        <div className="md:col-span-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <span>
                              Failed to load product options. Retry to refresh
                              the dependent selections.
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                void refetchAuctionFormOptions();
                              }}
                              disabled={isFormOptionsBusy}
                              className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-100 disabled:opacity-60 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-900/40"
                            >
                              Retry Options
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeFormSection === "commercial" && (
                  <div className="rounded-[16px] border border-slate-200/80 bg-slate-50/70 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 md:p-6">
                    <div className="mb-6 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">
                        payments
                      </span>
                      <div>
                        <h2 className="text-lg font-bold">Commercial Terms</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Set pricing and timing.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Reserve Price
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          className="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:ring-primary dark:border-slate-800 dark:bg-slate-900 outline-none transition-all focus:ring-2 focus:ring-primary/20"
                          placeholder="e.g. 1000"
                          type="number"
                          id="reservePrice"
                          name="reservePrice"
                          value={formData.reservePrice}
                          onChange={handleChange}
                          required
                          min="0"
                          aria-invalid={Boolean(fieldErrors.reservePrice)}
                        />
                        {renderFieldError("reservePrice")}
                      </div>

                      <div className="md:col-span-2 flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Description
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <textarea
                          className="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:ring-primary dark:border-slate-800 dark:bg-slate-900 outline-none transition-all focus:ring-2 focus:ring-primary/20 resize-none"
                          placeholder="Detailed description of your item"
                          id="itemDescription"
                          name="itemDescription"
                          value={formData.itemDescription}
                          onChange={handleChange}
                          required
                          rows={4}
                          aria-invalid={Boolean(fieldErrors.itemDescription)}
                        />
                        {renderFieldError("itemDescription")}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Initial Bid
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          className="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:ring-primary dark:border-slate-800 dark:bg-slate-900 outline-none transition-all focus:ring-2 focus:ring-primary/20"
                          placeholder="e.g. 100"
                          type="number"
                          id="minBid"
                          name="minBid"
                          value={formData.minBid}
                          onChange={handleChange}
                          required
                          aria-invalid={Boolean(fieldErrors.minBid)}
                        />
                        {renderFieldError("minBid")}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Start Date
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          className="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:ring-primary dark:border-slate-800 dark:bg-slate-900 outline-none transition-all focus:ring-2 focus:ring-primary/20"
                          type="datetime-local"
                          id="startAt"
                          name="startAt"
                          value={formData.startAt}
                          onChange={handleChange}
                          required
                          aria-invalid={Boolean(fieldErrors.startAt)}
                        />
                        {renderFieldError("startAt")}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          End Date
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          className="w-full rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:ring-primary dark:border-slate-800 dark:bg-slate-900 outline-none transition-all focus:ring-2 focus:ring-primary/20"
                          type="datetime-local"
                          id="endAt"
                          name="endAt"
                          value={formData.endAt}
                          onChange={handleChange}
                          required
                          aria-invalid={Boolean(fieldErrors.endAt)}
                        />
                        {renderFieldError("endAt")}
                      </div>
                    </div>
                  </div>
                )}

                {activeFormSection === "access" && bidAccessCard}
              </div>

              <div className="space-y-5 xl:sticky xl:top-24">
                <div className="rounded-[16px] border border-slate-900/5 bg-slate-950 p-5 text-white shadow-[0_24px_80px_-52px_rgba(15,23,42,0.8)] dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300/90">
                    <span className="material-symbols-outlined text-base">
                      checklist
                    </span>
                    Post summary
                  </div>

                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
                      <span className="text-white/60">Mode</span>
                      <span className="font-semibold">
                        {activeTab === "sell" ? "Sell auction" : "Buy request"}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
                      <span className="text-white/60">Product</span>
                      <span className="text-right font-semibold">
                        {formData.productName || formData.auctionCategory
                          ? [formData.productName, formData.auctionCategory]
                              .filter(Boolean)
                              .join(" / ")
                          : "Not selected"}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
                      <span className="text-white/60">Bid access</span>
                      <span className="text-right font-semibold">
                        {selectedVisibility === "PUBLIC"
                          ? "Open bidding"
                          : selectedVisibility === "FOLLOWERS"
                            ? "Followers first"
                            : "Selected bidders"}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-white/60">Quantity</span>
                      <span className="text-right font-semibold">
                        {[formData.quantity, formData.quantityUnit]
                          .filter(Boolean)
                          .join(" ") || "Not set"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3">
                    <Link
                      href="/feed"
                      className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10"
                    >
                      Cancel
                    </Link>
                    <button
                      className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      type="submit"
                      disabled={isSubmitting || isWaitingForDependentOptions}
                    >
                      {isSubmitting
                        ? "Posting..."
                        : activeTab === "sell"
                          ? "Post Auction"
                          : "Post Request"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
