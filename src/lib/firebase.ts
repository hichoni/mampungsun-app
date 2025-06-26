
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

// New robust check:
// The configuration is considered valid ONLY if all values are present (not empty, not just whitespace)
// AND they do not contain the placeholder keyword 'your-'.
const configValues = Object.values(firebaseConfig);
const isConfigInvalid = configValues.some(value => 
    !value ||             // is falsy (null, undefined, empty string)
    !value.trim() ||      // is only whitespace
    value.includes('your-') // contains a placeholder
);

if (!isConfigInvalid) {
    try {
        app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
        // Mark as initialized ONLY on successful initialization.
        isFirebaseInitialized = true;
    } catch(e) {
        console.error("Firebase initialization failed. Please check your Firebase project configuration in .env.local. It might be invalid.", e);
        // If initialization fails for any reason, ensure the flag is false and services are null.
        isFirebaseInitialized = false;
        app = null;
        auth = null;
        db = null;
        storage = null;
    }
}

export const isFirebaseConfigured = isFirebaseInitialized; 
export { app, auth, db, storage };
