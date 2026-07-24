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

// A validação de estado/palpite de cada jogo vive no próprio módulo
// (parseState/parseGuess) e é usada pela Server Action genérica submitGuess.
