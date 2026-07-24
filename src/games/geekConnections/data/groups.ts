/**
 * Pool de grupos para o Geek Connections. Cada grupo tem um tema e 4 termos.
 * Apenas texto — referências factuais, sem material protegido.
 *
 * IMPORTANTE: os termos devem ser ÚNICOS em todo o pool (nenhum termo aparece
 * em dois grupos), para que a formação de grupos seja sempre não-ambígua.
 */

export interface ConnectionGroup {
  id: string;
  theme: string;
  terms: [string, string, string, string];
}

export const CONNECTION_GROUPS: readonly ConnectionGroup[] = [
  { id: "poke-tipos", theme: "Tipos de Pokémon", terms: ["Fogo", "Água", "Planta", "Elétrico"] },
  { id: "consoles-nintendo", theme: "Consoles Nintendo", terms: ["NES", "SNES", "GameCube", "Wii U"] },
  { id: "consoles-sony", theme: "Consoles PlayStation", terms: ["PS1", "PS2", "PS3", "PS5"] },
  { id: "animes-shounen", theme: "Animes Shounen", terms: ["Naruto", "Bleach", "One Piece", "Dragon Ball"] },
  { id: "personagens-mario", theme: "Universo Mario", terms: ["Luigi", "Peach", "Bowser", "Yoshi"] },
  { id: "golpes", theme: "Golpes de anime", terms: ["Rasengan", "Kamehameha", "Bankai", "Getsuga"] },
  { id: "cdz", theme: "Cavaleiros do Zodíaco", terms: ["Seiya", "Shiryu", "Hyoga", "Shun"] },
  { id: "rpgs", theme: "Franquias de RPG", terms: ["Final Fantasy", "Dragon Quest", "Persona", "Chrono Trigger"] },
  { id: "streamings", theme: "Serviços de streaming", terms: ["Netflix", "Disney+", "Crunchyroll", "Max"] },
  { id: "lotr", theme: "Raças de O Senhor dos Anéis", terms: ["Hobbit", "Elfo", "Anão", "Ent"] },
  { id: "moedas", theme: "Moedas de jogos", terms: ["Rupee", "Zenny", "Gil", "Bell"] },
  { id: "herois-marvel", theme: "Heróis Marvel", terms: ["Homem-Aranha", "Thor", "Hulk", "Pantera Negra"] },
];

const BY_ID: ReadonlyMap<string, ConnectionGroup> = new Map(CONNECTION_GROUPS.map((g) => [g.id, g]));

export function getGroup(id: string): ConnectionGroup | undefined {
  return BY_ID.get(id);
}
