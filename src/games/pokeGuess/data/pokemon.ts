/**
 * Base de Pokémon expandida para o PokéGuess.
 * Inclui dados de Pokédex, estatísticas, descrições oficiais e referências de imagens da PokéAPI.
 */

export type PokeType =
  | "Normal" | "Fogo" | "Água" | "Planta" | "Elétrico" | "Gelo" | "Lutador"
  | "Venenoso" | "Terrestre" | "Voador" | "Psíquico" | "Inseto" | "Pedra"
  | "Fantasma" | "Dragão";

export type PokeColor =
  | "Vermelho" | "Azul" | "Amarelo" | "Verde" | "Marrom" | "Roxo" | "Rosa"
  | "Cinza" | "Preto" | "Branco";

export interface PokeStats {
  hp: number;
  atk: number;
  def: number;
  spd: number;
}

export interface Pokemon {
  id: string;
  pokedexId: number;
  name: string;
  generation: number;
  type1: PokeType;
  type2: PokeType | null;
  color: PokeColor;
  stage: 1 | 2 | 3; // estágio evolutivo
  heightM: number;
  weightKg: number;
  description: string;
  stats: PokeStats;
}

export function getPokemonArtworkUrl(pokedexId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokedexId}.png`;
}

export function getPokemonSpriteUrl(pokedexId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokedexId}.png`;
}

