
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
let isFirebaseConfigured: boolean = false;

// This function checks if a config value is a valid, non-placeholder string.
const isValueValid = (value: string | undefined): boolean => {
    // It's invalid if not a string or is empty after trimming.
    if (typeof value !== 'string' || value.trim() === '') {
        return false;
    }
    // It's invalid if it contains a placeholder keyword.
    if (value.includes('your-api-key') || value.includes('your-project-id')) {
        return false;
    }
    return true;
};

// Check if all essential configuration values are provided and valid.
const isConfigProvidedAndValid =
  isValueValid(firebaseConfig.apiKey) &&
  isValueValid(firebaseConfig.authDomain) &&
  isValueValid(firebaseConfig.projectId);

// Attempt to initialize Firebase only if the configuration is provided and valid.
if (isConfigProvidedAndValid) {
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    // Set the flag to true ONLY after a successful initialization.
    isFirebaseConfigured = true;
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    // On failure, ensure everything is null and the flag remains false.
    app = null;
    auth = null;
    db = null;
    storage = null;
    isFirebaseConfigured = false;
  }
}

export { app, auth, db, storage, isFirebaseConfigured };
