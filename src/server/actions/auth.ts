"use server";

/**
 * Server Actions de autenticação/perfil.
 * O registro em si (Firebase Auth) roda no cliente; aqui o SERVIDOR valida o
 * token e cria o perfil no Firestore — nenhuma escrita de perfil parte do browser.
 */
import { getAdminAuth, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { ensureProfile } from "@/server/repo/firestore";
import { z } from "zod";

const createProfileSchema = z.object({
  idToken: z.string().min(1),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/),
});

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/** Verifica o ID token e materializa o perfil do usuário autenticado. */
export async function createProfile(input: unknown): Promise<ActionResult> {
  if (!isFirebaseAdminConfigured) {
    // Dev sem credenciais: nada a persistir.
    return { ok: true };
  }
  const parsed = createProfileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Dados inválidos." };

  try {
    const decoded = await getAdminAuth().verifyIdToken(parsed.data.idToken);
    await ensureProfile(decoded.uid, parsed.data.username);
    return { ok: true };
  } catch {
    return { ok: false, error: "Falha ao validar a sessão." };
  }
}
