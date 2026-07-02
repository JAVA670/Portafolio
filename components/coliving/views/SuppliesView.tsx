"use client";

import { useState } from "react";
import type { ID } from "@/lib/coliving/types";
import { formatWhen, timeAgo } from "@/lib/coliving/utils";
import { useHouse } from "../HouseProvider";
import { Card, EmptyState, SectionLabel, TenantSheet } from "../ui";
import { IconCheck, IconX } from "../icons";

/** What the tenant sheet is being asked to attribute. */
type PendingAttribution =
  | { kind: "request"; name: string }
  | { kind: "purchase"; supplyId: ID };

export function SuppliesView({ onToast }: { onToast: (msg: string) => void }) {
  const { state, addSupply, markPurchased, removeSupply, tenantName, tenantById } = useHouse();
  const [itemName, setItemName] = useState("");
  const [pending, setPending] = useState<PendingAttribution | null>(null);

  const needed = state.supplies
    .filter((s) => !s.purchasedAt)
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  const purchased = state.supplies
    .filter((s) => s.purchasedAt)
    .sort((a, b) => (b.purchasedAt ?? "").localeCompare(a.purchasedAt ?? ""))
    .slice(0, 10);

  function request(name: string, requestedBy: ID) {
    addSupply(name, requestedBy);
    setItemName("");
    onToast(`🛒 "${name}" added to the list`);
  }

  function submitRequest() {
    const name = itemName.trim();
    if (!name) return;
    if (state.activeTenantId && tenantById(state.activeTenantId)) {
      request(name, state.activeTenantId);
    } else {
      setPending({ kind: "request", name });
    }
  }

  function purchase(supplyId: ID, purchasedBy: ID) {
    const item = state.supplies.find((s) => s.id === supplyId);
    markPurchased(supplyId, purchasedBy);
    if (item) onToast(`✅ "${item.name}" marked as purchased`);
  }

  function handlePurchase(supplyId: ID) {
    if (state.activeTenantId && tenantById(state.activeTenantId)) {
      purchase(supplyId, state.activeTenantId);
    } else {
      setPending({ kind: "purchase", supplyId });
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-stone-900">House ledger</h1>
        <p className="text-sm text-stone-500">
          {needed.length === 0
            ? "Nothing needed right now"
            : `${needed.length} item${needed.length === 1 ? "" : "s"} to buy`}
        </p>
      </div>

      <Card>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submitRequest();
          }}
        >
          <input
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="What does the house need?"
            className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-400"
          />
          <button
            type="submit"
            disabled={!itemName.trim()}
            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition enabled:hover:bg-teal-700 disabled:opacity-40"
          >
            Request
          </button>
        </form>
      </Card>

      <div>
        <SectionLabel>Needed</SectionLabel>
        {needed.length === 0 ? (
          <div className="mt-2">
            <EmptyState emoji="🎉" title="All stocked up" hint="Request anything the house runs out of." />
          </div>
        ) : (
          <ul className="mt-2 space-y-2">
            {needed.map((item) => (
              <li key={item.id}>
                <Card className="flex items-center gap-3 !p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-stone-900">{item.name}</p>
                    <p className="truncate text-xs text-stone-500">
                      Asked by {tenantName(item.requestedBy)} · {timeAgo(item.requestedAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => handlePurchase(item.id)}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700 transition hover:bg-teal-100 active:scale-95"
                  >
                    <IconCheck className="size-4" />
                    Got it
                  </button>
                  <button
                    onClick={() => removeSupply(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="shrink-0 rounded-full p-1.5 text-stone-300 transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    <IconX className="size-4" />
                  </button>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>

      {purchased.length > 0 && (
        <div>
          <SectionLabel>Recently purchased</SectionLabel>
          <ul className="mt-2 space-y-2">
            {purchased.map((item) => (
              <li key={item.id}>
                <Card className="flex items-center gap-3 !p-3 opacity-80">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                    <IconCheck className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-stone-700">{item.name}</p>
                    <p className="truncate text-xs text-stone-400">
                      Bought by {tenantName(item.purchasedBy ?? "")}
                      {item.purchasedAt ? ` · ${formatWhen(item.purchasedAt)}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      request(item.name, state.activeTenantId ?? item.requestedBy);
                    }}
                    className="shrink-0 rounded-xl px-3 py-2 text-xs font-semibold text-stone-500 transition hover:bg-stone-100"
                  >
                    Need again
                  </button>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      )}

      <TenantSheet
        open={pending !== null}
        onClose={() => setPending(null)}
        title={pending?.kind === "purchase" ? "Who bought it?" : "Who's asking?"}
        subtitle="Tip: set who you are from the top-right chip to skip this step."
        onPick={(t) => {
          if (!pending) return;
          if (pending.kind === "request") request(pending.name, t.id);
          else purchase(pending.supplyId, t.id);
        }}
      />
    </div>
  );
}
