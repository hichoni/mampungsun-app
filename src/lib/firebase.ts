
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

// A single, reliable flag to determine if Firebase is configured.
const isFirebaseConfigured =
  Object.values(firebaseConfig).every(
    (value) => typeof value === 'string' && value.length > 0 && !value.includes('your-')
  );

if (isFirebaseConfigured) {
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (e) {
    console.error("Firebase initialization failed with an exception. Please check your Firebase project configuration in .env.local as it might be invalid (e.g., malformed project ID).", e);
    // In case of an initialization error, we must ensure nothing is exported as usable.
    app = null;
    auth = null;
    db = null;
    storage = null;
  }
} else {
    // This console.error is helpful for developers running the app locally.
    console.error("Firebase config error: Not all environment variables are set correctly in .env.local. Please check the README.md file for instructions.");
}

// Export the reliable flag and the services.
export { app, auth, db, storage, isFirebaseConfigured };