export const POKEMON: readonly Pokemon[] = [
  // Geração 1 (Kanto)
  {
    id: "bulbasaur", pokedexId: 1, name: "Bulbasaur", generation: 1,
    type1: "Planta", type2: "Venenoso", color: "Verde", stage: 1, heightM: 0.7, weightKg: 6.9,
    description: "Carrega uma semente nas costas desde o nascimento. A semente cresce lentamente junto com seu corpo.",
    stats: { hp: 45, atk: 49, def: 49, spd: 45 }
  },
  {
    id: "ivysaur", pokedexId: 2, name: "Ivysaur", generation: 1,
    type1: "Planta", type2: "Venenoso", color: "Verde", stage: 2, heightM: 1.0, weightKg: 13.0,
    description: "Quando o bulbo nas suas costas cresce muito, ele perde a capacidade de ficar em duas patas.",
    stats: { hp: 60, atk: 62, def: 63, spd: 60 }
  },
  {
    id: "venusaur", pokedexId: 3, name: "Venusaur", generation: 1,
    type1: "Planta", type2: "Venenoso", color: "Verde", stage: 3, heightM: 2.0, weightKg: 100.0,
    description: "Sua flor absorve energia solar para nutrição. Ela libera um aroma suave para acalmar as pessoas.",
    stats: { hp: 80, atk: 82, def: 83, spd: 80 }
  },
  {
    id: "charmander", pokedexId: 4, name: "Charmander", generation: 1,
    type1: "Fogo", type2: null, color: "Vermelho", stage: 1, heightM: 0.6, weightKg: 8.5,
    description: "A chama na ponta da sua cauda indica a sua saúde e emoções. Queima intensamente quando está saudável.",
    stats: { hp: 39, atk: 52, def: 43, spd: 65 }
  },
  {
    id: "charmeleon", pokedexId: 5, name: "Charmeleon", generation: 1,
    type1: "Fogo", type2: null, color: "Vermelho", stage: 2, heightM: 1.1, weightKg: 19.0,
    description: "Tem uma índole esquentada e procura batalhas constantemente. Abana a cauda para elevar a temperatura.",
    stats: { hp: 58, atk: 64, def: 58, spd: 80 }
  },
  {
    id: "charizard", pokedexId: 6, name: "Charizard", generation: 1,
    type1: "Fogo", type2: "Voador", color: "Vermelho", stage: 3, heightM: 1.7, weightKg: 90.5,
    description: "Voa pelos céus procurando oponentes poderosos. Seu sopro de fogo derrete praticamente qualquer rocha.",
    stats: { hp: 78, atk: 84, def: 78, spd: 100 }
  },
  {
    id: "squirtle", pokedexId: 7, name: "Squirtle", generation: 1,
    type1: "Água", type2: null, color: "Azul", stage: 1, heightM: 0.5, weightKg: 9.0,
    description: "Após o nascimento, suas costas se petrificam em um casco duro. Ele espirra água com grande precisão.",
    stats: { hp: 44, atk: 48, def: 65, spd: 43 }
  },
  {
    id: "wartortle", pokedexId: 8, name: "Wartortle", generation: 1,
    type1: "Água", type2: null, color: "Azul", stage: 2, heightM: 1.0, weightKg: 22.5,
    description: "Sua cauda peluda é um símbolo de longevidade. É muito popular como mascote entre os idosos.",
    stats: { hp: 59, atk: 63, def: 80, spd: 58 }
  },
  {
    id: "blastoise", pokedexId: 9, name: "Blastoise", generation: 1,
    type1: "Água", type2: null, color: "Azul", stage: 3, heightM: 1.6, weightKg: 85.5,
    description: "Os canhões de água no seu casco conseguem perfurar aço temperado com jatos d'água de altíssima pressão.",
    stats: { hp: 79, atk: 83, def: 100, spd: 78 }
  },
  {
    id: "pikachu", pokedexId: 25, name: "Pikachu", generation: 1,
    type1: "Elétrico", type2: null, color: "Amarelo", stage: 1, heightM: 0.4, weightKg: 6.0,
    description: "Armazena eletricidade nas bolsas vermelhas das suas bochechas. Dispara choques ao se sentir ameaçado.",
    stats: { hp: 35, atk: 55, def: 40, spd: 90 }
  },
  {
    id: "gengar", pokedexId: 94, name: "Gengar", generation: 1,
    type1: "Fantasma", type2: "Venenoso", color: "Roxo", stage: 3, heightM: 1.5, weightKg: 40.5,
    description: "Esconde-se nas sombras das pessoas para roubar seu calor corporal. Deixa o ambiente assustadoramente frio.",
    stats: { hp: 60, atk: 65, def: 60, spd: 110 }
  },
  {
    id: "eevee", pokedexId: 133, name: "Eevee", generation: 1,
    type1: "Normal", type2: null, color: "Marrom", stage: 1, heightM: 0.3, weightKg: 6.5,
    description: "Possui uma estrutura genética instável que permite evoluir para múltiplos tipos conforme o ambiente.",
    stats: { hp: 55, atk: 55, def: 50, spd: 55 }
  },
  {
    id: "snorlax", pokedexId: 143, name: "Snorlax", generation: 1,
    type1: "Normal", type2: null, color: "Preto", stage: 1, heightM: 2.1, weightKg: 460.0,
    description: "Come 400 kg de comida por dia antes de dormir. Seu estômago tolera até alimentos mofados sem passar mal.",
    stats: { hp: 160, atk: 110, def: 65, spd: 30 }
  },
  {
    id: "dragonite", pokedexId: 149, name: "Dragonite", generation: 1,
    type1: "Dragão", type2: "Voador", color: "Marrom", stage: 3, heightM: 2.2, weightKg: 210.0,
    description: "Dizem que ele consegue dar a volta ao mundo em apenas 16 horas. É conhecido por resgatar marinheiros no mar.",
    stats: { hp: 91, atk: 134, def: 95, spd: 80 }
  },
  {
    id: "mewtwo", pokedexId: 150, name: "Mewtwo", generation: 1,
    type1: "Psíquico", type2: null, color: "Roxo", stage: 1, heightM: 2.0, weightKg: 122.0,
    description: "Criado por manipulação genética. Seus poderes psíquicos são avassaladores e sua natureza é extremamente agressiva.",
    stats: { hp: 106, atk: 110, def: 90, spd: 130 }
  },
  {
    id: "mew", pokedexId: 151, name: "Mew", generation: 1,
    type1: "Psíquico", type2: null, color: "Rosa", stage: 1, heightM: 0.4, weightKg: 4.0,
    description: "Dizem que possui o código genético de todos os Pokémon. Pode aprender qualquer técnica de combate.",
    stats: { hp: 100, atk: 100, def: 100, spd: 100 }
  },

  // Geração 2 (Johto)
  {
    id: "cyndaquil", pokedexId: 155, name: "Cyndaquil", generation: 2,
    type1: "Fogo", type2: null, color: "Amarelo", stage: 1, heightM: 0.5, weightKg: 7.9,
    description: "Tímido e reservado. Quando é atacado ou se assusta, solta chamas protetoras pelas costas.",
    stats: { hp: 39, atk: 52, def: 43, spd: 65 }
  },
  {
    id: "umbreon", pokedexId: 197, name: "Umbreon", generation: 2,
    type1: "Normal", type2: null, color: "Preto", stage: 2, heightM: 1.0, weightKg: 27.0,
    description: "Quando exposto à luz do luar, os anéis em seu corpo brilham levemente e despertam seu poder misterioso.",
    stats: { hp: 95, atk: 65, def: 110, spd: 65 }
  },
  {
    id: "tyranitar", pokedexId: 248, name: "Tyranitar", generation: 2,
    type1: "Pedra", type2: "Terrestre", color: "Verde", stage: 3, heightM: 2.0, weightKg: 202.0,
    description: "Sua força é tão colossal que pode destruir montanhas inteiras para criar seu próprio abrigo.",
    stats: { hp: 100, atk: 134, def: 110, spd: 61 }
  },

  // Geração 3 (Hoenn)
  {
    id: "treecko", pokedexId: 252, name: "Treecko", generation: 3,
    type1: "Planta", type2: null, color: "Verde", stage: 1, heightM: 0.5, weightKg: 5.0,
    description: "Escala superfícies verticais usando pequenos ganchos sob as patas. É conhecido por ser muito calmo e focado.",
    stats: { hp: 40, atk: 45, def: 35, spd: 70 }
  },
  {
    id: "rayquaza", pokedexId: 384, name: "Rayquaza", generation: 3,
    type1: "Dragão", type2: "Voador", color: "Verde", stage: 1, heightM: 7.0, weightKg: 206.5,
    description: "Vive na camada de ozônio bem acima das nuvens. Alimenta-se de umidade e meteoritos no espaço.",
    stats: { hp: 105, atk: 150, def: 90, spd: 95 }
  },

  // Geração 4 (Sinnoh)
  {
    id: "lucario", pokedexId: 448, name: "Lucario", generation: 4,
    type1: "Lutador", type2: null, color: "Azul", stage: 2, heightM: 1.2, weightKg: 54.0,
    description: "Consegue ler a aura de seres vivos a mais de 1 km de distância. Entende a linguagem humana perfeitamente.",
    stats: { hp: 70, atk: 110, def: 70, spd: 90 }
  },
  {
    id: "garchomp", pokedexId: 445, name: "Garchomp", generation: 4,
    type1: "Dragão", type2: "Terrestre", color: "Azul", stage: 3, heightM: 1.9, weightKg: 95.0,
    description: "Voa na mesma velocidade que um caça a jato. Quando voa rápido, suas asas criam lâminas de ar cortantes.",
    stats: { hp: 108, atk: 130, def: 95, spd: 102 }
  }
];

const BY_ID: ReadonlyMap<string, Pokemon> = new Map(POKEMON.map((p) => [p.id, p]));

export function getPokemon(id: string): Pokemon | undefined {
  return BY_ID.get(id);
}

