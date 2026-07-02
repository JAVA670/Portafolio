"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import type {
  Chore,
  ChoreCadence,
  ChoreLog,
  HouseState,
  ID,
  Room,
  SupplyItem,
  Tenant,
} from "@/lib/coliving/types";
import { TENANT_COLORS } from "@/lib/coliving/types";
import { makeSeedState } from "@/lib/coliving/seed";
import { uid } from "@/lib/coliving/utils";

const STORAGE_KEY = "coliving.house.v1";

type HouseAction =
  | { type: "REPLACE"; state: HouseState }
  | { type: "RENAME_HOUSE"; name: string }
  | { type: "ADD_ROOM"; room: Room }
  | { type: "REMOVE_ROOM"; roomId: ID }
  | { type: "ADD_TENANT"; tenant: Tenant }
  | { type: "REMOVE_TENANT"; tenantId: ID }
  | { type: "SET_ACTIVE_TENANT"; tenantId: ID | null }
  | { type: "ADD_CHORE"; chore: Chore }
  | { type: "REMOVE_CHORE"; choreId: ID }
  | { type: "ADD_LOG"; log: ChoreLog }
  | { type: "REMOVE_LOG"; logId: ID }
  | { type: "ADD_SUPPLY"; item: SupplyItem }
  | { type: "MARK_PURCHASED"; supplyId: ID; purchasedBy: ID; purchasedAt: string }
  | { type: "REMOVE_SUPPLY"; supplyId: ID };

function reducer(state: HouseState, action: HouseAction): HouseState {
  switch (action.type) {
    case "REPLACE":
      return action.state;
    case "RENAME_HOUSE":
      return { ...state, houseName: action.name };
    case "ADD_ROOM":
      return { ...state, rooms: [...state.rooms, action.room] };
    case "REMOVE_ROOM":
      // Occupied rooms can't be deleted; the UI hides the button but guard anyway.
      if (state.tenants.some((t) => t.roomId === action.roomId)) return state;
      return { ...state, rooms: state.rooms.filter((r) => r.id !== action.roomId) };
    case "ADD_TENANT":
      return { ...state, tenants: [...state.tenants, action.tenant] };
    case "REMOVE_TENANT":
      // Chore logs are kept: history stays truthful even after someone moves out.
      return {
        ...state,
        tenants: state.tenants.filter((t) => t.id !== action.tenantId),
        activeTenantId:
          state.activeTenantId === action.tenantId ? null : state.activeTenantId,
      };
    case "SET_ACTIVE_TENANT":
      return { ...state, activeTenantId: action.tenantId };
    case "ADD_CHORE":
      return { ...state, chores: [...state.chores, action.chore] };
    case "REMOVE_CHORE":
      return {
        ...state,
        chores: state.chores.filter((c) => c.id !== action.choreId),
        choreLogs: state.choreLogs.filter((l) => l.choreId !== action.choreId),
      };
    case "ADD_LOG":
      return { ...state, choreLogs: [...state.choreLogs, action.log] };
    case "REMOVE_LOG":
      return { ...state, choreLogs: state.choreLogs.filter((l) => l.id !== action.logId) };
    case "ADD_SUPPLY":
      return { ...state, supplies: [...state.supplies, action.item] };
    case "MARK_PURCHASED":
      return {
        ...state,
        supplies: state.supplies.map((s) =>
          s.id === action.supplyId
            ? { ...s, purchasedBy: action.purchasedBy, purchasedAt: action.purchasedAt }
            : s,
        ),
      };
    case "REMOVE_SUPPLY":
      return { ...state, supplies: state.supplies.filter((s) => s.id !== action.supplyId) };
  }
}

