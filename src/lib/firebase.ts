
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
    
    // Helper to check if a value is unconfigured (undefined, null, empty, or just whitespace)
    const isValueUnconfigured = (value: string | undefined): boolean => {
        return !value || value.trim() === '';
    };
    
    // Check if any required config value is missing.
    if (
        isValueUnconfigured(config.apiKey) ||
        isValueUnconfigured(config.authDomain) ||
        isValueUnconfigured(config.projectId) ||
        isValueUnconfigured(config.storageBucket) ||
        isValueUnconfigured(config.messagingSenderId) ||
        isValueUnconfigured(config.appId)
    ) {
        return false;
    }

    // Check if any config value still contains a placeholder keyword.
    // This is more robust than checking for exact matches.
    if (
        config.apiKey!.includes('your-api-key') ||
        config.authDomain!.includes('your-project-id') ||
        config.projectId!.includes('your-project-id') ||
        config.storageBucket!.includes('your-project-id') ||
        config.messagingSenderId!.includes('your-sender-id') ||
        config.appId!.includes('your-app-id')
    ) {
        return false;
    }

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
