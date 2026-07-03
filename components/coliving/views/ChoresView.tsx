"use client";

import { useState } from "react";
import type { Chore, ChoreCadence, ID } from "@/lib/coliving/types";
import { formatWhen, startOfWeek } from "@/lib/coliving/utils";
import { useHouse } from "../HouseProvider";
import {
  Avatar,
  Card,
  EmptyState,
  GRADIENT_BTN,
  GRADIENT_TEXT,
  INPUT_CLASSES,
  SectionLabel,
  TenantSheet,
} from "../ui";
import { IconCheck, IconPlus, IconTrash } from "../icons";

const CHORE_ICONS = ["🗑️", "🧹", "🍽️", "🚿", "🧽", "🧺", "🌿", "🐕", "🛏️", "🪟"];

export function ChoresView({
  onToast,
}: {
  onToast: (msg: string, onUndo?: () => void) => void;
}) {
  const { state, addChore, removeChore, logChore, undoLog, tenantById } = useHouse();

  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState(CHORE_ICONS[0]);
  const [cadence, setCadence] = useState<ChoreCadence>("weekly");
  /** Chore waiting for a "who did it?" pick when no active resident is set. */
  const [pickForChoreId, setPickForChoreId] = useState<ID | null>(null);

  const weekStart = startOfWeek().getTime();
  const doneThisWeek = state.choreLogs.filter(
    (l) => new Date(l.timestamp).getTime() >= weekStart,
  ).length;

  function handleLog(chore: Chore, tenantId?: ID) {
    const tid = tenantId ?? state.activeTenantId;
    if (!tid) {
      setPickForChoreId(chore.id);
      return;
    }
    const tenant = tenantById(tid);
    if (!tenant) return;
    const log = logChore(chore.id, tid);
    onToast(`${chore.icon} ${chore.title} logged for ${tenant.name}`, () => undoLog(log.id));
  }

  function submitChore() {
    const t = title.trim();
    if (!t) return;
    addChore(t, icon, cadence);
    setTitle("");
    setAdding(false);
    onToast(`${icon} "${t}" added to the board`);
  }

  const pickChore = state.chores.find((c) => c.id === pickForChoreId);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Accountability board</h1>
          <p className="text-sm text-slate-400">
            {doneThisWeek} done this week · resets Monday
          </p>
        </div>
        <button
          onClick={() => setAdding((v) => !v)}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold ${GRADIENT_BTN}`}
        >
          <IconPlus className="size-4" />
          Add chore
        </button>
      </div>

      {adding && (
        <Card>
          <SectionLabel>New chore</SectionLabel>
          <form
            className="mt-2 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              submitChore();
            }}
          >
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Water the plants"
              className={`w-full ${INPUT_CLASSES}`}
            />
            <div className="flex flex-wrap gap-1.5">
              {CHORE_ICONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setIcon(e)}
                  aria-pressed={icon === e}
                  className={`rounded-xl p-2 text-lg transition ${
                    icon === e
                      ? "bg-fuchsia-500/15 ring-2 ring-fuchsia-400"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-1 rounded-xl bg-slate-800/60 p-1 ring-1 ring-white/10">
                {(["daily", "weekly"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCadence(c)}
                    aria-pressed={cadence === c}
                    className={`flex-1 rounded-lg py-1.5 text-sm font-medium capitalize transition ${
                      cadence === c ? "bg-slate-700 text-white shadow-sm" : "text-slate-400"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                disabled={!title.trim()}
                className={`rounded-xl px-4 py-2 text-sm font-semibold ${GRADIENT_BTN}`}
              >
                Add
              </button>
            </div>
          </form>
        </Card>
      )}

      {state.chores.length === 0 && !adding ? (
        <EmptyState
          emoji="🧹"
          title="No chores on the board"
          hint='Tap "Add chore" to set up recurring house tasks.'
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {state.chores.map((chore) => (
            <ChoreCard
              key={chore.id}
              chore={chore}
              weekStart={weekStart}
              onLog={() => handleLog(chore)}
              onRemove={() => {
                if (window.confirm(`Remove "${chore.title}" and its history?`)) {
                  removeChore(chore.id);
                  onToast(`"${chore.title}" removed`);
                }
              }}
            />
          ))}
        </div>
      )}

      <TenantSheet
        open={pickForChoreId !== null}
        onClose={() => setPickForChoreId(null)}
        title={pickChore ? `Who did "${pickChore.title}"?` : "Who did this?"}
        subtitle="Tip: set who you are from the top-right chip for one-tap logging."
        onPick={(t) => {
          if (pickChore) handleLog(pickChore, t.id);
        }}
      />
    </div>
  );
}

function ChoreCard({
  chore,
  weekStart,
  onLog,
  onRemove,
}: {
  chore: Chore;
  weekStart: number;
  onLog: () => void;
  onRemove: () => void;
}) {
  const { state } = useHouse();

  const choreLogs = state.choreLogs.filter((l) => l.choreId === chore.id);

  // Leaderboard rows: one per current resident, counted from the event log.
  const rows = state.tenants
    .map((tenant) => {
      const logs = choreLogs.filter((l) => l.tenantId === tenant.id);
      const weekCount = logs.filter((l) => new Date(l.timestamp).getTime() >= weekStart).length;
      const lastDone = logs.reduce<string | null>(
        (latest, l) => (!latest || l.timestamp > latest ? l.timestamp : latest),
        null,
      );
      return { tenant, weekCount, lastDone };
    })
    .sort(
      (a, b) => b.weekCount - a.weekCount || a.tenant.name.localeCompare(b.tenant.name),
    );

  const maxCount = rows[0]?.weekCount ?? 0;
  const latestLog = choreLogs.reduce<(typeof choreLogs)[number] | null>(
    (latest, l) => (!latest || l.timestamp > latest.timestamp ? l : latest),
    null,
  );
  const latestBy = latestLog ? state.tenants.find((t) => t.id === latestLog.tenantId) : null;

  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-xl ring-1 ring-white/10">
          {chore.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-base font-bold text-white">{chore.title}</h2>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                chore.cadence === "daily"
                  ? "bg-cyan-400/10 text-cyan-300"
                  : "bg-violet-400/10 text-violet-300"
              }`}
            >
              {chore.cadence}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {latestLog
              ? `Last: ${latestBy?.name ?? "Former resident"} · ${formatWhen(latestLog.timestamp)}`
              : "Never done yet — be the first!"}
          </p>
        </div>
        <button
          onClick={onRemove}
          aria-label={`Remove ${chore.title}`}
          className="rounded-full p-1.5 text-slate-600 transition hover:bg-rose-500/10 hover:text-rose-400"
        >
          <IconTrash className="size-4" />
        </button>
      </div>

      <button
        onClick={onLog}
        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold ${GRADIENT_BTN}`}
      >
        <IconCheck className="size-4" />
        I did this just now
      </button>

      {state.tenants.length > 0 && (
        <div className="mt-4">
          <SectionLabel>This week</SectionLabel>
          <ul className="mt-2 space-y-2">
            {rows.map(({ tenant, weekCount, lastDone }) => (
              <li key={tenant.id} className="flex items-center gap-2.5">
                <Avatar tenant={tenant} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-200">
                    {tenant.name}
                    {weekCount > 0 && weekCount === maxCount && (
                      <span className="ml-1" role="img" aria-label="Leader">
                        👑
                      </span>
                    )}
                    {state.activeTenantId === tenant.id && (
                      <span className="ml-1.5 text-xs font-normal text-fuchsia-400">(you)</span>
                    )}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {lastDone ? `Last done: ${formatWhen(lastDone)}` : "Not yet"}
                  </p>
                </div>
                <span
                  className={`text-lg font-bold tabular-nums ${
                    weekCount > 0 ? GRADIENT_TEXT : "text-slate-600"
                  }`}
                >
                  {weekCount}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
