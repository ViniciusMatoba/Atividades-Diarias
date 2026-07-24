"use client";

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { previousKey } from "@/lib/dailyKey";

interface Props {
  currentDateKey: string;
  todayKey: string;
  onSelectDate: (key: string) => void;
}

export function HistoryCalendar({ currentDateKey, todayKey, onSelectDate }: Props) {
  const isToday = currentDateKey === todayKey;

  function handlePrev() {
    onSelectDate(previousKey(currentDateKey));
  }

  function handleNext() {
    if (isToday) return;
    // Adiciona 1 dia
    const ts = Date.parse(`${currentDateKey}T00:00:00Z`) + 86_400_000;
    const nextStr = new Date(ts).toISOString().slice(0, 10);
    onSelectDate(nextStr);
  }

  return (
    <div className="flex items-center justify-between rounded-xl border gd-border gd-surface-2 px-3 py-2 text-xs">
      <button onClick={handlePrev} className="flex items-center gap-1 font-bold text-[var(--color-primary)] hover:underline">
        <ChevronLeft size={16} /> Dia anterior
      </button>

      <div className="flex items-center gap-1.5 font-extrabold gd-text">
        <Calendar size={15} className="text-[var(--color-primary)]" />
        <span>{currentDateKey}</span>
        {isToday && <span className="rounded bg-[var(--color-primary)]/20 px-1.5 py-0.5 text-[10px] text-[var(--color-primary)]">Hoje</span>}
      </div>

      <button
        onClick={handleNext}
        disabled={isToday}
        className={`flex items-center gap-1 font-bold ${
          isToday ? "gd-muted opacity-30 cursor-not-allowed" : "text-[var(--color-primary)] hover:underline"
        }`}
      >
        Próximo dia <ChevronRight size={16} />
      </button>
    </div>
  );
}
