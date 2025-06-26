
import { initializeApp, getApps, getApp, FirebaseOptions, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Helper to clean environment variables, removing whitespace and surrounding quotes
function cleanEnvVar(value: string | undefined): string {
    if (!value) return '';
    let cleaned = value.trim();
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.slice(1, -1);
    }
    return cleaned;
}

const cleanedConfig = {
  apiKey: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
};

const placeholderConfig = {
    apiKey: 'your-api-key',
    authDomain: 'your-project-id.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-project-id.appspot.com',
    messagingSenderId: 'your-sender-id',
    appId: 'your-app-id'
};

// A value is valid if it exists and is NOT the placeholder value.
// We check the three most critical values for the app to function.
const isConfigured = 
    !!cleanedConfig.apiKey && cleanedConfig.apiKey !== placeholderConfig.apiKey &&
    !!cleanedConfig.authDomain && cleanedConfig.authDomain !== placeholderConfig.authDomain &&
    !!cleanedConfig.projectId && cleanedConfig.projectId !== placeholderConfig.projectId;


let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

// Only attempt to initialize Firebase if the configuration is valid.
if (isConfigured) {
    try {
        app = !getApps().length ? initializeApp(cleanedConfig) : getApp();
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
    } catch (e) {
        console.error("Firebase initialization failed:", e);
        // If it still fails, something is fundamentally wrong with the values.
        // Ensure services are null.
        app = null;
        auth = null;
        db = null;
        storage = null;
    }
}

// Export a single, reliable flag for UI components to use.
export const isFirebaseConfigured = isConfigured && app !== null;

export { app, auth, db, storage };
