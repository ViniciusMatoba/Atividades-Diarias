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

export type RoomStatus = "lobby" | "hints" | "voting" | "result";

export interface ImpostorRoom {
  id: string; // ex: GEEK-4921
  createdAt: number;
  hostId: string;
  status: RoomStatus;
  category: string;
  secretWord: string;
  impostorId: string;
  players: MultiplayerPlayer[];
  hints: PlayerHint[];
  votes: PlayerVote[];
  impostorFinalGuess?: string;
  winner?: "players" | "impostor";
}
