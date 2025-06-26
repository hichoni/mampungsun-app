
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
    // A robust check to ensure all necessary Firebase config values are present.
    // It verifies that each essential key has a non-empty, non-placeholder value.
    const config = firebaseConfig;
    
    // This is the most reliable check: are the values defined and not empty strings?
    // This avoids all the complex placeholder guessing that caused previous issues.
    return !!(
        config.apiKey &&
        config.authDomain &&
        config.projectId &&
        config.storageBucket &&
        config.messagingSenderId &&
        config.appId
    );
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
