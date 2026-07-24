import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Firebase Web SDK (cliente). Usa variáveis NEXT_PUBLIC_* (seguras para o browser).
 * Auth é usada no cliente; escritas privilegiadas passam pelo servidor (admin).
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyD1dnb1KP42_CC6pz2KwGJpXX_onTFRVAs",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "atividades-diarias-55f5d.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "atividades-diarias-55f5d",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "atividades-diarias-55f5d.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "966760327202",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:966760327202:web:317cacb8c5d7f7993f027b",
};

/** True quando as variáveis mínimas do cliente estão presentes. */
export const isFirebaseClientConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseClientConfigured) {
    throw new Error(
      "Firebase (cliente) não configurado. Preencha as variáveis NEXT_PUBLIC_FIREBASE_* no .env.",
    );
  }
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function getDb(): Firestore {
  return getFirestore(getFirebaseApp());
}
