"use client";

import { startOfWeek, timeAgo } from "@/lib/coliving/utils";
import { useHouse } from "../HouseProvider";
import { Avatar, Card, EmptyState, GRADIENT_BTN, GRADIENT_TEXT, SectionLabel } from "../ui";
import { IconCopy, IconLogout } from "../icons";

const MEDALS = ["🥇", "🥈", "🥉"];

export function HomeView({ onToast }: { onToast: (msg: string) => void }) {
  const { state, houseCode, leaveHouse, tenantName } = useHouse();

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

  async function copyInvite() {
    const link = `${window.location.origin}${window.location.pathname}?join=${houseCode}`;
    try {
      await navigator.clipboard.writeText(link);
      onToast("🔗 Invite link copied — send it to your roomies");
    } catch {
      onToast(`Your invite code: ${houseCode}`);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">
          {greeting}
          {activeTenant ? `, ${activeTenant.name}` : ""} 👋
        </h1>
        <p className="text-sm text-slate-400">Here’s how {state.houseName} is doing.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="!p-3.5">
            <p className="text-xs font-medium text-slate-400">
              <span className="mr-1" aria-hidden>
                {s.emoji}
              </span>
              {s.label}
            </p>
            <p className={`mt-1 text-2xl font-semibold ${s.value > 0 ? GRADIENT_TEXT : "text-slate-600"}`}>
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      <Card className="border-0 !bg-gradient-to-br !from-slate-900 !to-fuchsia-950/40">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <SectionLabel>Invite roommates</SectionLabel>
            <p className={`mt-1 text-2xl font-bold tracking-[0.25em] ${GRADIENT_TEXT}`}>
              {houseCode}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              They tap the link, enter their name, pick a room — done.
            </p>
          </div>
          <button
            onClick={copyInvite}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-bold ${GRADIENT_BTN}`}
          >
            <IconCopy className="size-4" />
            Copy link
          </button>
        </div>
      </Card>

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
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-200">
                  {tenant.name}
                  {state.activeTenantId === tenant.id && (
                    <span className="ml-1.5 text-xs font-normal text-fuchsia-400">(you)</span>
                  )}
                </p>
                <span className="text-sm font-bold tabular-nums text-white">
                  {count}
                  <span className="ml-1 font-normal text-slate-500">
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
          <p className="mt-2 text-sm text-slate-500">
            Nothing yet — log a chore or request a supply to get things moving.
          </p>
        ) : (
          <ul className="mt-3 space-y-2.5">
            {feed.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-sm ring-1 ring-white/10">
                  {item.icon}
                </span>
                <p className="min-w-0 flex-1 truncate text-sm text-slate-300">{item.text}</p>
                <span className="shrink-0 text-xs text-slate-500">{timeAgo(item.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="pt-2 text-center">
        <button
          onClick={() => {
            if (
              window.confirm(
                "Leave this house on this device? The house and its data stay — you can rejoin anytime with the invite code.",
              )
            ) {
              leaveHouse();
            }
          }}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 transition hover:text-slate-300"
        >
          <IconLogout className="size-3.5" />
          Leave this house
        </button>
      </div>
    </div>
  );
}
