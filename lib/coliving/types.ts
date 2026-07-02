/**
 * Coliving house data model.
 *
 * Everything hangs off a single HouseState document. In the future SaaS,
 * one HouseState maps to one tenant-org record in the database, so every
 * entity carries its own id and ISO timestamps instead of being derived
 * from array positions or UI state.
 */

export type ID = string;

/** Avatar hues assigned round-robin when a tenant joins. */
export const TENANT_COLORS = [
  "teal",
  "violet",
  "amber",
  "rose",
  "sky",
  "lime",
  "fuchsia",
  "orange",
] as const;

export type TenantColor = (typeof TENANT_COLORS)[number];

export interface Room {
  id: ID;
  name: string;
  createdAt: string; // ISO 8601
}

export interface Tenant {
  id: ID;
  name: string;
  roomId: ID;
  color: TenantColor;
  joinedAt: string;
}

export type ChoreCadence = "daily" | "weekly";

export interface Chore {
  id: ID;
  title: string;
  icon: string; // emoji
  cadence: ChoreCadence;
  createdAt: string;
}

/** Room to grow: "skipped", "swapped", "disputed"… only "completed" is created today. */
export type ChoreAction = "completed";

/**
 * Chores are event logs, not checkboxes: every tap records who, what and when.
 * All counters and leaderboards are derived from these rows.
 */
export interface ChoreLog {
  id: ID;
  choreId: ID;
  tenantId: ID;
  action: ChoreAction;
  timestamp: string;
}

export interface SupplyItem {
  id: ID;
  name: string;
  requestedBy: ID; // tenant id
  requestedAt: string;
  purchasedBy?: ID;
  purchasedAt?: string;
}

export interface HouseState {
  houseId: ID;
  houseName: string;
  /** Which resident is using this device; attribution for one-tap logging. */
  activeTenantId: ID | null;
  rooms: Room[];
  tenants: Tenant[];
  chores: Chore[];
  choreLogs: ChoreLog[];
  supplies: SupplyItem[];
}
