"use client";

import { startOfWeek, timeAgo } from "@/lib/coliving/utils";
import { useHouse } from "../HouseProvider";
import { Avatar, Card, EmptyState, SectionLabel } from "../ui";

const MEDALS = ["🥇", "🥈", "🥉"];

export function HomeView({ onToast }: { onToast: (msg: string) => void }) {
  const { state, setActiveTenant, resetHouse, tenantName } = useHouse();

  const activeTenant = state.tenants.find((t) => t.id === state.activeTenantId) ?? null;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const weekStart = startOfWeek().getTime();
  const logsThisWeek = state.choreLogs.filter(
    (l) => new Date(l.timestamp).getTime() >= weekStart,
  );
  const suppliesNeeded = state.supplies.filter((s) => !s.purchasedAt).length;

  // House MVP: total chore events this week per current resident.
  const mvp = state.tenants
    .map((tenant) => ({
      tenant,
      count: logsThisWeek.filter((l) => l.tenantId === tenant.id).length,
    }))
    .sort((a, b) => b.count - a.count || a.tenant.name.localeCompare(b.tenant.name));

  // Everything that happened lately, across chores and supplies, newest first.
  const feed = [
    ...state.choreLogs.map((l) => {
      const chore = state.chores.find((c) => c.id === l.choreId);
      return {
        id: `log-${l.id}`,
        at: l.timestamp,
        icon: chore?.icon ?? "✅",
        text: `${tenantName(l.tenantId)} did ${chore?.title ?? "a chore"}`,
      };
    }),
    ...state.supplies.map((s) => ({
      id: `req-${s.id}`,
      at: s.requestedAt,
      icon: "🛒",
      text: `${tenantName(s.requestedBy)} requested ${s.name}`,
    })),
    ...state.supplies
      .filter((s) => s.purchasedAt && s.purchasedBy)
      .map((s) => ({
        id: `buy-${s.id}`,
        at: s.purchasedAt as string,
        icon: "💸",
        text: `${tenantName(s.purchasedBy as string)} bought ${s.name}`,
      })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 8);

  const stats = [
    { label: "Residents", value: state.tenants.length, emoji: "🧍" },
    { label: "Rooms", value: state.rooms.length, emoji: "🚪" },
    { label: "Chores this week", value: logsThisWeek.length, emoji: "✅" },
    { label: "Items to buy", value: suppliesNeeded, emoji: "🛒" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-stone-900">
          {greeting}
          {activeTenant ? `, ${activeTenant.name}` : ""} 👋
        </h1>
        <p className="text-sm text-stone-500">Here’s how {state.houseName} is doing.</p>
      </div>

      {!activeTenant && state.tenants.length > 0 && (
        <Card className="border border-teal-100 !bg-teal-50/60">
          <p className="text-sm font-semibold text-stone-900">Who are you?</p>
          <p className="mt-0.5 text-xs text-stone-500">
            Pick yourself so chores and purchases get logged to you in one tap.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {state.tenants.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTenant(t.id);
                  onToast(`Welcome, ${t.name}! 🎉`);
                }}
                className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3.5 text-sm font-semibold text-stone-800 shadow-sm ring-1 ring-stone-900/5 transition hover:ring-teal-300 active:scale-95"
              >
                <Avatar tenant={t} size="sm" />
                {t.name}
              </button>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="!p-3.5">
            <p className="text-xs font-medium text-stone-500">
              <span className="mr-1" aria-hidden>
                {s.emoji}
              </span>
              {s.label}
            </p>
            <p className="mt-1 text-2xl font-semibold text-stone-900">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <SectionLabel>House MVP · this week</SectionLabel>
        {state.tenants.length === 0 ? (
          <div className="mt-2">
            <EmptyState emoji="🛏️" title="No residents yet" hint="Add people in the Rooms tab." />
          </div>
        ) : (
          <ul className="mt-3 space-y-2.5">
            {mvp.map(({ tenant, count }, i) => (
              <li key={tenant.id} className="flex items-center gap-3">
                <span className="w-6 text-center text-lg" aria-hidden>
                  {count > 0 && i < MEDALS.length ? MEDALS[i] : "·"}
                </span>
                <Avatar tenant={tenant} size="sm" />
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-stone-800">
                  {tenant.name}
                  {state.activeTenantId === tenant.id && (
                    <span className="ml-1.5 text-xs font-normal text-teal-600">(you)</span>
                  )}
                </p>
                <span className="text-sm font-bold tabular-nums text-stone-900">
                  {count}
                  <span className="ml-1 font-normal text-stone-400">
                    chore{count === 1 ? "" : "s"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <SectionLabel>Recent activity</SectionLabel>
        {feed.length === 0 ? (
          <p className="mt-2 text-sm text-stone-400">
            Nothing yet — log a chore or request a supply to get things moving.
          </p>
        ) : (
          <ul className="mt-3 space-y-2.5">
            {feed.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-stone-100 text-sm">
                  {item.icon}
                </span>
                <p className="min-w-0 flex-1 truncate text-sm text-stone-700">{item.text}</p>
                <span className="shrink-0 text-xs text-stone-400">{timeAgo(item.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="pt-2 text-center">
        <button
          onClick={() => {
            if (window.confirm("Reset the app back to the demo house? All your data will be lost.")) {
              resetHouse();
              onToast("House reset to demo data");
            }
          }}
          className="text-xs text-stone-400 underline-offset-2 transition hover:text-stone-600 hover:underline"
        >
          Reset app data
        </button>
      </div>
    </div>
  );
}
