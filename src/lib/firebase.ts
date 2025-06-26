
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
let _isFirebaseConfigured = false;

// This function defensively initializes Firebase and sets the configuration status.
function initializeFirebase() {
    // 1. Check if all config values are present and are non-empty strings.
    const allKeysPresentAndValid = Object.values(firebaseConfig).every(
      (value) => typeof value === 'string' && value.trim() !== ''
    );
    
    if (!allKeysPresentAndValid) {
        console.error("Firebase config error: Not all environment variables are set or are empty strings in .env.local.");
        return; // Exit early, leaving _isFirebaseConfigured as false.
    }

    // 2. Check for placeholder values from the README.
    const hasPlaceholder = Object.values(firebaseConfig).some((value) =>
      (value as string).includes('your-')
    );

    if (hasPlaceholder) {
        console.error("Firebase config error: Placeholder values found in .env.local. Please replace them with actual Firebase project credentials from your Firebase console.");
        return; // Exit early, leaving _isFirebaseConfigured as false.
    }

    // 3. If all checks pass, try to initialize Firebase.
    try {
        app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
        _isFirebaseConfigured = true; // Set to true ONLY on successful initialization.
    } catch (e) {
        console.error("Firebase initialization failed with an exception. Please check your Firebase project configuration in .env.local as it might be invalid (e.g., malformed project ID).", e);
        // Explicitly nullify everything on error to prevent partial initialization.
        app = null;
        auth = null;
        db = null;
        storage = null;
        _isFirebaseConfigured = false;
    }
}

// Run the initialization logic when this module is imported.
initializeFirebase();

// Export the results. `isFirebaseConfigured` is the single source of truth.
export const isFirebaseConfigured = _isFirebaseConfigured;
export { app, auth, db, storage };
