
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

let isFirebaseInitialized = false;

// A robust check to see if the Firebase config is valid.
// It checks for two things:
// 1. Are any of the required values missing (falsy)?
const hasMissingValues = Object.values(firebaseConfig).some((value) => !value);
// 2. Do any of the values contain the placeholder "your-"?
const hasPlaceholderValues = JSON.stringify(firebaseConfig).includes('your-');

const configIsInvalid = hasMissingValues || hasPlaceholderValues;

// Initialize Firebase only if the config is NOT invalid.
if (!configIsInvalid) {
    try {
        app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
        // Mark as initialized ONLY on success.
        isFirebaseInitialized = true;
    } catch(e) {
        console.error("Firebase initialization failed. Please check your Firebase project configuration in .env.local. It might be invalid.", e);
        // If initialization fails for any reason, ensure the flag is false.
        isFirebaseInitialized = false;
        app = null;
        auth = null;
        db = null;
        storage = null;
    }
} else {
    // If config is invalid from the start, ensure the flag is false.
    isFirebaseInitialized = false;
}

export const isFirebaseConfigured = isFirebaseInitialized; 
export { app, auth, db, storage };
