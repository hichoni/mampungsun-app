
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
    // This is a simple but robust check. It verifies that all necessary Firebase config 
    // values are present and are not the placeholder values from the README.md file.
    // It uses `.includes()` which correctly detects the placeholder text even if the user
    // accidentally includes quotes in the .env.local file.
    return (
        !!firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('your-api-key') &&
        !!firebaseConfig.authDomain && !firebaseConfig.authDomain.includes('your-project-id') &&
        !!firebaseConfig.projectId && !firebaseConfig.projectId.includes('your-project-id') &&
        !!firebaseConfig.storageBucket && !firebaseConfig.storageBucket.includes('your-project-id') &&
        !!firebaseConfig.messagingSenderId && !firebaseConfig.messagingSenderId.includes('your-sender-id') &&
        !!firebaseConfig.appId && !firebaseConfig.appId.includes('your-app-id')
    );
}

// Initialize Firebase
let app;
try {
    // We only attempt to initialize if the config is valid.
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
