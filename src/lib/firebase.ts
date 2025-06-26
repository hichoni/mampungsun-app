
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

// A function to check if the config is valid.
const checkFirebaseConfig = (): boolean => {
    return Object.values(firebaseConfig).every(
        (value) => value && typeof value === 'string' && value.trim() !== '' && !value.includes('your-')
    );
}

const isConfigValid = checkFirebaseConfig();

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isConfigValid) {
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (e) {
    console.error("Firebase initialization failed. This can happen with an invalid project configuration. Please check your .env.local file. Error details:", e);
    // If initialization fails for ANY reason, nullify everything.
    app = null;
    auth = null;
    db = null;
    storage = null;
  }
} else {
    // This console log is helpful for developers running the app locally for the first time.
    console.log("Firebase config is incomplete or invalid. Please check your environment variables.");
}

export { app, auth, db, storage };
