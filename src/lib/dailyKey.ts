/**
 * Chave do desafio diário e utilidades de fuso horário.
 * A virada do dia acontece à meia-noite no fuso configurado (padrão America/Sao_Paulo).
 *
 * Usamos Intl.DateTimeFormat com formatToParts para obter a data local de forma
 * confiável em qualquer versão do Node (evita bugs de offset manual).
 */

export const DEFAULT_TIMEZONE = "America/Sao_Paulo";

/** Retorna a data local ("YYYY-MM-DD") de um instante num dado fuso. */
export function getDailyKey(instant: Date = new Date(), timeZone: string = DEFAULT_TIMEZONE): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);

  const get = (type: "year" | "month" | "day"): string =>
    parts.find((p) => p.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Diferença em dias-calendário entre duas chaves diárias ("YYYY-MM-DD"). */
export function daysBetweenKeys(fromKey: string, toKey: string): number {
  const from = Date.parse(`${fromKey}T00:00:00Z`);
  const to = Date.parse(`${toKey}T00:00:00Z`);
  if (Number.isNaN(from) || Number.isNaN(to)) {
    throw new Error(`Chave diária inválida: ${fromKey} / ${toKey}`);
  }
  return Math.round((to - from) / 86_400_000);
}

/** Chave do dia anterior a uma dada chave. */
export function previousKey(key: string): string {
  const ts = Date.parse(`${key}T00:00:00Z`);
  return getDailyKey(new Date(ts - 86_400_000), "UTC");
}

/**
 * Chave da semana ISO ("YYYY-Www", semana começando na segunda-feira) para o
 * dia local no fuso dado. Usada no ranking semanal.
 */
export function getWeekKey(instant: Date = new Date(), timeZone: string = DEFAULT_TIMEZONE): string {
  const dayKey = getDailyKey(instant, timeZone);
  // Trabalha em UTC a partir da meia-noite local para evitar drift.
  const d = new Date(`${dayKey}T00:00:00Z`);
  const dayNum = (d.getUTCDay() + 6) % 7; // segunda = 0
  // Quinta-feira da semana atual define o ano ISO.
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const isoYear = d.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(isoYear, 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  const week = 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 86_400_000));
  return `${isoYear}-W${String(week).padStart(2, "0")}`;
}
