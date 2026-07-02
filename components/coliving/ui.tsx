"use client";

import type { Tenant, TenantColor } from "@/lib/coliving/types";
import { useHouse } from "./HouseProvider";
import { IconX } from "./icons";

/** Identity chips: color always travels with the name/initials, never alone. */
export const AVATAR_CLASSES: Record<TenantColor, string> = {
  teal: "bg-teal-100 text-teal-800",
  violet: "bg-violet-100 text-violet-800",
  amber: "bg-amber-100 text-amber-800",
  rose: "bg-rose-100 text-rose-800",
  sky: "bg-sky-100 text-sky-800",
  lime: "bg-lime-100 text-lime-800",
  fuchsia: "bg-fuchsia-100 text-fuchsia-800",
  orange: "bg-orange-100 text-orange-800",
};

const AVATAR_SIZES = {
  sm: "size-7 text-[10px]",
  md: "size-9 text-xs",
  lg: "size-11 text-sm",
} as const;

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({
  tenant,
  size = "md",
}: {
  tenant: Pick<Tenant, "name" | "color">;
  size?: keyof typeof AVATAR_SIZES;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${AVATAR_CLASSES[tenant.color]} ${AVATAR_SIZES[size]}`}
      aria-hidden
    >
      {initials(tenant.name)}
    </span>
  );
}

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-900/5 ${className}`}>
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
      {children}
    </p>
  );
}

export function EmptyState({
  emoji,
  title,
  hint,
}: {
  emoji: string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-stone-200 px-4 py-8 text-center">
      <p className="text-3xl">{emoji}</p>
      <p className="mt-2 text-sm font-semibold text-stone-700">{title}</p>
      {hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
    </div>
  );
}

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px]"
      />
      <div className="relative w-full max-w-md animate-[coliving-sheet-in_0.22s_ease-out] rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl sm:mx-4 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
          >
            <IconX className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Bottom sheet listing residents; used to switch identity or attribute an action. */
export function TenantSheet({
  open,
  onClose,
  title,
  subtitle,
  onPick,
  clearLabel,
  onClear,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  onPick: (tenant: Tenant) => void;
  clearLabel?: string;
  onClear?: () => void;
}) {
  const { state } = useHouse();
  const roomName = (roomId: string) =>
    state.rooms.find((r) => r.id === roomId)?.name ?? "No room";

  return (
    <Sheet open={open} onClose={onClose} title={title}>
      {subtitle && <p className="-mt-3 mb-4 text-sm text-stone-500">{subtitle}</p>}
      {state.tenants.length === 0 ? (
        <EmptyState
          emoji="🛏️"
          title="No residents yet"
          hint="Add rooms and residents in the Rooms tab first."
        />
      ) : (
        <ul className="space-y-2">
          {state.tenants.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => {
                  onPick(t);
                  onClose();
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-stone-200 px-3 py-2.5 text-left transition hover:border-teal-300 hover:bg-teal-50 active:scale-[0.99]"
              >
                <Avatar tenant={t} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-stone-900">
                    {t.name}
                  </span>
                  <span className="block text-xs text-stone-500">{roomName(t.roomId)}</span>
                </span>
                {state.activeTenantId === t.id && (
                  <span className="ml-auto rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-800">
                    You
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      {onClear && (
        <button
          onClick={() => {
            onClear();
            onClose();
          }}
          className="mt-3 w-full rounded-xl px-3 py-2 text-sm font-medium text-stone-500 transition hover:bg-stone-100"
        >
          {clearLabel ?? "Clear selection"}
        </button>
      )}
    </Sheet>
  );
}

export interface ToastData {
  id: number;
  message: string;
  onUndo?: () => void;
}

export function Toast({ toast, onDismiss }: { toast: ToastData | null; onDismiss: () => void }) {
  if (!toast) return null;
  return (
    <div
      className="fixed inset-x-0 bottom-24 z-50 flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <div className="flex max-w-md animate-[coliving-sheet-in_0.2s_ease-out] items-center gap-3 rounded-full bg-stone-900 py-2.5 pl-5 pr-3 text-sm text-white shadow-lg">
        <span className="min-w-0 truncate">{toast.message}</span>
        {toast.onUndo && (
          <button
            onClick={() => {
              toast.onUndo?.();
              onDismiss();
            }}
            className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide transition hover:bg-white/25"
          >
            Undo
          </button>
        )}
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-full p-1 text-white/60 transition hover:text-white"
        >
          <IconX className="size-4" />
        </button>
      </div>
    </div>
  );
}
