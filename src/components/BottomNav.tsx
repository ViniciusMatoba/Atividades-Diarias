"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Swords, Users, Trophy, User, Sparkles } from "lucide-react";

import { useAuthCtx } from "@/lib/firebase/AuthProvider";

const ITEMS = [
  { href: "/", label: "Início", icon: Home },
  { href: "/journey", label: "Jogos", icon: Swords },
  { href: "/friends", label: "Amigos", icon: Users },
  { href: "/discoveries", label: "Coleção", icon: Sparkles },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/profile", label: "Perfil", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuthCtx();
  const isGuest = typeof window !== "undefined" && sessionStorage.getItem("guest_mode") === "true";

  // Esconde o menu inferior em telas de login/cadastro ou antes de o usuário estar logado/visitante
  if (pathname === "/login" || pathname === "/signup" || (!user && !isGuest)) {
    return null;
  }
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t gd-border gd-surface/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-md items-stretch justify-between px-2">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] transition-colors ${
                active ? "text-[var(--color-primary)]" : "gd-muted"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={20} aria-hidden />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
