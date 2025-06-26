import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

// Check if all essential keys are present and are not the placeholder values.
const hasValidConfig =
  firebaseConfig.apiKey &&
  !firebaseConfig.apiKey.includes("your-api-key") &&
  firebaseConfig.authDomain &&
  !firebaseConfig.authDomain.includes("your-project-id") &&
  firebaseConfig.projectId &&
  !firebaseConfig.projectId.includes("your-project-id");

// This flag is for UI components to show a warning if the config is invalid.
const isFirebaseConfigured = hasValidConfig;

if (hasValidConfig) {
  try {
    // Initialize Firebase only if the config is valid.
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    // If initialization fails, ensure all exports are null to prevent usage.
    app = null;
    auth = null;
    db = null;
    storage = null;
  }
}

export { app, auth, db, storage, isFirebaseConfigured };
