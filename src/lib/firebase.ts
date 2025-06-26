
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

    const placeholderMap: { [key: string]: string } = {
        apiKey: 'your-api-key',
        authDomain: 'your-project-id.firebaseapp.com',
        projectId: 'your-project-id',
        storageBucket: 'your-project-id.appspot.com',
        messagingSenderId: 'your-sender-id',
        appId: 'your-app-id'
    };
    
    // Check each config key-value pair
    for (const key of Object.keys(placeholderMap)) {
        const value = config[key as keyof FirebaseOptions];

        // Rule 1: Value must be a non-empty string.
        if (!value || typeof value !== 'string' || value.trim() === '') {
            return false;
        }

        // Clean the value by trimming whitespace and removing quotes
        let cleanedValue = value.trim();
        if ((cleanedValue.startsWith('"') && cleanedValue.endsWith('"')) || (cleanedValue.startsWith("'") && cleanedValue.endsWith("'"))) {
            cleanedValue = cleanedValue.substring(1, cleanedValue.length - 1).trim();
        }

        // Rule 2: The cleaned value must not be one of the placeholder strings for that specific key.
        if (cleanedValue === placeholderMap[key as keyof typeof placeholderMap]) {
            return false;
        }
    }

    return true;
}

// Initialize Firebase
let app;
if (isFirebaseConfigured()) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} else {
    app = null;
}

const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const storage = app ? getStorage(app) : null;

export { app, auth, db, storage, isFirebaseConfigured };
