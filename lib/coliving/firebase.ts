import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from "firebase/firestore";

/**
 * Firebase web config is public by design — these values ship in every
 * client's browser and are NOT secrets; access control lives in the
 * Firestore security rules. The committed defaults below are the CoHouse
 * project so the app works out of the box; env vars (.env.local / Vercel)
 * override them if you ever point it at a different project.
 */
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyBtqmlV8ZxdugG9hv7JU-YoyViBofdU37E",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "colivingg.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "colivingg",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "colivingg.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "262961752702",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:262961752702:web:6757eabe8da0496e6b462f",
};

/** False when env vars are missing — the app then shows a setup screen instead of crashing. */
export const firebaseReady = Boolean(config.apiKey && config.projectId && config.appId);

let cachedDb: Firestore | null = null;

export function getDb(): Firestore {
  if (cachedDb) return cachedDb;
  const app: FirebaseApp = getApps()[0] ?? initializeApp(config);
  const db = getFirestore(app);
  // Local development against the Firestore emulator (never set in production).
  const emulatorHost = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST;
  if (emulatorHost) {
    const [host, port] = emulatorHost.split(":");
    connectFirestoreEmulator(db, host, Number(port));
  }
  cachedDb = db;
  return db;
}
