
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

// This flag will be true ONLY if the configuration is valid AND initialization succeeds.
let isFirebaseInitialized = false;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

// Check for presence of essential keys and ensure they are not placeholder values.
const configIsInvalid = 
    !firebaseConfig.apiKey || firebaseConfig.apiKey.includes('your-api-key') ||
    !firebaseConfig.authDomain || firebaseConfig.authDomain.includes('your-project-id') ||
    !firebaseConfig.projectId || firebaseConfig.projectId.includes('your-project-id');


// Initialize Firebase only if the config is valid.
if (!configIsInvalid) {
    try {
        app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
        isFirebaseInitialized = true; // Mark as initialized ONLY on success.
    } catch(e) {
        console.error("Firebase initialization failed. Please check your Firebase project configuration in .env.local. It might be invalid.", e);
        // If initialization fails for any reason, ensure the flag is false.
        isFirebaseInitialized = false;
        app = null;
        auth = null;
        db = null;
        storage = null;
    }
}

export const isFirebaseConfigured = isFirebaseInitialized; 
export { app, auth, db, storage };
