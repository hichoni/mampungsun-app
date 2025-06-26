
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
    
    // This is a simplified and more robust check.
    // It verifies that all necessary Firebase config values are present and are non-empty strings.
    // It avoids complex logic for detecting placeholders which was causing issues with valid configurations.
    const requiredKeys: (keyof FirebaseOptions)[] = [
        'apiKey',
        'authDomain',
        'projectId',
        'storageBucket',
        'messagingSenderId',
        'appId',
    ];

    return requiredKeys.every(key => {
        const value = config[key];
        return typeof value === 'string' && value.length > 0;
    });
}

// Initialize Firebase
let app;
try {
    if (isFirebaseConfigured()) {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    } else {
        app = null;
    }
} catch (e) {
    console.error("Firebase initialization failed:", e)
    app = null;
}


const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const storage = app ? getStorage(app) : null;

export { app, auth, db, storage, isFirebaseConfigured };
