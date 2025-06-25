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
    const config = firebaseConfig;
    
    // Check for placeholder values from the README, trimming whitespace.
    const apiKey = config.apiKey?.trim();
    if (!apiKey || apiKey === 'your-api-key') return false;

    const authDomain = config.authDomain?.trim();
    if (!authDomain || authDomain === 'your-project-id.firebaseapp.com') return false;

    const projectId = config.projectId?.trim();
    if (!projectId || projectId === 'your-project-id') return false;

    const storageBucket = config.storageBucket?.trim();
    if (!storageBucket || storageBucket === 'your-project-id.appspot.com') return false;
    
    const messagingSenderId = config.messagingSenderId?.trim();
    if (!messagingSenderId || messagingSenderId === 'your-sender-id') return false;

    const appId = config.appId?.trim();
    if (!appId || appId === 'your-app-id') return false;

    return true;
}

// Initialize Firebase
let app;
if (!getApps().length) {
    if (!isFirebaseConfigured()) {
        console.warn("Firebase config is not set or contains placeholder values. Please check your .env.local file. Firebase services will not be initialized.");
        app = null;
    } else {
        app = initializeApp(firebaseConfig);
    }
} else {
    app = getApp();
}

const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const storage = app ? getStorage(app) : null;

export { app, auth, db, storage, isFirebaseConfigured };
