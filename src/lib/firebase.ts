
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

// This is the single source of truth for whether the config is valid.
// A config value is invalid if it's missing, empty, or contains a placeholder.
const isConfigValid = 
    !!firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('your-api-key') &&
    !!firebaseConfig.authDomain && !firebaseConfig.authDomain.includes('your-project-id') &&
    !!firebaseConfig.projectId && !firebaseConfig.projectId.includes('your-project-id');


// We only initialize if the config is valid.
if (isConfigValid) {
    try {
        app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
    } catch (e) {
        console.error("Firebase failed to initialize. This can happen with an invalid config even if it passes initial checks.", e);
        // If it fails here, we reset everything.
        app = null;
        auth = null;
        db = null;
        storage = null;
    }
}

// isFirebaseConfigured is true ONLY if initialization was attempted AND successful.
const isFirebaseConfigured = !!(isConfigValid && app && auth && db);

export { app, auth, db, storage, isFirebaseConfigured };
