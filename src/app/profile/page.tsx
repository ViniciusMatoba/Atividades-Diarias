"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flame, Trophy, Target, TrendingUp, Award, Lock, LogOut, LogIn } from "lucide-react";
import { levelFromXp } from "@/lib/xp";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { effectiveCurrentStreak } from "@/lib/streak";
import { getDailyKey } from "@/lib/dailyKey";
import { useAuthCtx } from "@/lib/firebase/AuthProvider";
import { signOut } from "@/lib/firebase/auth";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/States";

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border gd-border gd-surface p-3">
      <div className="gd-muted">{icon}</div>
      <div>
        <p className="text-lg font-bold gd-text">{value}</p>
        <p className="text-[11px] gd-muted">{label}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading } = useAuthCtx();

  if (loading) return <LoadingState label="Carregando perfil…" />;

  if (!user) {
    return (
      <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl gd-surface-2">
          <LogIn className="gd-muted" aria-hidden />
        </div>
        <div>
          <h1 className="text-xl font-bold gd-text">Você não está logado</h1>
          <p className="text-sm gd-muted">Entre para ver seu perfil, streak e conquistas.</p>
        </div>
        <Link href="/login">
          <Button size="lg">Entrar</Button>
        </Link>
      </div>
    );
  }

  const username = profile?.username ?? user.displayName ?? "Jogador";
  const xp = profile?.xp ?? 0;
  const lvl = levelFromXp(xp);
  const streak = profile
    ? effectiveCurrentStreak(
        { current: profile.currentStreak, longest: profile.longestStreak, lastCompletedKey: profile.lastCompletedKey },
        getDailyKey(),
      )
    : 0;

  async function onLogout() {
    await signOut();
    router.push("/");
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-2xl font-black text-white">
          {username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold gd-text">{username}</h1>
          <p className="text-sm gd-muted">Nível {lvl.level}</p>
          <ProgressBar value={lvl.progress} className="mt-1.5" label={`${lvl.xpIntoLevel}/${lvl.xpForNextLevel} XP`} />
        </div>
      </header>

      <section className="grid grid-cols-2 gap-2.5">
        <Stat icon={<Flame size={20} />} label="Streak atual" value={String(streak)} />
        <Stat icon={<TrendingUp size={20} />} label="Maior streak" value={String(profile?.longestStreak ?? 0)} />
        <Stat
          icon={<Trophy size={20} />}
          label="Pontuação total"
          value={(profile?.totalScore ?? 0).toLocaleString("pt-BR")}
        />
        <Stat icon={<Target size={20} />} label="Partidas" value={String(profile?.gamesCompleted ?? 0)} />
      </section>

      <section>
        <h2 className="mb-2 flex items-center gap-2 font-semibold gd-text">
          <Award size={18} aria-hidden /> Conquistas
        </h2>
        <ul className="grid grid-cols-1 gap-2">
          {ACHIEVEMENTS.slice(0, 8).map((a) => (
            <li key={a.id} className="flex items-center gap-3 rounded-xl border gd-border gd-surface p-3 opacity-55">
              <div className="flex size-9 items-center justify-center rounded-lg gd-surface-2 gd-muted">
                <Lock size={16} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium gd-text">{a.name}</p>
                <p className="truncate text-xs gd-muted">{a.description}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-center text-xs gd-muted">
          Conquistas são desbloqueadas conforme você joga (persistência na Fase 6).
        </p>
      </section>

      <Button variant="ghost" onClick={onLogout} className="w-full">
        <LogOut size={16} aria-hidden /> Sair
      </Button>
    </div>
  );
}
