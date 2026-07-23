import { z } from "zod";

/** Schemas Zod de entradas externas. Validados no servidor antes de qualquer efeito. */

export const signupSchema = z.object({
  username: z
    .string()
    .min(3, "Nome de usuário precisa de ao menos 3 caracteres.")
    .max(20, "Nome de usuário muito longo.")
    .regex(/^[a-zA-Z0-9_]+$/, "Use apenas letras, números e _."),
  email: z.string().email("E-mail inválido."),
  password: z.string().min(8, "A senha precisa de ao menos 8 caracteres."),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido."),
  password: z.string().min(1, "Informe a senha."),
});
export type LoginInput = z.infer<typeof loginSchema>;

/** Estado serializado do País Misterioso vindo do cliente (não contém a resposta). */
export const mysteryStateSchema = z.object({
  revealedClues: z.number().int().min(1).max(10),
  guesses: z.array(z.string().min(1)).max(6),
  finished: z.boolean(),
  solved: z.boolean(),
});

export const submitMysteryGuessSchema = z.object({
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Chave de data inválida."),
  state: mysteryStateSchema,
  countryId: z.string().min(1),
  mode: z.enum(["daily", "infinite"]).default("daily"),
  /** ID token do Firebase Auth (opcional; presente quando logado). */
  idToken: z.string().min(1).optional(),
});
export type SubmitMysteryGuessInput = z.infer<typeof submitMysteryGuessSchema>;
