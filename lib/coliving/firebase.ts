import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from "firebase/firestore";

/**
 * Firebase web config is public by design (security lives in Firestore rules).
 * All values come from .env.local / Vercel env vars so the repo holds no keys.
 */
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
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
