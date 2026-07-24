"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Gamepad2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { signupSchema } from "@/lib/validation";
import { isFirebaseClientConfigured } from "@/lib/firebase/client";
import { getIdToken, mapAuthError, signUp } from "@/lib/firebase/auth";
import { createProfile } from "@/server/actions/auth";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = signupSchema.safeParse({
      username: form.get("username"),
      email: form.get("email"),
      password: form.get("password"),
      confirmPassword: form.get("confirmPassword"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos.");
      return;
    }
    setError(null);

    // Sem credenciais Firebase ainda: segue em modo demo.
    if (!isFirebaseClientConfigured) {
      router.push("/");
      return;
    }

    setBusy(true);
    try {
      const { username, email, password } = parsed.data;
      await signUp(email, password, username);
      const idToken = await getIdToken();
      if (idToken) await createProfile({ idToken, username });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? mapAuthError(err.message) : "Falha ao cadastrar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[70dvh] flex-col justify-center space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white">
          <Gamepad2 aria-hidden />
        </div>
        <h1 className="text-2xl font-bold gd-text">Crie sua conta</h1>
        <p className="text-sm gd-muted">Salve seu progresso, streak e conquistas</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3" noValidate>
        <Input label="Nome de usuário" name="username" autoComplete="username" required />
        <Input label="E-mail" name="email" type="email" autoComplete="email" required />
        <div>
          <Input label="Senha" name="password" type="password" autoComplete="new-password" required />
          <p className="mt-1 text-xs gd-muted">Mínimo de 6 caracteres (aceita letras, números e caracteres especiais).</p>
        </div>
        <Input label="Confirmar Senha" name="confirmPassword" type="password" autoComplete="new-password" required />
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 p-3.5 text-sm text-[var(--color-danger)]">
            <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Cadastrando…" : "Cadastrar"}
        </Button>
      </form>

      <p className="text-center text-sm gd-muted">
        Já tem conta?{" "}
        <Link href="/login" className="text-[var(--color-primary)] font-semibold hover:underline">
          Entrar
        </Link>
      </p>

      <div className="pt-2">
        <div className="relative my-3 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t gd-border" /></div>
          <span className="relative bg-[var(--color-bg)] px-3 text-xs gd-muted uppercase tracking-wider font-medium">ou</span>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="w-full border gd-border shadow-sm font-semibold"
          onClick={() => {
            sessionStorage.setItem("guest_mode", "true");
            router.push("/");
          }}
        >
          Continuar como Visitante
        </Button>
      </div>
    </div>
  );
}
