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

// A robust check for valid configuration values.
// It cleans the input and checks against known placeholder values.
const isValueValid = (value: string | undefined, placeholder: string): boolean => {
    if (typeof value !== 'string') {
        return false; // Not a string
    }
    const trimmedValue = value.trim().replace(/^['"]|['"]$/g, ''); // Trim whitespace and quotes
    if (trimmedValue === '') {
        return false; // Is empty
    }
    if (trimmedValue === placeholder) {
        return false; // Is a placeholder
    }
    return true;
};

// isFirebaseConfigured is true ONLY if the essential values are valid.
const isFirebaseConfigured =
  isValueValid(firebaseConfig.apiKey, 'your-api-key') &&
  isValueValid(firebaseConfig.authDomain, 'your-project-id.firebaseapp.com') &&
  isValueValid(firebaseConfig.projectId, 'your-project-id');

if (isFirebaseConfigured) {
  try {
    // Initialize Firebase ONLY if config is valid.
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.error("Firebase initialization failed despite valid-looking config:", error);
    // If initialization still fails, ensure all exports are null.
    app = null;
    auth = null;
    db = null;
    storage = null;
  }
}

export { app, auth, db, storage, isFirebaseConfigured };
