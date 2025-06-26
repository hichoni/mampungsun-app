
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

    const placeholderMap: { [key: string]: string } = {
        apiKey: 'your-api-key',
        authDomain: 'your-project-id.firebaseapp.com',
        projectId: 'your-project-id',
        storageBucket: 'your-project-id.appspot.com',
        messagingSenderId: 'your-sender-id',
        appId: 'your-app-id'
    };

    return Object.keys(placeholderMap).every(key => {
        const value = config[key as keyof FirebaseOptions];
        if (typeof value !== 'string') {
            return false;
        }

        // Trim whitespace, then remove surrounding single or double quotes.
        const cleanedValue = value.trim().replace(/^["']|["']$/g, '');
        
        // If the cleaned value is empty or matches the placeholder, the config is invalid.
        if (cleanedValue === '' || cleanedValue === placeholderMap[key as keyof typeof placeholderMap]) {
            return false;
        }

        return true;
    });
}

// Initialize Firebase
let app;
try {
    if (isFirebaseConfigured()) {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    } else {
        app = null;
    }
} catch (e) {
    console.error("Firebase initialization failed:", e)
    app = null;
}


const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const storage = app ? getStorage(app) : null;

export { app, auth, db, storage, isFirebaseConfigured };
