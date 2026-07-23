import { Flame, Trophy, Target, TrendingUp, Award, Lock } from "lucide-react";
import { MOCK_USER, MOCK_UNLOCKED_ACHIEVEMENTS } from "@/lib/mock";
import { levelFromXp } from "@/lib/xp";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { ProgressBar } from "@/components/ui/ProgressBar";

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
  const lvl = levelFromXp(MOCK_USER.xp);
  const unlocked = new Set(MOCK_UNLOCKED_ACHIEVEMENTS);

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-2xl font-black text-white">
          {MOCK_USER.username.charAt(0)}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold gd-text">{MOCK_USER.username}</h1>
          <p className="text-sm gd-muted">Nível {lvl.level}</p>
          <ProgressBar
            value={lvl.progress}
            className="mt-1.5"
            label={`${lvl.xpIntoLevel}/${lvl.xpForNextLevel} XP`}
          />
        </div>
      </header>

      <section className="grid grid-cols-2 gap-2.5">
        <Stat icon={<Flame size={20} />} label="Streak atual" value={String(MOCK_USER.currentStreak)} />
        <Stat icon={<TrendingUp size={20} />} label="Maior streak" value={String(MOCK_USER.longestStreak)} />
        <Stat icon={<Trophy size={20} />} label="Pontuação total" value={MOCK_USER.totalScore.toLocaleString("pt-BR")} />
        <Stat icon={<Target size={20} />} label="Partidas" value={String(MOCK_USER.gamesCompleted)} />
      </section>

      <section>
        <h2 className="mb-2 flex items-center gap-2 font-semibold gd-text">
          <Award size={18} aria-hidden /> Conquistas
        </h2>
        <ul className="grid grid-cols-1 gap-2">
          {ACHIEVEMENTS.slice(0, 8).map((a) => {
            const got = unlocked.has(a.id);
            return (
              <li
                key={a.id}
                className={`flex items-center gap-3 rounded-xl border gd-border p-3 ${
                  got ? "gd-surface" : "gd-surface opacity-55"
                }`}
              >
                <div
                  className={`flex size-9 items-center justify-center rounded-lg ${
                    got ? "bg-[var(--color-warning)] text-black/80" : "gd-surface-2 gd-muted"
                  }`}
                >
                  {got ? <Award size={18} aria-hidden /> : <Lock size={16} aria-hidden />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium gd-text">{a.name}</p>
                  <p className="truncate text-xs gd-muted">{a.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
