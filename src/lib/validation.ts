import { z } from "zod";

/** Schemas Zod de entradas externas. Validados no servidor antes de qualquer efeito. */

export const signupSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(2, "Nome de usuário precisa ter no mínimo 2 caracteres.")
      .max(30, "Nome de usuário muito longo."),
    email: z.string().email("Endereço de e-mail inválido."),
    password: z.string().min(6, "A senha precisa ter no mínimo 6 caracteres."),
    confirmPassword: z.string().min(1, "Confirme a sua senha."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas digitadas não coincidem.",
    path: ["confirmPassword"],
  });
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email("Endereço de e-mail inválido."),
  password: z.string().min(6, "A senha precisa ter no mínimo 6 caracteres."),
});
export type LoginInput = z.infer<typeof loginSchema>;

// A validação de estado/palpite de cada jogo vive no próprio módulo
// (parseState/parseGuess) e é usada pela Server Action genérica submitGuess.
