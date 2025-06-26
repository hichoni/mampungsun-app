
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

    const placeholders = [
        'your-api-key',
        'your-project-id.firebaseapp.com',
        'your-project-id',
        'your-project-id.appspot.com',
        'your-sender-id',
        'your-app-id'
    ];
    
    for (const value of Object.values(config)) {
        // Rule 1: The value must exist and be a string.
        if (!value || typeof value !== 'string') {
            return false;
        }

        // Rule 2: The value, after being cleaned of whitespace and quotes, must not be empty.
        let cleanedValue = value.trim();
        if ((cleanedValue.startsWith('"') && cleanedValue.endsWith('"')) || (cleanedValue.startsWith("'") && cleanedValue.endsWith("'"))) {
            cleanedValue = cleanedValue.substring(1, cleanedValue.length - 1).trim();
        }
        
        if (cleanedValue === '') {
            return false;
        }

        // Rule 3: The cleaned value must not be one of the placeholder strings.
        if (placeholders.includes(cleanedValue)) {
            return false;
        }
    }

    return true;
}

// Initialize Firebase
let app;
if (!getApps().length) {
    if (!isFirebaseConfigured()) {
        console.warn("Firebase config is not set or is incomplete. Please check your .env.local file. Firebase services will not be initialized.");
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
