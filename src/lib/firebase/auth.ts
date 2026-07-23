"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "./client";

/**
 * Helpers de autenticação (Firebase Auth, e-mail/senha) para o cliente.
 * A criação do perfil no Firestore acontece no servidor (após o registro),
 * mantendo a autoridade das escritas fora do browser.
 */

export async function signUp(email: string, password: string, username: string): Promise<User> {
  const auth = getFirebaseAuth();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: username });
  return cred.user;
}

export async function signIn(email: string, password: string): Promise<User> {
  const auth = getFirebaseAuth();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signOut(): Promise<void> {
  await fbSignOut(getFirebaseAuth());
}

/** Token de ID atual — enviado ao servidor para autenticar Server Actions. */
export async function getIdToken(): Promise<string | null> {
  const user = getFirebaseAuth().currentUser;
  return user ? user.getIdToken() : null;
}

/** Traduz os códigos de erro mais comuns do Firebase Auth para pt-BR. */
export function mapAuthError(message: string): string {
  if (message.includes("email-already-in-use")) return "Este e-mail já está em uso.";
  if (message.includes("invalid-email")) return "E-mail inválido.";
  if (message.includes("weak-password")) return "Senha muito fraca (mín. 6 caracteres).";
  if (message.includes("invalid-credential") || message.includes("wrong-password"))
    return "E-mail ou senha incorretos.";
  if (message.includes("user-not-found")) return "Conta não encontrada.";
  if (message.includes("too-many-requests")) return "Muitas tentativas. Tente mais tarde.";
  return "Não foi possível concluir. Tente novamente.";
}
