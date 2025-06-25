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
    
    // 이 함수는 값이 유효한지(존재하고, 비어있지 않고, 플레이스홀더가 아닌지) 확인합니다.
    const check = (value: string | undefined, placeholder: string) => {
        if (!value || value.trim() === '' || value.trim() === placeholder) {
            return false;
        }
        return true;
    }

    // README.md에 있는 플레이스홀더 값을 기준으로 모든 설정 값을 엄격하게 확인합니다.
    if (!check(config.apiKey, 'your-api-key')) return false;
    if (!check(config.authDomain, 'your-project-id.firebaseapp.com')) return false;
    if (!check(config.projectId, 'your-project-id')) return false;
    if (!check(config.storageBucket, 'your-project-id.appspot.com')) return false;
    if (!check(config.messagingSenderId, 'your-sender-id')) return false;
    if (!check(config.appId, 'your-app-id')) return false;

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
