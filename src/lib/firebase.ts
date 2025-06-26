
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

    const values = [
        config.apiKey,
        config.authDomain,
        config.projectId,
        config.storageBucket,
        config.messagingSenderId,
        config.appId,
    ];

    // 1. Check for falsy values (undefined, null, ''). If any value is missing, it's not configured.
    if (values.some(v => !v)) {
        return false;
    }

    // 2. Check if any value is an exact match for the placeholder strings from the README.
    // This is the safest way to detect an unconfigured state without false positives.
    const placeholders = [
        'your-api-key',
        'your-project-id.firebaseapp.com',
        'your-project-id',
        'your-project-id.appspot.com',
        'your-sender-id',
        'your-app-id'
    ];
    
    // Using Array.prototype.includes for a direct and exact comparison.
    if (
        placeholders.includes(config.apiKey!) ||
        placeholders.includes(config.authDomain!) ||
        placeholders.includes(config.projectId!) ||
        placeholders.includes(config.storageBucket!) ||
        placeholders.includes(config.messagingSenderId!) ||
        placeholders.includes(config.appId!)
    ) {
        return false;
    }

    return true;
}

// Initialize Firebase
let app;
if (!getApps().length) {
    if (!isFirebaseConfigured()) {
        console.warn("Firebase config is not set or is incomplete. Please check your .env.local file. Firebase services will not be initialized.");
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
