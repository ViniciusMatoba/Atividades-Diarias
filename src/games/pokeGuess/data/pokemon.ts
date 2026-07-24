/**
 * Base local de Pokémon (1ª geração / Kanto) para o PokéGuess.
 * Apenas dados TEXTUAIS (referências factuais) — sem sprites/imagens protegidas.
 * Valores aproximados; substituíveis pela PokéAPI depois (a arquitetura permite
 * adicionar outras gerações). `color` segue a cor do Pokédex (aprox.).
 *
 * Atributos comparáveis: tipo1, tipo2, cor, estágio evolutivo, altura, peso.
 * (geração/região são constantes nesta base — reservados p/ gerações futuras.)
 */

export type PokeType =
  | "Normal" | "Fogo" | "Água" | "Planta" | "Elétrico" | "Gelo" | "Lutador"
  | "Venenoso" | "Terrestre" | "Voador" | "Psíquico" | "Inseto" | "Pedra"
  | "Fantasma" | "Dragão";

export type PokeColor =
  | "Vermelho" | "Azul" | "Amarelo" | "Verde" | "Marrom" | "Roxo" | "Rosa"
  | "Cinza" | "Preto" | "Branco";

export interface Pokemon {
  id: string;
  name: string;
  type1: PokeType;
  type2: PokeType | null;
  color: PokeColor;
  stage: 1 | 2 | 3; // estágio evolutivo
  heightM: number;
  weightKg: number;
}

