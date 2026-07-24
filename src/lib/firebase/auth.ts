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

/**
 * Token de ID atual — enviado ao servidor para autenticar Server Actions.
 * Aguarda a reidratação do estado de auth (`authStateReady`) antes de ler o
 * usuário, para não retornar null logo após um carregamento de página.
 */
export async function getIdToken(): Promise<string | null> {
  const auth = getFirebaseAuth();
  await auth.authStateReady();
  const user = auth.currentUser;
  return user ? user.getIdToken() : null;
}

/** Traduz os códigos de erro mais comuns do Firebase Auth para pt-BR. */
export function mapAuthError(message: string): string {
  if (message.includes("email-already-in-use")) return "Este e-mail já está em uso por outro usuário.";
  if (message.includes("invalid-email")) return "Endereço de e-mail inválido.";
  if (message.includes("weak-password")) return "A senha deve ter no mínimo 6 caracteres.";
  if (
    message.includes("invalid-credential") ||
    message.includes("user-not-found") ||
    message.includes("wrong-password")
  ) {
    return "Conta não encontrada ou senha incorreta. Se você ainda não possui conta, clique em 'Cadastre-se' abaixo.";
  }
  if (message.includes("too-many-requests")) return "Muitas tentativas malsucedidas. Aguarde alguns instantes e tente novamente.";
  return "Não foi possível concluir o acesso. Verifique seus dados e tente novamente.";
}
