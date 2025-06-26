
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Helper to clean and validate environment variables
const cleanEnvVar = (value?: string): string => {
    if (!value) return '';
    // Trim whitespace and remove leading/trailing quotes
    return value.trim().replace(/^['"]|['"]$/g, '');
};

const firebaseConfig = {
  apiKey: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
};

const isConfigValid = 
    firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('your-api-key') &&
    firebaseConfig.authDomain && !firebaseConfig.authDomain.includes('your-project-id') &&
    firebaseConfig.projectId && !firebaseConfig.projectId.includes('your-project-id');

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let isFirebaseInitialized = false;

if (isConfigValid) {
    try {
        app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
        isFirebaseInitialized = true; // Set flag only on successful initialization
    } catch (e) {
        console.error("Firebase failed to initialize. This can happen with an invalid config even if it passes initial checks.", e);
        // Reset everything if initialization fails
        app = null;
        auth = null;
        db = null;
        storage = null;
        isFirebaseInitialized = false;
    }
}

export const isFirebaseConfigured = isFirebaseInitialized;
export { app, auth, db, storage };
