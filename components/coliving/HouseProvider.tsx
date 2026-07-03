"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import type {
  Chore,
  ChoreCadence,
  ChoreLog,
  HouseState,
  ID,
  Room,
  Session,
  SupplyItem,
  Tenant,
} from "@/lib/coliving/types";
import { TENANT_COLORS } from "@/lib/coliving/types";
import { firebaseReady, getDb } from "@/lib/coliving/firebase";
import { makeHouseCode, uid } from "@/lib/coliving/utils";

const SESSION_KEY = "cohouse.session.v1";

export type Phase =
  | "boot" // before first client render — keeps SSR and hydration identical
  | "setup-missing" // Firebase env vars not configured
  | "onboarding" // no house on this device yet
  | "loading" // subscribed, waiting for first snapshots
  | "house-missing" // session points at a deleted/unknown house
  | "ready";

/** What the join/create screens need to show before a profile exists. */
export interface HousePreview {
  houseId: ID;
  name: string;
  rooms: Room[];
  tenantCount: number;
}

function loadSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    return parsed && typeof parsed.houseId === "string" ? parsed : null;
  } catch {
    return null;
  }
}

function docsToList<T>(snap: { docs: { id: string; data(): unknown }[] }): T[] {
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as T);
}

const byCreated = (a: { createdAt: string }, b: { createdAt: string }) =>
  a.createdAt.localeCompare(b.createdAt);

export interface HouseApi {
  phase: Phase;
  state: HouseState;
  /** The shareable invite code (same as houseId). */
  houseCode: string | null;

  // Onboarding
  createHouse(name: string, roomCount: number): Promise<HousePreview>;
  lookupHouse(code: string): Promise<HousePreview | null>;
  createProfile(preview: HousePreview, name: string, roomId: ID): Promise<void>;
  leaveHouse(): void;

  // House actions (optimistic — Firestore latency compensation updates the UI instantly)
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

  tenantById(id: ID): Tenant | undefined;
  tenantName(id: ID): string;
}

const HouseContext = createContext<HouseApi | null>(null);