function loadStoredState(): HouseState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as HouseState;
    if (
      !parsed ||
      typeof parsed.houseName !== "string" ||
      !Array.isArray(parsed.rooms) ||
      !Array.isArray(parsed.tenants) ||
      !Array.isArray(parsed.chores) ||
      !Array.isArray(parsed.choreLogs) ||
      !Array.isArray(parsed.supplies)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export interface HouseApi {
  state: HouseState;
  renameHouse(name: string): void;
  addRoom(name: string): Room;
  removeRoom(roomId: ID): void;
  addTenant(roomId: ID, name: string): Tenant;
  removeTenant(tenantId: ID): void;
  setActiveTenant(tenantId: ID | null): void;
  addChore(title: string, icon: string, cadence: ChoreCadence): Chore;
  removeChore(choreId: ID): void;
  logChore(choreId: ID, tenantId: ID): ChoreLog;
  undoLog(logId: ID): void;
  addSupply(name: string, requestedBy: ID): SupplyItem;
  markPurchased(supplyId: ID, purchasedBy: ID): void;
  removeSupply(supplyId: ID): void;
  resetHouse(): void;
  tenantById(id: ID): Tenant | undefined;
  /** Display name that survives move-outs (logs reference tenants by id). */
  tenantName(id: ID): string;
}

const HouseContext = createContext<HouseApi | null>(null);

export function HouseProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, makeSeedState);
  const [hydrated, setHydrated] = useState(false);

  // Load persisted state after mount so server and first client render match.
  useEffect(() => {
    const stored = loadStoredState();
    if (stored) dispatch({ type: "REPLACE", state: stored });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or blocked (private mode) — the session still works in memory.
    }
  }, [state, hydrated]);

  const api = useMemo<HouseApi>(() => {
    const tenantMap = new Map(state.tenants.map((t) => [t.id, t]));
    const now = () => new Date().toISOString();

    return {
      state,
      renameHouse(name) {
        dispatch({ type: "RENAME_HOUSE", name });
      },
      addRoom(name) {
        const room: Room = { id: uid(), name, createdAt: now() };
        dispatch({ type: "ADD_ROOM", room });
        return room;
      },
      removeRoom(roomId) {
        dispatch({ type: "REMOVE_ROOM", roomId });
      },
      addTenant(roomId, name) {
        const tenant: Tenant = {
          id: uid(),
          name,
          roomId,
          color: TENANT_COLORS[state.tenants.length % TENANT_COLORS.length],
          joinedAt: now(),
        };
        dispatch({ type: "ADD_TENANT", tenant });
        return tenant;
      },
      removeTenant(tenantId) {
        dispatch({ type: "REMOVE_TENANT", tenantId });
      },
      setActiveTenant(tenantId) {
        dispatch({ type: "SET_ACTIVE_TENANT", tenantId });
      },
      addChore(title, icon, cadence) {
        const chore: Chore = { id: uid(), title, icon, cadence, createdAt: now() };
        dispatch({ type: "ADD_CHORE", chore });
        return chore;
      },
      removeChore(choreId) {
        dispatch({ type: "REMOVE_CHORE", choreId });
      },
      logChore(choreId, tenantId) {
        const log: ChoreLog = {
          id: uid(),
          choreId,
          tenantId,
          action: "completed",
          timestamp: now(),
        };
        dispatch({ type: "ADD_LOG", log });
        return log;
      },
      undoLog(logId) {
        dispatch({ type: "REMOVE_LOG", logId });
      },
      addSupply(name, requestedBy) {
        const item: SupplyItem = { id: uid(), name, requestedBy, requestedAt: now() };
        dispatch({ type: "ADD_SUPPLY", item });
        return item;
      },
      markPurchased(supplyId, purchasedBy) {
        dispatch({ type: "MARK_PURCHASED", supplyId, purchasedBy, purchasedAt: now() });
      },
      removeSupply(supplyId) {
        dispatch({ type: "REMOVE_SUPPLY", supplyId });
      },
      resetHouse() {
        dispatch({ type: "REPLACE", state: makeSeedState() });
      },
      tenantById(id) {
        return tenantMap.get(id);
      },
      tenantName(id) {
        return tenantMap.get(id)?.name ?? "Former resident";
      },
    };
  }, [state]);

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="animate-pulse text-4xl" role="status" aria-label="Loading house">
          🏠
        </div>
      </div>
    );
  }

  return <HouseContext.Provider value={api}>{children}</HouseContext.Provider>;
}

export function useHouse(): HouseApi {
  const ctx = useContext(HouseContext);
  if (!ctx) throw new Error("useHouse must be used inside <HouseProvider>");
  return ctx;
}
