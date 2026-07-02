"use client";

import { useRef, useState } from "react";
import { useHouse } from "@/components/coliving/HouseProvider";
import {
  IconCart,
  IconChevronDown,
  IconClipboard,
  IconDoor,
  IconHome,
  IconPencil,
} from "@/components/coliving/icons";
import { Avatar, TenantSheet, Toast, type ToastData } from "@/components/coliving/ui";
import { HomeView } from "@/components/coliving/views/HomeView";
import { RosterView } from "@/components/coliving/views/RosterView";
import { ChoresView } from "@/components/coliving/views/ChoresView";
import { SuppliesView } from "@/components/coliving/views/SuppliesView";

type Tab = "home" | "rooms" | "chores" | "supplies";

const TABS: { id: Tab; label: string; icon: (p: React.SVGProps<SVGSVGElement>) => React.ReactNode }[] = [
  { id: "home", label: "Home", icon: IconHome },
  { id: "rooms", label: "Rooms", icon: IconDoor },
  { id: "chores", label: "Chores", icon: IconClipboard },
  { id: "supplies", label: "Supplies", icon: IconCart },
];

export default function ColivingPage() {
  const { state, setActiveTenant, renameHouse } = useHouse();
  const [tab, setTab] = useState<Tab>("home");
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const [toast, setToast] = useState<ToastData | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function showToast(message: string, onUndo?: () => void) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message, onUndo });
    toastTimer.current = setTimeout(() => setToast(null), 4500);
  }

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  function commitName() {
    const name = nameDraft.trim();
    if (name) renameHouse(name);
    setEditingName(false);
  }

  const activeTenant = state.tenants.find((t) => t.id === state.activeTenantId) ?? null;
  const suppliesNeeded = state.supplies.filter((s) => !s.purchasedAt).length;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-stone-100/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 px-4 py-3 md:max-w-2xl">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600">
              CoHouse
            </p>
            {editingName ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  commitName();
                }}
              >
                <input
                  autoFocus
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onBlur={commitName}
                  aria-label="House name"
                  className="w-40 rounded-lg border border-teal-300 bg-white px-2 py-0.5 text-base font-bold text-stone-900 outline-none"
                />
              </form>
            ) : (
              <button
                onClick={() => {
                  setNameDraft(state.houseName);
                  setEditingName(true);
                }}
                className="group flex items-center gap-1.5"
                aria-label={`Rename ${state.houseName}`}
              >
                <h1 className="truncate text-base font-bold text-stone-900">
                  {state.houseName}
                </h1>
                <IconPencil className="size-3.5 shrink-0 text-stone-300 transition group-hover:text-stone-500" />
              </button>
            )}
          </div>

          <button
            onClick={() => setSwitcherOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-2.5 shadow-sm ring-1 ring-stone-900/5 transition hover:ring-teal-300 active:scale-95"
            aria-label="Switch resident"
          >
            {activeTenant ? (
              <>
                <Avatar tenant={activeTenant} size="sm" />
                <span className="max-w-24 truncate text-sm font-semibold text-stone-800">
                  {activeTenant.name}
                </span>
              </>
            ) : (
              <span className="pl-1.5 text-sm font-medium text-stone-500">Who are you?</span>
            )}
            <IconChevronDown className="size-4 text-stone-400" />
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-28 pt-4 md:max-w-2xl">
        {tab === "home" && <HomeView onToast={showToast} />}
        {tab === "rooms" && <RosterView onToast={showToast} />}
        {tab === "chores" && <ChoresView onToast={showToast} />}
        {tab === "supplies" && <SuppliesView onToast={showToast} />}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
        aria-label="App sections"
      >
        <div className="mx-auto flex w-full max-w-md md:max-w-2xl">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
                  active ? "text-teal-700" : "text-stone-400 hover:text-stone-600"
                }`}
              >
                <span className={`rounded-xl px-3 py-0.5 transition ${active ? "bg-teal-50" : ""}`}>
                  <Icon className="size-5" />
                  {id === "supplies" && suppliesNeeded > 0 && (
                    <span className="absolute right-[calc(50%-1.7rem)] top-1.5 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
                      {suppliesNeeded > 9 ? "9+" : suppliesNeeded}
                    </span>
                  )}
                </span>
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      <TenantSheet
        open={switcherOpen}
        onClose={() => setSwitcherOpen(false)}
        title="Who's using this device?"
        subtitle="Chores and purchases get logged to this person in one tap."
        onPick={(t) => setActiveTenant(t.id)}
        clearLabel="Just browsing (no one)"
        onClear={() => setActiveTenant(null)}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
