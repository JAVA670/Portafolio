"use client";

import { useState } from "react";
import type { ID } from "@/lib/coliving/types";
import { formatDate } from "@/lib/coliving/utils";
import { useHouse } from "../HouseProvider";
import { Avatar, Card, EmptyState, SectionLabel } from "../ui";
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
          <h1 className="text-xl font-bold text-stone-900">The roster</h1>
          <p className="text-sm text-stone-500">
            {state.tenants.length} resident{state.tenants.length === 1 ? "" : "s"} ·{" "}
            {state.rooms.length} room{state.rooms.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          onClick={() => {
            setAddingRoom(true);
            setTenantFormRoomId(null);
          }}
          className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 active:scale-95"
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
                <h2 className="truncate text-base font-bold text-stone-900">{room.name}</h2>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      occupants.length > 0
                        ? "bg-teal-50 text-teal-700"
                        : "bg-stone-100 text-stone-500"
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
                      className="rounded-full p-1.5 text-stone-300 transition hover:bg-rose-50 hover:text-rose-600"
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
                        <p className="truncate text-sm font-semibold text-stone-900">
                          {t.name}
                          {state.activeTenantId === t.id && (
                            <span className="ml-1.5 text-xs font-medium text-teal-600">(you)</span>
                          )}
                        </p>
                        <p className="text-xs text-stone-400">
                          Moved in {formatDate(t.joinedAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => confirmRemoveTenant(t.id, t.name)}
                        aria-label={`Remove ${t.name}`}
                        className="rounded-full p-1.5 text-stone-300 transition hover:bg-rose-50 hover:text-rose-600"
                      >
                        <IconX className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl bg-stone-50 px-3 py-2.5 text-xs text-stone-400">
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
                    className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-400"
                  />
                  <button
                    type="submit"
                    disabled={!tenantName.trim()}
                    className="rounded-xl bg-teal-600 px-3 py-2 text-sm font-semibold text-white transition enabled:hover:bg-teal-700 disabled:opacity-40"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTenantFormRoomId(null);
                      setTenantName("");
                    }}
                    className="rounded-xl px-2 py-2 text-sm text-stone-500 transition hover:bg-stone-100"
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
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-stone-200 py-2 text-sm font-medium text-stone-500 transition hover:border-teal-300 hover:text-teal-700"
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
                className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-400"
              />
              <button
                type="submit"
                className="rounded-xl bg-teal-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddingRoom(false);
                  setRoomName("");
                }}
                className="rounded-xl px-2 py-2 text-sm text-stone-500 transition hover:bg-stone-100"
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
