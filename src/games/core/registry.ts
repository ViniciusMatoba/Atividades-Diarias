import type { AnyGameModule, GameId, GameMeta } from "./types";
import { mysteryCountry } from "../mysteryCountry";
import { whoCameFirst } from "../whoCameFirst";

/**
 * Registry central de módulos de jogo.
 * Adicionar um jogo = criar `games/<id>/` e registrar aqui. Nenhuma outra
 * parte do app precisa mudar.
 *
 * Jogos ainda não implementados aparecem em `GAME_CATALOG` (metadados p/ UI)
 * mas não têm módulo de lógica jogável — a jornada os mostra como "em breve".
 */
const modules: Partial<Record<GameId, AnyGameModule>> = {
  "mystery-country": mysteryCountry,
  "who-came-first": whoCameFirst,
};

/** Metadados de todos os 5 jogos do MVP (mesmo os ainda não jogáveis). */
export const GAME_CATALOG: readonly GameMeta[] = [
  mysteryCountry.meta,
  {
    id: "world-pin",
    name: "Pin do Mundo",
    description: "Aponte no mapa onde fica o país.",
    icon: "MapPin",
    theme: "geo",
    order: 2,
  },
  {
    id: "poke-guess",
    name: "PokéGuess",
    description: "Descubra o Pokémon comparando atributos.",
    icon: "Sparkles",
    theme: "pokemon",
    order: 3,
  },
  {
    id: "geek-connections",
    name: "Geek Connections",
    description: "Agrupe 16 termos em 4 conexões.",
    icon: "Grid3x3",
    theme: "geek",
    order: 4,
  },
  whoCameFirst.meta,
];

export function getGameModule(id: GameId): AnyGameModule | undefined {
  return modules[id];
}

export function isPlayable(id: GameId): boolean {
  return modules[id] !== undefined;
}

export function getGameMeta(id: GameId): GameMeta | undefined {
  return GAME_CATALOG.find((g) => g.id === id);
}
