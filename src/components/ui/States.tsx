import { Loader2, AlertTriangle, Inbox } from "lucide-react";

export function LoadingState({ label = "Carregando…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 gd-muted" role="status">
      <Loader2 className="animate-spin" size={28} aria-hidden />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function ErrorState({ message = "Algo deu errado." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16" role="alert">
      <AlertTriangle className="text-[var(--color-danger)]" size={28} aria-hidden />
      <p className="text-sm gd-muted">{message}</p>
    </div>
  );
}

export function EmptyState({ message = "Nada por aqui ainda." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 gd-muted">
      <Inbox size={28} aria-hidden />
      <p className="text-sm">{message}</p>
    </div>
  );
}
