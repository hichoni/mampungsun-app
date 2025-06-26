import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function isFirebaseConfigured() {
    const config = firebaseConfig;
    
    // List of placeholder substrings that indicate a value is not properly configured.
    const placeholderSubstrings = [
        'your-api-key',
        'your-project-id',
        'your-sender-id',
        'your-app-id'
    ];

    // Helper function to check if a single config value is valid.
    const isValueConfigured = (value: string | undefined): boolean => {
        // 1. Must be a non-empty string.
        if (!value || typeof value !== 'string' || value.trim() === '') {
            return false;
        }

        // 2. Must not contain any of the placeholder substrings.
        for (const placeholder of placeholderSubstrings) {
            if (value.includes(placeholder)) {
                return false;
            }
        }

        // 3. All checks passed.
        return true;
    };

    // Check all required firebase config values.
    if (!isValueConfigured(config.apiKey)) return false;
    if (!isValueConfigured(config.authDomain)) return false;
    if (!isValueConfigured(config.projectId)) return false;
    if (!isValueConfigured(config.storageBucket)) return false;
    if (!isValueConfigured(config.messagingSenderId)) return false;
    if (!isValueConfigured(config.appId)) return false;

    return true;
}

// Initialize Firebase
let app;
if (!getApps().length) {
    if (!isFirebaseConfigured()) {
        console.warn("Firebase config is not set or contains placeholder values. Please check your .env.local file. Firebase services will not be initialized.");
        app = null;
    } else {
        app = initializeApp(firebaseConfig);
    }
} else {
    app = getApp();
}

const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const storage = app ? getStorage(app) : null;

export { app, auth, db, storage, isFirebaseConfigured };
