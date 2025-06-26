
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
    
    // Helper to check if a value is still a placeholder.
    // It handles trimming and removes potential quotes.
    const isPlaceholder = (value: string | undefined, placeholder: string): boolean => {
        if (!value) {
            return true; // Value is missing
        }
        let processedValue = value.trim();
        // Remove quotes if they exist at both ends
        if ((processedValue.startsWith('"') && processedValue.endsWith('"')) || (processedValue.startsWith("'") && processedValue.endsWith("'"))) {
            processedValue = processedValue.substring(1, processedValue.length - 1);
        }
        
        // If after all processing the value is empty, it's not configured.
        if (!processedValue) {
            return true;
        }

        // Return true only if it's the exact placeholder.
        return processedValue === placeholder;
    };
    
    // Check if any config value is still a placeholder.
    if (
        isPlaceholder(config.apiKey, 'your-api-key') ||
        isPlaceholder(config.authDomain, 'your-project-id.firebaseapp.com') ||
        isPlaceholder(config.projectId, 'your-project-id') ||
        isPlaceholder(config.storageBucket, 'your-project-id.appspot.com') ||
        isPlaceholder(config.messagingSenderId, 'your-sender-id') ||
        isPlaceholder(config.appId, 'your-app-id')
    ) {
        return false;
    }

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
