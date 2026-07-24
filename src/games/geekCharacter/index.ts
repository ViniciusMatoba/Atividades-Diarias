import { z } from "zod";
import type { GameModule, GameResult, GuessOutcome } from "@/games/core/types";
import { pickDeterministic } from "@/games/core/seed";

export interface GeekCharacterItem {
  id: string;
  name: string;
  franchise: string;
  role: string;
  signatureItem: string;
  decade: string;
  hint: string;
}

export const GEEK_CHARACTERS: readonly GeekCharacterItem[] = [
  { id: "batman", name: "Batman", franchise: "DC Comics", role: "Super-Herói / Vigilante", signatureItem: "Batarangue / Batmóvel", decade: "1930s", hint: "O Cavaleiro das Trevas de Gotham City" },
  { id: "darth-vader", name: "Darth Vader", franchise: "Star Wars", role: "Lord Sith", signatureItem: "Sabro de Luz Vermelho", decade: "1970s", hint: "Pai de Luke Skywalker e líder do Império Galáctico" },
  { id: "goku", name: "Goku", franchise: "Dragon Ball", role: "Guerreiro Sayajin", signatureItem: "Kamehameha / Nuvem Voadora", decade: "1980s", hint: "Sayajin criado na Terra que ama artes marciais" },
  { id: "spiderman", name: "Homem-Aranha", franchise: "Marvel Comics", role: "Super-Herói", signatureItem: "Lançador de Teias", decade: "1960s", hint: "Peter Parker, o amigo da vizinhança" },
  { id: "mario", name: "Mario", franchise: "Super Mario", role: "Encanador", signatureItem: "Cogumelo Vermelho / Super Estrela", decade: "1980s", hint: "Mascote de bigode da Nintendo do Reino dos Cogumelos" },
  { id: "naruto", name: "Naruto Uzumaki", franchise: "Naruto", role: "Ninja / Hokage", signatureItem: "Rasengan / Raposa de 9 Caudas", decade: "1990s", hint: "Ninja hiperativo da Vila da Folha" },
  { id: "kratos", name: "Kratos", franchise: "God of War", role: "Deus da Guerra", signatureItem: "Lâminas do Caos / Machado Leviatã", decade: "2000s", hint: "O Fantasma de Esparta" },
  { id: "harry-potter", name: "Harry Potter", franchise: "Harry Potter", role: "Bruxo", signatureItem: "Varinha de Azevinho / Cicatriz de Raio", decade: "1990s", hint: "O Menino Que Sobreviveu na Escola de Hogwarts" },
  { id: "link", name: "Link", franchise: "The Legend of Zelda", role: "Herói do Tempo", signatureItem: "Master Sword / Hylian Shield", decade: "1980s", hint: "Portador da Triforce da Coragem" },
  { id: "geralt", name: "Geralt de Rívia", franchise: "The Witcher", role: "Bruxo / Caçador de Monstros", signatureItem: "Espada de Prata / Feitiços de Sinais", decade: "1990s", hint: "O Lobo Branco que caça monstros por moedas" },
];

export interface GeekCharacterChallenge { id: string }
export interface GeekCharacterState { guesses: string[]; finished: boolean; solved: boolean }
export interface GeekCharacterPublic {
  franchise: string;
  role: string;
  decade: string;
  hint: string;
  guesses: { id: string; name: string; correct: boolean }[];
  guessesRemaining: number;
  finished: boolean;
  solved: boolean;
  characterList: { id: string; name: string }[];
  answer: GeekCharacterItem | null;
}
export interface GeekCharacterGuess { characterId: string }

const guessSchema = z.object({ characterId: z.string().min(1) });
const stateSchema = z.object({
  guesses: z.array(z.string().min(1)).max(5),
  finished: z.boolean(),
  solved: z.boolean(),
});

export const geekCharacter: GameModule<GeekCharacterChallenge, GeekCharacterPublic, GeekCharacterState, GeekCharacterGuess> = {
  meta: {
    id: "geek-character",
    name: "Quem é o Personagem?",
    description: "Adivinhe o personagem da cultura pop através de sua silhueta e atributos.",
    icon: "UserCheck",
    theme: "geek",
    order: 10,
  },

  generateChallenge(seed: string): GeekCharacterChallenge {
    return { id: pickDeterministic(GEEK_CHARACTERS, seed).id };
  },

  initialState(): GeekCharacterState {
    return { guesses: [], finished: false, solved: false };
  },

  parseState(raw: unknown): GeekCharacterState { return stateSchema.parse(raw); },
  parseGuess(raw: unknown): GeekCharacterGuess { return guessSchema.parse(raw); },

  applyGuess(challenge: GeekCharacterChallenge, state: GeekCharacterState, guess: GeekCharacterGuess): GuessOutcome<GeekCharacterState> {
    if (state.finished) return { state, feedback: { correct: state.solved, message: "Encerrado." }, finished: true, solved: state.solved };
    const correct = guess.characterId === challenge.id;
    const guesses = [...state.guesses, guess.characterId];
    const finished = correct || guesses.length >= 5;
    const target = GEEK_CHARACTERS.find((c) => c.id === challenge.id);
    return {
      state: { guesses, finished, solved: correct },
      feedback: {
        correct,
        message: correct ? `Acertou! É o ${target?.name}.` : finished ? `Fim! Era o ${target?.name}.` : "Incorreto! Tente outro personagem.",
      },
      finished,
      solved: correct,
    };
  },

  score(_challenge: GeekCharacterChallenge, state: GeekCharacterState): number {
    if (!state.solved) return 0;
    return Math.round(1000 * (1 - (state.guesses.length - 1) / 5));
  },

  toPublic(challenge: GeekCharacterChallenge, state: GeekCharacterState): GeekCharacterPublic {
    const target = GEEK_CHARACTERS.find((c) => c.id === challenge.id) ?? GEEK_CHARACTERS[0]!;
    return {
      franchise: target.franchise,
      role: target.role,
      decade: target.decade,
      hint: target.hint,
      guesses: state.guesses.map((id) => {
        const item = GEEK_CHARACTERS.find((c) => c.id === id);
        return { id, name: item?.name ?? id, correct: id === challenge.id };
      }),
      guessesRemaining: Math.max(0, 5 - state.guesses.length),
      finished: state.finished,
      solved: state.solved,
      characterList: GEEK_CHARACTERS.map((c) => ({ id: c.id, name: `${c.name} (${c.franchise})` })),
      answer: state.finished ? target : null,
    };
  },

  toResult(challenge: GeekCharacterChallenge, state: GeekCharacterState): GameResult {
    const target = GEEK_CHARACTERS.find((c) => c.id === challenge.id);
    return {
      score: this.score(challenge, state),
      solved: state.solved,
      attempts: state.guesses.length,
      summary: { character: target?.name },
    };
  },
};
