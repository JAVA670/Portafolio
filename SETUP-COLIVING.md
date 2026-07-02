# CoHouse (/coliving) — backend setup

The coliving app at `/coliving` syncs in real time through **Firebase Firestore**.
It needs six environment variables. Until they're set, the app shows a
"Backend not connected yet" screen instead of crashing.

## 1. Create the Firebase project (free, ~5 minutes)

1. Go to <https://console.firebase.google.com> and sign in with a Google account.
2. Click **Create a project** → name it anything (e.g. `cohouse`) →
   you can turn Analytics **off** → **Create project**.
3. In the left menu: **Build → Firestore Database** → **Create database** →
   pick the location closest to you → choose **Start in production mode** → **Create**.
4. Open the **Rules** tab of Firestore and replace the contents with:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // MVP: anyone with the app can read/write houses.
       // Lock this down when real authentication is added.
       match /houses/{houseId} {
         allow read, write: if true;
         match /{document=**} {
           allow read, write: if true;
         }
       }
     }
   }
   ```

   Click **Publish**.
5. Go to **Project settings** (gear icon, top left) → scroll to **Your apps** →
   click the **`</>`** (Web) icon → nickname it `cohouse-web` → **Register app**.
6. Firebase shows a `firebaseConfig` code block. Those six values are what you need.

## 2. Set the environment variables

Copy each value from `firebaseConfig` into these variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=            ← apiKey
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=        ← authDomain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=         ← projectId
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=     ← storageBucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=← messagingSenderId
NEXT_PUBLIC_FIREBASE_APP_ID=             ← appId
```

- **Locally:** put them in `.env.local` at the repo root (never committed).
- **On Vercel:** project → **Settings → Environment Variables** → add all six →
  then **Deployments → ⋯ on the latest → Redeploy** so the build picks them up.

## 3. Data model (created automatically by the app)

```
houses/{code}                 { name, createdAt }   ← code doubles as the invite code
  rooms/{id}                  { name, createdAt }
  tenants/{id}                { name, roomId, color, joinedAt }
  chores/{id}                 { title, icon, cadence, createdAt }
  choreLogs/{id}              { choreId, tenantId, action, timestamp }
  supplies/{id}               { name, requestedBy, requestedAt, purchasedBy?, purchasedAt? }
```

No manual schema setup is needed — Firestore creates documents as the app writes them.

## Notes

- The Firebase "API key" is a public client identifier, not a secret; access
  control lives in the Firestore rules above.
- The rules are intentionally open for the MVP (houses are only reachable by
  knowing their 6-character code). Before storing anything sensitive, add
  Firebase Authentication and tighten the rules.