export const POKEMON: readonly Pokemon[] = [
  { id: "bulbasaur", name: "Bulbasaur", type1: "Planta", type2: "Venenoso", color: "Verde", stage: 1, heightM: 0.7, weightKg: 6.9 },
  { id: "ivysaur", name: "Ivysaur", type1: "Planta", type2: "Venenoso", color: "Verde", stage: 2, heightM: 1.0, weightKg: 13.0 },
  { id: "venusaur", name: "Venusaur", type1: "Planta", type2: "Venenoso", color: "Verde", stage: 3, heightM: 2.0, weightKg: 100.0 },
  { id: "charmander", name: "Charmander", type1: "Fogo", type2: null, color: "Vermelho", stage: 1, heightM: 0.6, weightKg: 8.5 },
  { id: "charmeleon", name: "Charmeleon", type1: "Fogo", type2: null, color: "Vermelho", stage: 2, heightM: 1.1, weightKg: 19.0 },
  { id: "charizard", name: "Charizard", type1: "Fogo", type2: "Voador", color: "Vermelho", stage: 3, heightM: 1.7, weightKg: 90.5 },
  { id: "squirtle", name: "Squirtle", type1: "Água", type2: null, color: "Azul", stage: 1, heightM: 0.5, weightKg: 9.0 },
  { id: "wartortle", name: "Wartortle", type1: "Água", type2: null, color: "Azul", stage: 2, heightM: 1.0, weightKg: 22.5 },
  { id: "blastoise", name: "Blastoise", type1: "Água", type2: null, color: "Azul", stage: 3, heightM: 1.6, weightKg: 85.5 },
  { id: "caterpie", name: "Caterpie", type1: "Inseto", type2: null, color: "Verde", stage: 1, heightM: 0.3, weightKg: 2.9 },
  { id: "pidgey", name: "Pidgey", type1: "Normal", type2: "Voador", color: "Marrom", stage: 1, heightM: 0.3, weightKg: 1.8 },
  { id: "rattata", name: "Rattata", type1: "Normal", type2: null, color: "Roxo", stage: 1, heightM: 0.3, weightKg: 3.5 },
  { id: "pikachu", name: "Pikachu", type1: "Elétrico", type2: null, color: "Amarelo", stage: 1, heightM: 0.4, weightKg: 6.0 },
  { id: "raichu", name: "Raichu", type1: "Elétrico", type2: null, color: "Amarelo", stage: 2, heightM: 0.8, weightKg: 30.0 },
  { id: "sandshrew", name: "Sandshrew", type1: "Terrestre", type2: null, color: "Amarelo", stage: 1, heightM: 0.6, weightKg: 12.0 },
  { id: "vulpix", name: "Vulpix", type1: "Fogo", type2: null, color: "Marrom", stage: 1, heightM: 0.6, weightKg: 9.9 },
  { id: "jigglypuff", name: "Jigglypuff", type1: "Normal", type2: null, color: "Rosa", stage: 1, heightM: 0.5, weightKg: 5.5 },
  { id: "meowth", name: "Meowth", type1: "Normal", type2: null, color: "Amarelo", stage: 1, heightM: 0.4, weightKg: 4.2 },
  { id: "psyduck", name: "Psyduck", type1: "Água", type2: null, color: "Amarelo", stage: 1, heightM: 0.8, weightKg: 19.6 },
  { id: "machop", name: "Machop", type1: "Lutador", type2: null, color: "Cinza", stage: 1, heightM: 0.8, weightKg: 19.5 },
  { id: "geodude", name: "Geodude", type1: "Pedra", type2: "Terrestre", color: "Marrom", stage: 1, heightM: 0.4, weightKg: 20.0 },
  { id: "gastly", name: "Gastly", type1: "Fantasma", type2: "Venenoso", color: "Roxo", stage: 1, heightM: 1.3, weightKg: 0.1 },
  { id: "gengar", name: "Gengar", type1: "Fantasma", type2: "Venenoso", color: "Roxo", stage: 3, heightM: 1.5, weightKg: 40.5 },
  { id: "onix", name: "Onix", type1: "Pedra", type2: "Terrestre", color: "Cinza", stage: 1, heightM: 8.8, weightKg: 210.0 },
  { id: "eevee", name: "Eevee", type1: "Normal", type2: null, color: "Marrom", stage: 1, heightM: 0.3, weightKg: 6.5 },
  { id: "vaporeon", name: "Vaporeon", type1: "Água", type2: null, color: "Azul", stage: 2, heightM: 1.0, weightKg: 29.0 },
  { id: "jolteon", name: "Jolteon", type1: "Elétrico", type2: null, color: "Amarelo", stage: 2, heightM: 0.8, weightKg: 24.5 },
  { id: "flareon", name: "Flareon", type1: "Fogo", type2: null, color: "Vermelho", stage: 2, heightM: 0.9, weightKg: 25.0 },
  { id: "snorlax", name: "Snorlax", type1: "Normal", type2: null, color: "Preto", stage: 1, heightM: 2.1, weightKg: 460.0 },
  { id: "dratini", name: "Dratini", type1: "Dragão", type2: null, color: "Azul", stage: 1, heightM: 1.8, weightKg: 3.3 },
  { id: "dragonite", name: "Dragonite", type1: "Dragão", type2: "Voador", color: "Marrom", stage: 3, heightM: 2.2, weightKg: 210.0 },
  { id: "gyarados", name: "Gyarados", type1: "Água", type2: "Voador", color: "Azul", stage: 2, heightM: 6.5, weightKg: 235.0 },
  { id: "magikarp", name: "Magikarp", type1: "Água", type2: null, color: "Vermelho", stage: 1, heightM: 0.9, weightKg: 10.0 },
  { id: "lapras", name: "Lapras", type1: "Água", type2: "Gelo", color: "Azul", stage: 1, heightM: 2.5, weightKg: 220.0 },
  { id: "mewtwo", name: "Mewtwo", type1: "Psíquico", type2: null, color: "Roxo", stage: 1, heightM: 2.0, weightKg: 122.0 },
  { id: "mew", name: "Mew", type1: "Psíquico", type2: null, color: "Rosa", stage: 1, heightM: 0.4, weightKg: 4.0 },
];

const BY_ID: ReadonlyMap<string, Pokemon> = new Map(POKEMON.map((p) => [p.id, p]));

export function getPokemon(id: string): Pokemon | undefined {
  return BY_ID.get(id);
}
