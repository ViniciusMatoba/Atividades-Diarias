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
  // Comidas & Sobremesas
  { category: "Comidas", word: "Pizza de Calabrês", hint: "Prato de origem italiana muito popular no Brasil" },
  { category: "Comidas", word: "Hambúrguer", hint: "Sanduíche com carne, queijo e pão" },
  { category: "Comidas", word: "Churrasco", hint: "Carne assada na grelha ou espeto" },
  { category: "Comidas", word: "Açaí", hint: "Fruta roxa gelada muito consumida com granola" },
  { category: "Sobremesas", word: "Brigadeiro", hint: "Doce tradicional brasileiro de chocolate e granulado" },
  { category: "Sobremesas", word: "Sorvete de Chocolate", hint: "Sobremesa gelada e cremosa" },
  { category: "Comidas", word: "Coxinha de Frango", hint: "Salgado frito com recheio de frango" },
  { category: "Comidas", word: "Sushi", hint: "Prato tradicional da culinária japonesa com peixe" },

  // Viagens & Lugares
  { category: "Lugares", word: "Praia", hint: "Lugar com areia, mar e muito sol" },
  { category: "Lugares", word: "Cinema", hint: "Lugar para ver filmes numa tela gigante com pipoca" },
  { category: "Lugares", word: "Parque de Diversões", hint: "Lugar com montanha-russa e roda-gigante" },
  { category: "Viagens", word: "Disney", hint: "Parque temático famoso em Orlando" },
  { category: "Viagens", word: "Rio de Janeiro", hint: "Cidade maravilhosa do Cristo Redentor" },
  { category: "Viagens", word: "Paris", hint: "Cidade luz famosa pela Torre Eiffel" },

  // Esportes & Lazer
  { category: "Esportes", word: "Futebol", hint: "Esporte jogado com bola e 11 jogadores de cada lado" },
  { category: "Esportes", word: "Basquete", hint: "Esporte em que o objetivo é encestar a bola" },
  { category: "Esportes", word: "Natação", hint: "Esporte aquático disputado em piscinas" },
  { category: "Lazer", word: "Musculação & Academia", hint: "Lugar de treino com pesos e esteiras" },

  // Animais & Natureza
  { category: "Animais", word: "Cachorro", hint: "O melhor amigo do homem" },
  { category: "Animais", word: "Gato", hint: "Felino doméstico que curte dormir e miar" },
  { category: "Animais", word: "Golfinho", hint: "Mamífero aquático muito inteligente e brincalhão" },
  { category: "Animais", word: "Leão", hint: "O rei da selva" },

  // Música & TV
  { category: "Música", word: "Karaokê", hint: "Diversão de cantar acompanhando a letra na tela" },
  { category: "Música", word: "Show Ao Vivo", hint: "Evento de música com banda e multidão" },
  { category: "Entretenimento", word: "Big Brother", hint: "Reality show de convivência em uma casa vigiada" },

  // Cultura Pop & Geek (Mantidos em equilíbrio)
  { category: "Marvel & Cinema", word: "Homem-Aranha", hint: "Herói aracnídeo de Nova York" },
  { category: "DC Comics", word: "Batman", hint: "O Cavaleiro das Trevas de Gotham" },
  { category: "Pokémon", word: "Pikachu", hint: "Mascote elétrico amarelo" },
  { category: "Videogames", word: "Super Mario", hint: "Encanador do Reino dos Cogumelos" },
  { category: "Star Wars", word: "Darth Vader", hint: "Líder Sith do Império Galáctico" },
  { category: "Animes", word: "Naruto", hint: "Ninja da Vila da Folha" },
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
  // Temas Gerais do Dia a Dia & Estilo de Vida
  { id: "1", category: "Comidas", question: "Qual é a melhor comida de festa de aniversário?" },
  { id: "2", category: "Comidas", question: "Qual é o sabor de pizza preferido dos brasileiros?" },
  { id: "3", category: "Comidas", question: "Qual é a melhor comida para pedir num domingo à noite?" },
  { id: "4", category: "Dia a Dia", question: "Qual é a primeira coisa que você faz assim que acorda?" },
  { id: "5", category: "Dia a Dia", question: "Qual é o objeto mais importante para levar ao sair de casa?" },
  { id: "6", category: "Estilo de Vida", question: "Qual é o dia mais feliz da semana?" },
  { id: "7", category: "Lazer", question: "O que é melhor para fazer em um dia chuvoso?" },

  // Viagens & Entretenimento
  { id: "8", category: "Viagens", question: "Se você ganhasse uma viagem grátis, para onde iria?" },
  { id: "9", category: "Lazer", question: "Qual é o melhor lugar para ir no primeiro encontro?" },
  { id: "10", category: "Música", question: "Qual é o estilo de música que não pode faltar em um churrasco?" },
  { id: "11", category: "Filmes & TV", question: "Qual é o desenho animado mais clássico da infância?" },
  { id: "12", category: "Esportes", question: "Qual é o esporte mais praticado no Brasil?" },

  // Superpoderes & Subjetivos Divertidos
  { id: "13", category: "Superpoderes", question: "Se você pudesse ter 1 superpoder, qual escolheria?" },
  { id: "14", category: "Videogames", question: "Qual é o melhor videogame de todos os tempos?" },
  { id: "15", category: "Cinema", question: "Qual é o super-herói mais famoso do mundo?" },
  { id: "16", category: "Bebidas", question: "Qual é a bebida perfeita em um dia de calor intenso?" },
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
