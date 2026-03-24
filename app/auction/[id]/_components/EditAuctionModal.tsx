"use client";

import { Auction, EditAuctionData, PriceTier } from "@/lib/types";
import { useEditAuctionMutation } from "@/src/features/auctions/queries/hooks";
import { useState } from "react";
import { toast } from "sonner";

interface EditAuctionModalProps {
  auction: Auction;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditAuctionModal({
  auction,
  onClose,
  onSuccess,
}: EditAuctionModalProps) {
  const editMutation = useEditAuctionMutation();
  const [formData, setFormData] = useState<EditAuctionData>(() => ({
    title: auction.title,
    auctionCategory: auction.auctionCategory,
    productName: auction.productName ?? "",
    commodityType: auction.commodityType ?? "",
    grade: auction.grade ?? "",
    quantity: auction.quantity ?? "",
    quantityUnit: auction.quantityUnit ?? "",
    itemDescription: auction.itemDescription,
    lotType: auction.lotType ?? "FLEXIBLE",
    currency: auction.currency === "USD" ? "USD" : "ETB",
    winnerPriority:
      auction.winnerPriority === "MANUAL"
        ? "MANUAL"
        : auction.winnerPriority === "QUANTITY"
          ? "QUANTITY"
          : "PRICE",
    minBid: auction.minBid ?? "",
    reservePrice: auction.reservePrice ?? "",
    priceTiers:
      auction.priceTiers && auction.priceTiers.length > 0
        ? auction.priceTiers
        : [
            {
              minQty: "1",
              maxQty: null,
              pricePerUnit: auction.minBid ?? "",
            },
          ],
  }));

  const updateTier = (
    index: number,
    field: keyof PriceTier,
    value: string | null,
  ) => {
    setFormData((prev) => {
      const tiers = [...(prev.priceTiers ?? [])];
      if (!tiers[index]) return prev;
      tiers[index] = { ...tiers[index], [field]: value };
      return { ...prev, priceTiers: tiers };
    });
  };

  const addTier = () => {
    setFormData((prev) => ({
      ...prev,
      priceTiers: [
        ...(prev.priceTiers ?? []),
        { minQty: "1", maxQty: null, pricePerUnit: "" },
      ],
    }));
  };

  const removeTier = (index: number) => {
    setFormData((prev) => {
      const tiers = (prev.priceTiers ?? []).filter((_, i) => i !== index);
      return {
        ...prev,
        priceTiers:
          tiers.length > 0
            ? tiers
            : [
                {
                  minQty: "1",
                  maxQty: null,
                  pricePerUnit: auction.minBid ?? "",
                },
              ],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input: EditAuctionData = { ...formData };
    if (input.lotType === "SEALED") {
      delete input.winnerPriority;
      input.priceTiers = [];
    }
    try {
      await editMutation.mutateAsync({
        id: auction.id,
        input,
      });
      toast.success("Auction updated successfully.");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update auction.",
      );
    }
  };

  const lotType = formData.lotType ?? "FLEXIBLE";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Edit Auction
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Title
            </label>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              value={formData.title ?? ""}
              onChange={(e) =>
                setFormData((p) => ({ ...p, title: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Category
            </label>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              value={formData.auctionCategory ?? ""}
              onChange={(e) =>
                setFormData((p) => ({ ...p, auctionCategory: e.target.value }))
              }
            />
          </div>

          <div>
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Lot type
            </span>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
              <button
                type="button"
                onClick={() =>
                  setFormData((p) => ({ ...p, lotType: "FLEXIBLE" }))
                }
                className={`rounded-md px-3 py-1 text-xs font-semibold ${
                  lotType === "FLEXIBLE"
                    ? "bg-primary text-white"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Flexible
              </button>
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, lotType: "SEALED" }))}
                className={`rounded-md px-3 py-1 text-xs font-semibold ${
                  lotType === "SEALED"
                    ? "bg-primary text-white"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Sealed
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Currency
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              value={formData.currency ?? "ETB"}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  currency: e.target.value as "ETB" | "USD",
                }))
              }
            >
              <option value="ETB">ETB</option>
              <option value="USD">USD</option>
            </select>
          </div>

          {lotType === "FLEXIBLE" && (
            <div>
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Winner priority
              </span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((p) => ({ ...p, winnerPriority: "PRICE" }))
                  }
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold ${
                    formData.winnerPriority === "PRICE"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  Price
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((p) => ({ ...p, winnerPriority: "QUANTITY" }))
                  }
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold ${
                    formData.winnerPriority === "QUANTITY"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  Quantity
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((p) => ({ ...p, winnerPriority: "MANUAL" }))
                  }
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold ${
                    formData.winnerPriority === "MANUAL"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  Manual
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              rows={3}
              value={formData.itemDescription ?? ""}
              onChange={(e) =>
                setFormData((p) => ({ ...p, itemDescription: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Quantity
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                type="text"
                value={formData.quantity ?? ""}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, quantity: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Unit
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                value={formData.quantityUnit ?? ""}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, quantityUnit: e.target.value }))
                }
              />
            </div>
          </div>

          {lotType === "SEALED" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Min bid ({formData.currency})
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  type="text"
                  value={formData.minBid ?? ""}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, minBid: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Reserve ({formData.currency})
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  type="text"
                  value={formData.reservePrice ?? ""}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, reservePrice: e.target.value }))
                  }
                />
              </div>
            </div>
          )}

          {lotType === "FLEXIBLE" && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Price tiers ({formData.currency})
                </label>
                <button
                  type="button"
                  onClick={addTier}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Add tier
                </button>
              </div>
              <div className="space-y-2">
                {(formData.priceTiers ?? []).map((tier, index) => (
                  <div
                    key={index}
                    className="flex flex-wrap items-center gap-2 rounded border border-slate-200 p-2 dark:border-slate-700"
                  >
                    <input
                      className="w-16 rounded border-slate-200 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800"
                      placeholder="Min"
                      type="number"
                      min="0"
                      value={tier.minQty}
                      onChange={(e) =>
                        updateTier(index, "minQty", e.target.value)
                      }
                    />
                    <span className="text-slate-500">–</span>
                    <input
                      className="w-16 rounded border-slate-200 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800"
                      placeholder="Max"
                      type="number"
                      min="0"
                      value={tier.maxQty ?? ""}
                      onChange={(e) =>
                        updateTier(
                          index,
                          "maxQty",
                          e.target.value.trim() || null,
                        )
                      }
                    />
                    <input
                      className="min-w-[70px] flex-1 rounded border-slate-200 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800"
                      placeholder="Price/unit"
                      type="number"
                      min="0"
                      step="0.01"
                      value={tier.pricePerUnit}
                      onChange={(e) =>
                        updateTier(index, "pricePerUnit", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeTier(index)}
                      disabled={(formData.priceTiers ?? []).length <= 1}
                      className="rounded p-1 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                    >
                      <span className="material-symbols-outlined text-sm">
                        close
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editMutation.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:opacity-95 disabled:opacity-60"
            >
              {editMutation.isPending ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
