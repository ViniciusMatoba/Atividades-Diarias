import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth as adminGetAuth, type Auth } from "firebase-admin/auth";
import { getFirestore as adminGetFirestore, type Firestore } from "firebase-admin/firestore";

/**
 * Firebase Admin SDK (SERVIDOR). Detém privilégios — usado em Server Actions
 * para escrever pontuação oficial, streak e conquistas (autoridade do servidor).
 *
 * Credenciais via env (nunca commitadas):
 *  - FIREBASE_PROJECT_ID
 *  - FIREBASE_CLIENT_EMAIL
 *  - FIREBASE_PRIVATE_KEY  (com \n escapados; substituímos por quebras reais)
 */
function readServiceAccount() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) return null;
  return { projectId, clientEmail, privateKey };
}

/** True quando as credenciais de admin estão presentes. */
export const isFirebaseAdminConfigured = readServiceAccount() !== null;

let cachedApp: App | null = null;

function getAdminApp(): App {
  const sa = readServiceAccount();
  if (!sa) {
    throw new Error(
      "Firebase Admin não configurado. Defina FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY.",
    );
  }
  if (cachedApp) return cachedApp;
  cachedApp = getApps().length
    ? getApps()[0]!
    : initializeApp({
        credential: cert({
          projectId: sa.projectId,
          clientEmail: sa.clientEmail,
          privateKey: sa.privateKey,
        }),
      });
  return cachedApp;
}

export function getAdminDb(): Firestore {
  return adminGetFirestore(getAdminApp());
}

export function getAdminAuth(): Auth {
  return adminGetAuth(getAdminApp());
}
