export interface MultiplayerPlayer {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  score: number;
}

export interface PlayerHint {
  playerId: string;
  playerName: string;
  hintText: string;
}

export interface PlayerVote {
  voterId: string;
  targetPlayerId: string;
}

export interface ImpostorCategoryWord {
  category: string;
  word: string;
  hint: string;
}

export const IMPOSTOR_WORDS_CATALOG: readonly ImpostorCategoryWord[] = [
  { category: "Marvel & Cinema", word: "Homem-Aranha", hint: "Herói aracnídeo de Nova York" },
  { category: "Marvel & Cinema", word: "Vingadores", hint: "Equipe de heróis da Terra" },
  { category: "DC Comics", word: "Batman", hint: "O Cavaleiro das Trevas de Gotham" },
  { category: "DC Comics", word: "Coringa", hint: "O Rei do Crime de Gotham" },
  { category: "Dragon Ball", word: "Goku", hint: "Sayajin que protege a Terra" },
  { category: "Dragon Ball", word: "Vegeta", hint: "Príncipe dos Sayajins" },
  { category: "Pokémon", word: "Pikachu", hint: "Mascote elétrico amarelo" },
  { category: "Pokémon", word: "Charizard", hint: "Pokémon voador de fogo" },
  { category: "Videogames", word: "Minecraft", hint: "Mundo de blocos e construção" },
  { category: "Videogames", word: "Super Mario", hint: "Encanador do Reino dos Cogumelos" },
  { category: "Videogames", word: "Zelda", hint: "Princesa de Hyrule" },
  { category: "Star Wars", word: "Darth Vader", hint: "Líder Sith do Império Galáctico" },
  { category: "Star Wars", word: "Sabro de Luz", hint: "Arma dos Jedis e Siths" },
  { category: "Animes", word: "Naruto", hint: "Ninja da Vila da Folha" },
  { category: "Animes", word: "One Piece", hint: "Luffy e os Chapéus de Palha" },
  { category: "Harry Potter", word: "Hogwarts", hint: "Escola de Magia e Bruxaria" },
  { category: "Sci-Fi", word: "Matrix", hint: "Mundo virtual das máquinas" },
];

export interface HerdPrompt {
  id: string;
  question: string;
  category: string;
}

export interface PlayerHerdAnswer {
  playerId: string;
  playerName: string;
  answerText: string;
}

export const HERD_PROMPTS_CATALOG: readonly HerdPrompt[] = [
  { id: "1", category: "Videogames", question: "Qual é o melhor console de videogame de todos os tempos?" },
  { id: "2", category: "Cinema & Marvel", question: "Qual é o super-herói mais famoso do mundo?" },
  { id: "3", category: "Comida & Snacks", question: "Qual é a melhor comida para comer enquanto joga?" },
  { id: "4", category: "Cultura Geek", question: "Se você pudesse ter 1 superpoder, qual escolheria?" },
  { id: "5", category: "Animes & Mangás", question: "Qual é o anime mais marcante da infância?" },
  { id: "6", category: "Filmes", question: "Qual é o melhor filme da saga Star Wars?" },
  { id: "7", category: "Pokémon", question: "Qual é o Pokémon mais icônico depois do Pikachu?" },
  { id: "8", category: "Séries", question: "Qual é a série mais viciante para fazer maratona?" },
  { id: "9", category: "Dia a Dia", question: "Qual é a primeira coisa que você faz ao acordar?" },
  { id: "10", category: "Vilões", question: "Qual é o vilão mais inesquecível do cinema ou jogos?" },
  { id: "11", category: "Comida", question: "Qual é o melhor sabor de pizza que existe?" },
  { id: "12", category: "Geek", question: "Qual é a melhor franquia de jogos de mundo aberto?" },
];

export type GameMode = "impostor" | "herd";
export type RoomStatus = "lobby" | "hints" | "voting" | "result";

export interface ImpostorRoom {
  id: string; // ex: GEEK-4921
  createdAt: number;
  hostId: string;
  gameMode: GameMode;
  status: RoomStatus;
  category: string;
  secretWord: string;
  impostorId: string;
  players: MultiplayerPlayer[];
  hints: PlayerHint[];
  votes: PlayerVote[];
  herdQuestion?: string;
  herdAnswers?: PlayerHerdAnswer[];
  majorityAnswers?: string[];
  impostorFinalGuess?: string;
  winner?: "players" | "impostor" | "herd_winners";
}
