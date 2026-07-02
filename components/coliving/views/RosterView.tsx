"use client";

import { useState } from "react";
import type { ID } from "@/lib/coliving/types";
import { formatDate } from "@/lib/coliving/utils";
import { useHouse } from "../HouseProvider";
import { Avatar, Card, EmptyState, GRADIENT_BTN, INPUT_CLASSES, SectionLabel } from "../ui";
import { IconPlus, IconTrash, IconX } from "../icons";

export function RosterView({ onToast }: { onToast: (msg: string) => void }) {
  const { state, addRoom, removeRoom, addTenant, removeTenant } = useHouse();
  const [addingRoom, setAddingRoom] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [tenantFormRoomId, setTenantFormRoomId] = useState<ID | null>(null);
  const [tenantName, setTenantName] = useState("");

  const suggestedRoomName = `Room ${state.rooms.length + 1}`;

  function submitRoom() {
    const name = roomName.trim() || suggestedRoomName;
    addRoom(name);
    setRoomName("");
    setAddingRoom(false);
    onToast(`🚪 ${name} added to the house`);
  }

  function submitTenant(roomId: ID) {
    const name = tenantName.trim();
    if (!name) return;
    addTenant(roomId, name);
    setTenantName("");
    setTenantFormRoomId(null);
    onToast(`👋 ${name} moved in`);
  }

  function confirmRemoveTenant(tenantId: ID, name: string) {
    if (window.confirm(`Remove ${name} from the house? Their chore history stays on the board.`)) {
      removeTenant(tenantId);
      onToast(`${name} moved out`);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">The roster</h1>
          <p className="text-sm text-slate-400">
            {state.tenants.length} resident{state.tenants.length === 1 ? "" : "s"} ·{" "}
            {state.rooms.length} room{state.rooms.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          onClick={() => {
            setAddingRoom(true);
            setTenantFormRoomId(null);
          }}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold ${GRADIENT_BTN}`}
        >
          <IconPlus className="size-4" />
          Add room
        </button>
      </div>

      {state.rooms.length === 0 && !addingRoom && (
        <EmptyState
          emoji="🏚️"
          title="The house is empty"
          hint='Tap "Add room" to start building it out.'
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {state.rooms.map((room) => {
          const occupants = state.tenants.filter((t) => t.roomId === room.id);
          const isAddingHere = tenantFormRoomId === room.id;
          return (
            <Card key={room.id}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="truncate text-base font-bold text-white">{room.name}</h2>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      occupants.length > 0
                        ? "bg-teal-400/10 text-teal-300"
                        : "bg-white/5 text-slate-500"
                    }`}
                  >
                    {occupants.length > 0
                      ? `${occupants.length} resident${occupants.length === 1 ? "" : "s"}`
                      : "Empty"}
                  </span>
                  {occupants.length === 0 && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${room.name}?`)) {
                          removeRoom(room.id);
                          onToast(`${room.name} deleted`);
                        }
                      }}
                      aria-label={`Delete ${room.name}`}
                      className="rounded-full p-1.5 text-slate-600 transition hover:bg-rose-500/10 hover:text-rose-400"
                    >
                      <IconTrash className="size-4" />
                    </button>
                  )}
                </div>
              </div>

              {occupants.length > 0 ? (
                <ul className="space-y-2">
                  {occupants.map((t) => (
                    <li key={t.id} className="flex items-center gap-3">
                      <Avatar tenant={t} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-200">
                          {t.name}
                          {state.activeTenantId === t.id && (
                            <span className="ml-1.5 text-xs font-medium text-fuchsia-400">
                              (you)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500">Moved in {formatDate(t.joinedAt)}</p>
                      </div>
                      <button
                        onClick={() => confirmRemoveTenant(t.id, t.name)}
                        aria-label={`Remove ${t.name}`}
                        className="rounded-full p-1.5 text-slate-600 transition hover:bg-rose-500/10 hover:text-rose-400"
                      >
                        <IconX className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl bg-white/5 px-3 py-2.5 text-xs text-slate-500">
                  Nobody lives here yet.
                </p>
              )}

              {isAddingHere ? (
                <form
                  className="mt-3 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitTenant(room.id);
                  }}
                >
                  <input
                    autoFocus
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    placeholder="Resident name"
                    className={`min-w-0 flex-1 ${INPUT_CLASSES}`}
                  />
                  <button
                    type="submit"
                    disabled={!tenantName.trim()}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold ${GRADIENT_BTN}`}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTenantFormRoomId(null);
                      setTenantName("");
                    }}
                    className="rounded-xl px-2 py-2 text-sm text-slate-400 transition hover:bg-white/5"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => {
                    setTenantFormRoomId(room.id);
                    setTenantName("");
                    setAddingRoom(false);
                  }}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-white/10 py-2 text-sm font-medium text-slate-400 transition hover:border-fuchsia-400/40 hover:text-fuchsia-300"
                >
                  <IconPlus className="size-4" />
                  Add resident
                </button>
              )}
            </Card>
          );
        })}

        {addingRoom && (
          <Card>
            <SectionLabel>New room</SectionLabel>
            <form
              className="mt-2 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                submitRoom();
              }}
            >
              <input
                autoFocus
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder={suggestedRoomName}
                className={`min-w-0 flex-1 ${INPUT_CLASSES}`}
              />
              <button
                type="submit"
                className={`rounded-xl px-3 py-2 text-sm font-semibold ${GRADIENT_BTN}`}
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddingRoom(false);
                  setRoomName("");
                }}
                className="rounded-xl px-2 py-2 text-sm text-slate-400 transition hover:bg-white/5"
              >
                Cancel
              </button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
