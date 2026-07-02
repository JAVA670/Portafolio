import type { HouseState } from "./types";

const H = 3_600_000;
const D = 24 * H;

/**
 * Demo house shown on first launch so every view has something to explain
 * itself with. Timestamps are relative to "now" so the weekly leaderboard
 * always has fresh data.
 */
export function makeSeedState(): HouseState {
  const now = Date.now();
  const iso = (offsetMs: number) => new Date(now - offsetMs).toISOString();

  return {
    houseId: "house-demo",
    houseName: "Casa 670",
    activeTenantId: null,
    rooms: [
      { id: "room-1", name: "Room 1", createdAt: iso(30 * D) },
      { id: "room-2", name: "Room 2", createdAt: iso(30 * D) },
    ],
    tenants: [
      { id: "t-jeison", name: "Jeison", roomId: "room-1", color: "teal", joinedAt: iso(28 * D) },
      { id: "t-javier", name: "Javier", roomId: "room-2", color: "violet", joinedAt: iso(21 * D) },
    ],
    chores: [
      { id: "c-trash", title: "Take out trash", icon: "🗑️", cadence: "daily", createdAt: iso(28 * D) },
      { id: "c-dishes", title: "Wash the dishes", icon: "🍽️", cadence: "daily", createdAt: iso(28 * D) },
      { id: "c-sweep", title: "Sweep the floors", icon: "🧹", cadence: "weekly", createdAt: iso(28 * D) },
      { id: "c-bath", title: "Clean the bathroom", icon: "🚿", cadence: "weekly", createdAt: iso(28 * D) },
    ],
    choreLogs: [
      { id: "log-1", choreId: "c-trash", tenantId: "t-jeison", action: "completed", timestamp: iso(2 * H) },
      { id: "log-2", choreId: "c-dishes", tenantId: "t-javier", action: "completed", timestamp: iso(5 * H) },
      { id: "log-3", choreId: "c-sweep", tenantId: "t-javier", action: "completed", timestamp: iso(26 * H) },
    ],
    supplies: [
      { id: "s-1", name: "Paper towels", requestedBy: "t-javier", requestedAt: iso(1 * D) },
      {
        id: "s-2",
        name: "Dish soap",
        requestedBy: "t-jeison",
        requestedAt: iso(3 * D),
        purchasedBy: "t-javier",
        purchasedAt: iso(1 * D),
      },
    ],
  };
}
