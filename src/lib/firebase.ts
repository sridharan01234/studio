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

// Singleton instance of Firestore
let db: Firestore | undefined = undefined;

function initializeFirebase(): Firestore {
  console.log("Attempting to initialize Firebase...");

  const missingKeys = Object.entries(firebaseConfig)
    .filter(([, value]) => !value || String(value).includes('YOUR_'))
    .map(([key]) => key.replace('NEXT_PUBLIC_FIREBASE_', ''));

  if (missingKeys.length > 0) {
    throw new Error(
      `Firebase config is incomplete. Missing or placeholder values for: ${missingKeys.join(
        ', '
      )}. Please check your .env file and restart the server.`
    );
  }
  
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  console.log('--- Firebase Initialized Successfully ---');
  console.log('Project ID:', firebaseConfig.projectId);
  console.log('------------------------------------');
  return getFirestore(app);
}

// This function will be the single source of truth for getting the database instance.
export function getDb(): Firestore {
  if (!db) {
    try {
        db = initializeFirebase();
    } catch(e) {
        console.error('--- Firebase Initialization Failed ---');
        // rethrow to be caught by services
        throw e;
    }
  }
  return db;
}
