
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Helper function to clean environment variables by trimming whitespace and removing quotes.
const cleanEnvVar = (variable: string | undefined): string => {
  if (!variable) return '';
  return variable.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
};

const cleanedFirebaseConfig = {
  apiKey: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
};

// A robust check to see if the cleaned config values are present AND are not the placeholder values.
const isFirebaseConfigured =
  !!cleanedFirebaseConfig.apiKey && cleanedFirebaseConfig.apiKey !== 'your-api-key' &&
  !!cleanedFirebaseConfig.authDomain && cleanedFirebaseConfig.authDomain !== 'your-project-id.firebaseapp.com' &&
  !!cleanedFirebaseConfig.projectId && cleanedFirebaseConfig.projectId !== 'your-project-id';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  // Use the cleaned config for initialization
  app = getApps().length ? getApp() : initializeApp(cleanedFirebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage, isFirebaseConfigured };
