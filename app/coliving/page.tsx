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
import {
  Avatar,
  Card,
  GRADIENT_BTN,
  GRADIENT_TEXT,
  INPUT_CLASSES,
  TenantSheet,
  Toast,
  type ToastData,
} from "@/components/coliving/ui";
import { HomeView } from "@/components/coliving/views/HomeView";
import { RosterView } from "@/components/coliving/views/RosterView";
import { ChoresView } from "@/components/coliving/views/ChoresView";
import { SuppliesView } from "@/components/coliving/views/SuppliesView";
import { OnboardingView } from "@/components/coliving/views/OnboardingView";

type Tab = "home" | "rooms" | "chores" | "supplies";

const TABS: { id: Tab; label: string; icon: (p: React.SVGProps<SVGSVGElement>) => React.ReactNode }[] = [
  { id: "home", label: "Home", icon: IconHome },
  { id: "rooms", label: "Rooms", icon: IconDoor },
  { id: "chores", label: "Chores", icon: IconClipboard },
  { id: "supplies", label: "Supplies", icon: IconCart },
];

function Splash() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="animate-pulse text-4xl" role="status" aria-label="Loading house">
        🏠
      </div>
    </div>
  );
}

/** Shown when Firebase env vars aren't configured yet (e.g. fresh deploy). */
function SetupMissing() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-5">
      <Card className="w-full max-w-md">
        <p className="text-2xl">🔌</p>
        <h1 className="mt-2 text-lg font-bold text-white">Backend not connected yet</h1>
        <p className="mt-2 text-sm text-slate-400">
          The app needs its Firebase environment variables before it can sync data. Add these to
          your <code className="text-fuchsia-300">.env.local</code> (and to Vercel → Settings →
          Environment Variables), then redeploy:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-3 text-[11px] leading-relaxed text-slate-300 ring-1 ring-white/10">
          {`NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID`}
        </pre>
        <p className="mt-3 text-xs text-slate-500">
          All six values come from your Firebase project settings (Project settings → Your apps →
          Web app → SDK setup and configuration).
        </p>
      </Card>
    </div>
  );
}

/** The saved house was deleted or the code no longer exists. */
function HouseMissing() {
  const { leaveHouse } = useHouse();
  return (
    <div className="flex min-h-dvh items-center justify-center px-5">
      <Card className="w-full max-w-md text-center">
        <p className="text-2xl">🏚️</p>
        <h1 className="mt-2 text-lg font-bold text-white">This house is gone</h1>
        <p className="mt-2 text-sm text-slate-400">
          The house saved on this device no longer exists on the server.
        </p>
        <button
          onClick={leaveHouse}
          className={`mt-4 w-full rounded-xl py-2.5 text-sm font-bold ${GRADIENT_BTN}`}
        >
          Start over
        </button>
      </Card>
    </div>
  );
}

export default function ColivingPage() {
  const { phase, state, setActiveTenant, renameHouse } = useHouse();
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

  if (phase === "boot" || phase === "loading") return <Splash />;
  if (phase === "setup-missing") return <SetupMissing />;
  if (phase === "onboarding") return <OnboardingView />;
  if (phase === "house-missing") return <HouseMissing />;

  const activeTenant = state.tenants.find((t) => t.id === state.activeTenantId) ?? null;
  const suppliesNeeded = state.supplies.filter((s) => !s.purchasedAt).length;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 px-4 py-3 md:max-w-2xl">
          <div className="min-w-0">
            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${GRADIENT_TEXT}`}>
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
                  className={`w-40 !py-0.5 text-base font-bold ${INPUT_CLASSES}`}
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
                <h1 className="truncate text-base font-bold text-white">{state.houseName}</h1>
                <IconPencil className="size-3.5 shrink-0 text-slate-600 transition group-hover:text-slate-400" />
              </button>
            )}
          </div>

          <button
            onClick={() => setSwitcherOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-full bg-slate-900 py-1.5 pl-1.5 pr-2.5 ring-1 ring-white/10 transition hover:ring-fuchsia-400/50 active:scale-95"
            aria-label="Switch resident"
          >
            {activeTenant ? (
              <>
                <Avatar tenant={activeTenant} size="sm" />
                <span className="max-w-24 truncate text-sm font-semibold text-slate-200">
                  {activeTenant.name}
                </span>
              </>
            ) : (
              <span className="pl-1.5 text-sm font-medium text-slate-400">Who are you?</span>
            )}
            <IconChevronDown className="size-4 text-slate-500" />
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
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/90 pb-[env(safe-area-inset-bottom)] backdrop-blur"
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
                  active ? "text-fuchsia-300" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <span
                  className={`rounded-xl px-3 py-0.5 transition ${
                    active ? "bg-fuchsia-500/10 shadow-[0_0_18px_rgba(217,70,239,0.25)]" : ""
                  }`}
                >
                  <Icon className="size-5" />
                  {id === "supplies" && suppliesNeeded > 0 && (
                    <span className="absolute right-[calc(50%-1.7rem)] top-1.5 flex size-4 items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 to-orange-400 text-[9px] font-bold text-white">
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
