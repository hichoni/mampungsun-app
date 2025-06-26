
import { initializeApp, getApps, getApp, FirebaseOptions, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Helper function to trim spaces and quotes from env vars
const cleanEnvVar = (value?: string): string => {
  if (!value) return '';
  let cleaned = value.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.substring(1, cleaned.length - 1);
  }
  return cleaned;
};

const apiKey = cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
const authDomain = cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
const projectId = cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
const storageBucket = cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
const messagingSenderId = cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID);
const appId = cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_APP_ID);

const firebaseConfig: FirebaseOptions = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
};

function isFirebaseConfigured() {
    // This check is now robust. It compares the cleaned values against placeholders.
    return (
        apiKey && apiKey !== 'your-api-key' &&
        authDomain && authDomain !== 'your-project-id.firebaseapp.com' &&
        projectId && projectId !== 'your-project-id' &&
        storageBucket && storageBucket !== 'your-project-id.appspot.com' &&
        messagingSenderId && messagingSenderId !== 'your-sender-id' &&
        appId && appId !== 'your-app-id'
    );
}

// Initialize Firebase
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

// We only attempt to initialize if the config is valid.
if (isFirebaseConfigured()) {
    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
    } catch (e) {
        console.error("Firebase initialization failed:", e)
        app = null;
        auth = null;
        db = null;
        storage = null;
    }
}

export { app, auth, db, storage, isFirebaseConfigured };
