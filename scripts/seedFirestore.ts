/**
 * Seed do Firestore para desenvolvimento (catálogo de jogos e conquistas).
 * Requer as credenciais de ADMIN no .env (FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY).
 *
 * Executar: npm run seed
 *
 * Usuários de exemplo NÃO são criados aqui — contas nascem via Firebase Auth
 * (tela de cadastro) e o perfil é materializado pela Server Action createProfile.
 */
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { GAME_CATALOG } from "../src/games/core/registry";
import { ACHIEVEMENTS } from "../src/lib/achievements";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("Faltam credenciais de admin no .env (FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY).");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}
const db = getFirestore();

async function main() {
  const batch = db.batch();

  for (const g of GAME_CATALOG) {
    batch.set(db.collection("games").doc(g.id), {
      name: g.name,
      description: g.description,
      theme: g.theme,
      order: g.order,
    });
  }

  for (const a of ACHIEVEMENTS) {
    batch.set(db.collection("achievements").doc(a.id), {
      name: a.name,
      description: a.description,
      icon: a.icon,
    });
  }

  await batch.commit();
  console.log(`Seed concluído: ${GAME_CATALOG.length} jogos e ${ACHIEVEMENTS.length} conquistas.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