export function HouseProvider({ children }: { children: React.ReactNode }) {
  const [booted, setBooted] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  // Live slices from Firestore. undefined/null distinguish "not loaded" from "empty".
  const [houseDoc, setHouseDoc] = useState<{ name: string } | null | undefined>(undefined);
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [chores, setChores] = useState<Chore[] | null>(null);
  const [choreLogs, setChoreLogs] = useState<ChoreLog[] | null>(null);
  const [supplies, setSupplies] = useState<SupplyItem[] | null>(null);

  useEffect(() => {
    setSession(loadSession());
    setBooted(true);
  }, []);

  function persistSession(next: Session | null) {
    try {
      if (next) window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      else window.localStorage.removeItem(SESSION_KEY);
    } catch {
      // Private mode — the session still works in memory.
    }
    setSession(next);
  }

  const houseId = session?.houseId ?? null;

  // Real-time subscriptions: one listener per collection, torn down on house change.
  useEffect(() => {
    if (!booted || !firebaseReady || !houseId) return;
    const houseRef = doc(getDb(), "houses", houseId);
    const unsubs = [
      onSnapshot(
        houseRef,
        (snap) => setHouseDoc(snap.exists() ? (snap.data() as { name: string }) : null),
        () => setHouseDoc(null),
      ),
      onSnapshot(collection(houseRef, "rooms"), (s) =>
        setRooms(docsToList<Room>(s).sort(byCreated)),
      ),
      onSnapshot(collection(houseRef, "tenants"), (s) =>
        setTenants(docsToList<Tenant>(s).sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))),
      ),
      onSnapshot(collection(houseRef, "chores"), (s) =>
        setChores(docsToList<Chore>(s).sort(byCreated)),
      ),
      onSnapshot(collection(houseRef, "choreLogs"), (s) => setChoreLogs(docsToList<ChoreLog>(s))),
      onSnapshot(collection(houseRef, "supplies"), (s) => setSupplies(docsToList<SupplyItem>(s))),
    ];
    return () => {
      unsubs.forEach((u) => u());
      setHouseDoc(undefined);
      setRooms(null);
      setTenants(null);
      setChores(null);
      setChoreLogs(null);
      setSupplies(null);
    };
  }, [booted, houseId]);

  const phase: Phase = !booted
    ? "boot"
    : !firebaseReady
      ? "setup-missing"
      : !houseId
        ? "onboarding"
        : houseDoc === undefined || !rooms || !tenants || !chores || !choreLogs || !supplies
          ? houseDoc === null
            ? "house-missing"
            : "loading"
          : houseDoc === null
            ? "house-missing"
            : "ready";

  const api = useMemo<HouseApi>(() => {
    const state: HouseState = {
      houseId: houseId ?? "",
      houseName: houseDoc?.name ?? "",
      activeTenantId: session?.tenantId ?? null,
      rooms: rooms ?? [],
      tenants: tenants ?? [],
      chores: chores ?? [],
      choreLogs: choreLogs ?? [],
      supplies: supplies ?? [],
    };
    const tenantMap = new Map(state.tenants.map((t) => [t.id, t]));
    const now = () => new Date().toISOString();
    const houseRef = () => doc(getDb(), "houses", houseId as string);
    const write = (p: Promise<unknown>) => {
      p.catch((err) => console.error("[cohouse] write failed:", err));
    };

    return {
      phase,
      state,
      houseCode: houseId,

      async createHouse(name, roomCount) {
        const db = getDb();
        // Retry a few times in the (unlikely) event of a code collision.
        let code = makeHouseCode();
        for (let i = 0; i < 5; i++) {
          const existing = await getDoc(doc(db, "houses", code));
          if (!existing.exists()) break;
          code = makeHouseCode();
        }
        const batch = writeBatch(db);
        const houseRef = doc(db, "houses", code);
        batch.set(houseRef, { name, createdAt: now() });
        const newRooms: Room[] = [];
        for (let i = 1; i <= roomCount; i++) {
          const roomRef = doc(collection(houseRef, "rooms"));
          // Zero-padded suffix keeps rooms in order when sorted by createdAt.
          const createdAt = new Date(Date.now() + i).toISOString();
          const room: Room = { id: roomRef.id, name: `Room ${i}`, createdAt };
          batch.set(roomRef, { name: room.name, createdAt });
          newRooms.push(room);
        }
        await batch.commit();
        return { houseId: code, name, rooms: newRooms, tenantCount: 0 };
      },

      async lookupHouse(code) {
        const db = getDb();
        const normalized = code.trim().toUpperCase();
        if (!normalized) return null;
        const houseSnap = await getDoc(doc(db, "houses", normalized));
        if (!houseSnap.exists()) return null;
        const houseRef = doc(db, "houses", normalized);
        const [roomSnap, tenantSnap] = await Promise.all([
          getDocs(collection(houseRef, "rooms")),
          getDocs(collection(houseRef, "tenants")),
        ]);
        return {
          houseId: normalized,
          name: (houseSnap.data() as { name: string }).name,
          rooms: docsToList<Room>(roomSnap).sort(byCreated),
          tenantCount: tenantSnap.size,
        };
      },

      async createProfile(preview, name, roomId) {
        const tenantRef = doc(collection(doc(getDb(), "houses", preview.houseId), "tenants"));
        const tenant: Tenant = {
          id: tenantRef.id,
          name,
          roomId,
          color: TENANT_COLORS[preview.tenantCount % TENANT_COLORS.length],
          joinedAt: now(),
        };
        await setDoc(tenantRef, {
          name: tenant.name,
          roomId: tenant.roomId,
          color: tenant.color,
          joinedAt: tenant.joinedAt,
        });
        persistSession({ houseId: preview.houseId, tenantId: tenant.id });
      },

      leaveHouse() {
        persistSession(null);
      },

      renameHouse(name) {
        write(updateDoc(houseRef(), { name }));
      },
      addRoom(name) {
        const ref = doc(collection(houseRef(), "rooms"));
        const room: Room = { id: ref.id, name, createdAt: now() };
        write(setDoc(ref, { name: room.name, createdAt: room.createdAt }));
        return room;
      },
      removeRoom(roomId) {
        if (state.tenants.some((t) => t.roomId === roomId)) return;
        write(deleteDoc(doc(houseRef(), "rooms", roomId)));
      },
      addTenant(roomId, name) {
        const ref = doc(collection(houseRef(), "tenants"));
        const tenant: Tenant = {
          id: ref.id,
          name,
          roomId,
          color: TENANT_COLORS[state.tenants.length % TENANT_COLORS.length],
          joinedAt: now(),
        };
        write(
          setDoc(ref, {
            name: tenant.name,
            roomId: tenant.roomId,
            color: tenant.color,
            joinedAt: tenant.joinedAt,
          }),
        );
        return tenant;
      },
      removeTenant(tenantId) {
        // Chore logs are kept: history stays truthful even after someone moves out.
        write(deleteDoc(doc(houseRef(), "tenants", tenantId)));
        if (session?.tenantId === tenantId) {
          persistSession({ houseId: houseId as string, tenantId: null });
        }
      },
      setActiveTenant(tenantId) {
        persistSession({ houseId: houseId as string, tenantId });
      },
      addChore(title, icon, cadence) {
        const ref = doc(collection(houseRef(), "chores"));
        const chore: Chore = { id: ref.id, title, icon, cadence, createdAt: now() };
        write(setDoc(ref, { title, icon, cadence, createdAt: chore.createdAt }));
        return chore;
      },
      removeChore(choreId) {
        const db = getDb();
        write(
          (async () => {
            const logs = await getDocs(
              query(collection(houseRef(), "choreLogs"), where("choreId", "==", choreId)),
            );
            const batch = writeBatch(db);
            batch.delete(doc(houseRef(), "chores", choreId));
            logs.docs.forEach((d) => batch.delete(d.ref));
            await batch.commit();
          })(),
        );
      },
      logChore(choreId, tenantId) {
        const ref = doc(collection(houseRef(), "choreLogs"));
        const log: ChoreLog = {
          id: ref.id,
          choreId,
          tenantId,
          action: "completed",
          timestamp: now(),
        };
        write(
          setDoc(ref, {
            choreId,
            tenantId,
            action: log.action,
            timestamp: log.timestamp,
          }),
        );
        return log;
      },
      undoLog(logId) {
        write(deleteDoc(doc(houseRef(), "choreLogs", logId)));
      },
      addSupply(name, requestedBy) {
        const ref = doc(collection(houseRef(), "supplies"));
        const item: SupplyItem = { id: ref.id, name, requestedBy, requestedAt: now() };
        write(setDoc(ref, { name, requestedBy, requestedAt: item.requestedAt }));
        return item;
      },
      markPurchased(supplyId, purchasedBy) {
        write(
          updateDoc(doc(houseRef(), "supplies", supplyId), {
            purchasedBy,
            purchasedAt: now(),
          }),
        );
      },
      removeSupply(supplyId) {
        write(deleteDoc(doc(houseRef(), "supplies", supplyId)));
      },

      tenantById(id) {
        return tenantMap.get(id);
      },
      tenantName(id) {
        return tenantMap.get(id)?.name ?? "Former resident";
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, houseId, session?.tenantId, houseDoc, rooms, tenants, chores, choreLogs, supplies]);

  return <HouseContext.Provider value={api}>{children}</HouseContext.Provider>;
}

export function useHouse(): HouseApi {
  const ctx = useContext(HouseContext);
  if (!ctx) throw new Error("useHouse must be used inside <HouseProvider>");
  return ctx;
}

/** `uid` re-export kept for potential offline id needs in views. */
export { uid };
