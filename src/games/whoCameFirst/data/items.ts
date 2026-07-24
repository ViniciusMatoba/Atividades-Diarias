/**
 * Base local de itens para "Quem Veio Primeiro?" (ordenação cronológica).
 * Apenas dados textuais (título + ano) — factuais, sem material protegido.
 * O ANO nunca é enviado ao cliente (senão não haveria desafio).
 */

export type ItemCategory = "game" | "console" | "movie" | "anime" | "franchise";

export interface TimelineItem {
  id: string;
  label: string;
  year: number; // ano de lançamento/estreia (aprox.) — SÓ no servidor
  category: ItemCategory;
}

export const ITEMS: readonly TimelineItem[] = [
  { id: "console-nes", label: "Nintendo Entertainment System", year: 1983, category: "console" },
  { id: "console-snes", label: "Super Nintendo (SNES)", year: 1990, category: "console" },
  { id: "console-ps1", label: "PlayStation", year: 1994, category: "console" },
  { id: "console-ps2", label: "PlayStation 2", year: 2000, category: "console" },
  { id: "console-xbox", label: "Xbox", year: 2001, category: "console" },
  { id: "console-wii", label: "Nintendo Wii", year: 2006, category: "console" },
  { id: "console-switch", label: "Nintendo Switch", year: 2017, category: "console" },
  { id: "game-mario", label: "Super Mario Bros.", year: 1985, category: "game" },
  { id: "game-zelda", label: "The Legend of Zelda", year: 1986, category: "game" },
  { id: "game-tetris", label: "Tetris", year: 1984, category: "game" },
  { id: "game-pokemon", label: "Pokémon Red & Green", year: 1996, category: "game" },
  { id: "game-minecraft", label: "Minecraft", year: 2011, category: "game" },
  { id: "game-fortnite", label: "Fortnite", year: 2017, category: "game" },
  { id: "movie-starwars", label: "Star Wars: Uma Nova Esperança", year: 1977, category: "movie" },
  { id: "movie-jurassic", label: "Jurassic Park", year: 1993, category: "movie" },
  { id: "movie-matrix", label: "Matrix", year: 1999, category: "movie" },
  { id: "movie-avengers", label: "Os Vingadores", year: 2012, category: "movie" },
  { id: "anime-dragonball", label: "Dragon Ball (anime)", year: 1986, category: "anime" },
  { id: "anime-onepiece", label: "One Piece (anime)", year: 1999, category: "anime" },
  { id: "anime-naruto", label: "Naruto (anime)", year: 2002, category: "anime" },
];

const BY_ID: ReadonlyMap<string, TimelineItem> = new Map(ITEMS.map((i) => [i.id, i]));

export function getItem(id: string): TimelineItem | undefined {
  return BY_ID.get(id);
}
