"use client";

import { useEffect, useState } from "react";
import type { ID } from "@/lib/coliving/types";
import { useHouse, type HousePreview } from "../HouseProvider";
import { GRADIENT_BTN, GRADIENT_TEXT, INPUT_CLASSES } from "../ui";
import { IconPlus } from "../icons";

type Mode = "choice" | "create" | "join" | "profile";

export function OnboardingView() {
  const { createHouse, lookupHouse, createProfile } = useHouse();

  const [mode, setMode] = useState<Mode>("choice");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [houseName, setHouseName] = useState("");
  const [roomCount, setRoomCount] = useState(3);

  // Join form
  const [code, setCode] = useState("");

  // Profile step (after create or successful join)
  const [preview, setPreview] = useState<HousePreview | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [roomId, setRoomId] = useState<ID | null>(null);

  // Invite deep-link: /coliving?join=CODE lands straight on the join step.
  useEffect(() => {
    const joinCode = new URLSearchParams(window.location.search).get("join");
    if (joinCode) {
      setCode(joinCode.toUpperCase());
      setMode("join");
    }
  }, []);

  async function run<T>(fn: () => Promise<T>): Promise<T | undefined> {
    setBusy(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      console.error("[cohouse] onboarding:", err);
      setError("Couldn't reach the server. Check your connection and try again.");
      return undefined;
    } finally {
      setBusy(false);
    }
  }

  async function submitCreate() {
    const name = houseName.trim();
    if (!name) return;
    const created = await run(() => createHouse(name, roomCount));
    if (created) {
      setPreview(created);
      setIsCreator(true);
      setRoomId(created.rooms[0]?.id ?? null);
      setMode("profile");
    }
  }

  async function submitJoin() {
    const found = await run(() => lookupHouse(code));
    if (found === undefined) return; // network error already shown
    if (found === null) {
      setError("No house found with that code. Double-check it with your roommate.");
      return;
    }
    setPreview(found);
    setIsCreator(false);
    setRoomId(found.rooms[0]?.id ?? null);
    setMode("profile");
  }

  async function submitProfile() {
    const name = profileName.trim();
    if (!preview || !name || !roomId) return;
    await run(() => createProfile(preview, name, roomId));
    // On success the provider's session flips the app into loading/ready.
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <header className="mb-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-fuchsia-400">
            CoHouse
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">
            Run your house <span className={GRADIENT_TEXT}>together</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Chores, rooms and supplies — synced live with your roommates.
          </p>
        </header>

        {error && (
          <p className="mb-4 rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300 ring-1 ring-rose-500/30">
            {error}
          </p>
        )}

        {mode === "choice" && (
          <div className="space-y-3">
            <button
              onClick={() => setMode("create")}
              className="w-full rounded-2xl bg-slate-900 p-5 text-left ring-1 ring-white/10 transition hover:ring-fuchsia-400/50 active:scale-[0.99]"
            >
              <span className="text-2xl">🏠</span>
              <span className="mt-2 block text-base font-bold text-white">Create a new house</span>
              <span className="mt-1 block text-sm text-slate-400">
                I&rsquo;m setting things up for my place.
              </span>
            </button>
            <button
              onClick={() => setMode("join")}
              className="w-full rounded-2xl bg-slate-900 p-5 text-left ring-1 ring-white/10 transition hover:ring-fuchsia-400/50 active:scale-[0.99]"
            >
              <span className="text-2xl">🔑</span>
              <span className="mt-2 block text-base font-bold text-white">Join an existing house</span>
              <span className="mt-1 block text-sm text-slate-400">
                A roommate gave me an invite code.
              </span>
            </button>
          </div>
        )}

        {mode === "create" && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              submitCreate();
            }}
          >
            <div>
              <label htmlFor="house-name" className="mb-1.5 block text-sm font-medium text-slate-300">
                House or apartment name
              </label>
              <input
                id="house-name"
                autoFocus
                value={houseName}
                onChange={(e) => setHouseName(e.target.value)}
                placeholder="e.g. Casa 670"
                className={`w-full ${INPUT_CLASSES}`}
              />
            </div>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-slate-300">
                Number of rooms
              </span>
              <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-slate-800/60 p-2">
                <button
                  type="button"
                  onClick={() => setRoomCount((n) => Math.max(1, n - 1))}
                  aria-label="Fewer rooms"
                  className="flex size-10 items-center justify-center rounded-lg bg-white/5 text-xl text-white transition hover:bg-white/10 active:scale-95"
                >
                  −
                </button>
                <span className={`flex-1 text-center text-2xl font-bold ${GRADIENT_TEXT}`}>
                  {roomCount}
                </span>
                <button
                  type="button"
                  onClick={() => setRoomCount((n) => Math.min(12, n + 1))}
                  aria-label="More rooms"
                  className="flex size-10 items-center justify-center rounded-lg bg-white/5 text-xl text-white transition hover:bg-white/10 active:scale-95"
                >
                  <IconPlus className="size-5" />
                </button>
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                Creates Room 1–{roomCount}. You can rename or add more later.
              </p>
            </div>
            <button
              type="submit"
              disabled={busy || !houseName.trim()}
              className={`w-full rounded-xl py-3 text-sm font-bold ${GRADIENT_BTN}`}
            >
              {busy ? "Creating…" : "Create house"}
            </button>
            <BackButton onClick={() => setMode("choice")} />
          </form>
        )}

        {mode === "join" && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              submitJoin();
            }}
          >
            <div>
              <label htmlFor="house-code" className="mb-1.5 block text-sm font-medium text-slate-300">
                Invite code
              </label>
              <input
                id="house-code"
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. XK4P2M"
                maxLength={8}
                className={`w-full text-center text-xl font-bold uppercase tracking-[0.3em] ${INPUT_CLASSES}`}
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Ask the person who set up the house — it&rsquo;s on their Home screen.
              </p>
            </div>
            <button
              type="submit"
              disabled={busy || code.trim().length < 4}
              className={`w-full rounded-xl py-3 text-sm font-bold ${GRADIENT_BTN}`}
            >
              {busy ? "Looking…" : "Find house"}
            </button>
            <BackButton onClick={() => setMode("choice")} />
          </form>
        )}

        {mode === "profile" && preview && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              submitProfile();
            }}
          >
            <div className="rounded-2xl bg-slate-900 p-4 text-center ring-1 ring-white/10">
              <p className="text-sm text-slate-400">
                {isCreator ? "Your house is ready" : "You're joining"}
              </p>
              <p className="mt-0.5 text-lg font-bold text-white">{preview.name}</p>
              {isCreator && (
                <p className="mt-2 text-xs text-slate-500">
                  Invite code:{" "}
                  <span className={`text-sm font-bold tracking-[0.2em] ${GRADIENT_TEXT}`}>
                    {preview.houseId}
                  </span>{" "}
                  — it&rsquo;ll stay on your Home screen.
                </p>
              )}
            </div>
            <div>
              <label htmlFor="profile-name" className="mb-1.5 block text-sm font-medium text-slate-300">
                Your name
              </label>
              <input
                id="profile-name"
                autoFocus
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="e.g. Jeison"
                className={`w-full ${INPUT_CLASSES}`}
              />
            </div>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-slate-300">Your room</span>
              {preview.rooms.length === 0 ? (
                <p className="rounded-xl bg-white/5 px-3 py-2.5 text-xs text-slate-400">
                  This house has no rooms yet — you can add them once you&rsquo;re in.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {preview.rooms.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRoomId(r.id)}
                      aria-pressed={roomId === r.id}
                      className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition active:scale-[0.98] ${
                        roomId === r.id
                          ? "bg-gradient-to-r from-fuchsia-500 to-orange-400 text-white shadow-lg shadow-fuchsia-500/20"
                          : "bg-slate-800/60 text-slate-300 ring-1 ring-white/10 hover:ring-fuchsia-400/40"
                      }`}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={busy || !profileName.trim() || (preview.rooms.length > 0 && !roomId)}
              className={`w-full rounded-xl py-3 text-sm font-bold ${GRADIENT_BTN}`}
            >
              {busy ? "Entering…" : "Enter the house"}
            </button>
            {!isCreator && <BackButton onClick={() => setMode("join")} />}
          </form>
        )}
      </div>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl py-2 text-sm font-medium text-slate-500 transition hover:text-slate-300"
    >
      ← Back
    </button>
  );
}
