"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { loginSchema } from "@/lib/validation";
import { isFirebaseClientConfigured } from "@/lib/firebase/client";
import { mapAuthError, signIn } from "@/lib/firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse({ email: form.get("email"), password: form.get("password") });
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
      await signIn(parsed.data.email, parsed.data.password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? mapAuthError(err.message) : "Falha ao entrar.");
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
        <h1 className="text-2xl font-bold gd-text">GeekDaily</h1>
        <p className="text-sm gd-muted">Entre para continuar sua jornada</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3" noValidate>
        <Input label="E-mail" name="email" type="email" autoComplete="email" required />
        <Input label="Senha" name="password" type="password" autoComplete="current-password" required />
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Entrando…" : "Entrar"}
        </Button>
      </form>

      <p className="text-center text-sm gd-muted">
        Não tem conta?{" "}
        <Link href="/signup" className="text-[var(--color-primary)]">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
