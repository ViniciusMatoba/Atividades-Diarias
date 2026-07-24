/**
 * Países com centroide aproximado (lat/lon) para o Pin do Mundo.
 * Dados factuais aproximados — a coordenada da resposta fica só no servidor.
 */

export interface PinCountry {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export const PIN_COUNTRIES: readonly PinCountry[] = [
  { id: "brasil", name: "Brasil", lat: -10, lon: -55 },
  { id: "argentina", name: "Argentina", lat: -34, lon: -64 },
  { id: "chile", name: "Chile", lat: -35, lon: -71 },
  { id: "peru", name: "Peru", lat: -10, lon: -76 },
  { id: "colombia", name: "Colômbia", lat: 4, lon: -73 },
  { id: "venezuela", name: "Venezuela", lat: 7, lon: -66 },
  { id: "estados-unidos", name: "Estados Unidos", lat: 39, lon: -98 },
  { id: "mexico", name: "México", lat: 23, lon: -102 },
  { id: "canada", name: "Canadá", lat: 56, lon: -106 },
  { id: "portugal", name: "Portugal", lat: 39, lon: -8 },
  { id: "espanha", name: "Espanha", lat: 40, lon: -4 },
  { id: "franca", name: "França", lat: 46, lon: 2 },
  { id: "alemanha", name: "Alemanha", lat: 51, lon: 10 },
  { id: "italia", name: "Itália", lat: 42, lon: 12 },
  { id: "reino-unido", name: "Reino Unido", lat: 54, lon: -2 },
  { id: "polonia", name: "Polônia", lat: 52, lon: 19 },
  { id: "russia", name: "Rússia", lat: 61, lon: 90 },
  { id: "egito", name: "Egito", lat: 26, lon: 30 },
  { id: "nigeria", name: "Nigéria", lat: 9, lon: 8 },
  { id: "africa-do-sul", name: "África do Sul", lat: -30, lon: 25 },
  { id: "quenia", name: "Quênia", lat: 0, lon: 38 },
  { id: "china", name: "China", lat: 35, lon: 104 },
  { id: "india", name: "Índia", lat: 21, lon: 78 },
  { id: "japao", name: "Japão", lat: 36, lon: 138 },
  { id: "coreia-do-sul", name: "Coreia do Sul", lat: 36, lon: 128 },
  { id: "australia", name: "Austrália", lat: -25, lon: 133 },
  { id: "nova-zelandia", name: "Nova Zelândia", lat: -42, lon: 172 },
  { id: "indonesia", name: "Indonésia", lat: -2, lon: 118 },
  { id: "arabia-saudita", name: "Arábia Saudita", lat: 24, lon: 45 },
  { id: "turquia", name: "Turquia", lat: 39, lon: 35 },
];

const BY_ID: ReadonlyMap<string, PinCountry> = new Map(PIN_COUNTRIES.map((c) => [c.id, c]));

export function getPinCountry(id: string): PinCountry | undefined {
  return BY_ID.get(id);
}
