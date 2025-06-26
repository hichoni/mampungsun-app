
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

// Helper function to check if a value is a valid config string.
// It must be a non-empty string and not a placeholder.
function isValidConfigValue(value: string | undefined): value is string {
    // Ensure the value is a string and not just whitespace before checking content.
    return typeof value === 'string' && value.trim() !== '' && !value.includes('your-');
}

const allConfigValuesValid =
    isValidConfigValue(firebaseConfig.apiKey) &&
    isValidConfigValue(firebaseConfig.authDomain) &&
    isValidConfigValue(firebaseConfig.projectId) &&
    isValidConfigValue(firebaseConfig.storageBucket) &&
    isValidConfigValue(firebaseConfig.messagingSenderId) &&
    isValidConfigValue(firebaseConfig.appId);


let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (allConfigValuesValid) {
    try {
        app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
    } catch(e) {
        console.error("Firebase initialization failed. Please check your Firebase project configuration in .env.local. It might be invalid.", e);
        // Explicitly nullify on error to ensure isFirebaseConfigured is false.
        app = null;
        auth = null;
        db = null;
        storage = null;
    }
}

// The single source of truth is whether the `app` object was successfully created.
export const isFirebaseConfigured = !!app; 
export { app, auth, db, storage };
