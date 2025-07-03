import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let firebaseInitializationError: string | null = null;

const configValues = Object.values(firebaseConfig);
const missingKeys = Object.keys(firebaseConfig).filter((key, i) => !configValues[i] || String(configValues[i]).includes('YOUR_'));

if (missingKeys.length > 0) {
  const errorMessage = `Firebase config is incomplete. Missing or placeholder values for: ${missingKeys.map(k => k.replace('NEXT_PUBLIC_', '')).join(', ')}. Please check your .env file.`;
  firebaseInitializationError = errorMessage;
  console.log(errorMessage);
} else {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
  } catch (e: any) {
    firebaseInitializationError = `Failed to initialize Firebase: ${e.message}`;
    console.error(firebaseInitializationError, e);
  }
}

export { db, firebaseInitializationError };
