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
  creator: string;
  curiosity: string;
}

export const ITEMS: readonly TimelineItem[] = [
  {
    id: "console-nes",
    label: "Nintendo Entertainment System",
    year: 1983,
    category: "console",
    creator: "Nintendo",
    curiosity: "Revolucionou e salvou a indústria global de videogames após o grande colapso dos jogos em 1983.",
  },
  {
    id: "console-snes",
    label: "Super Nintendo (SNES)",
    year: 1990,
    category: "console",
    creator: "Nintendo",
    curiosity: "Imortalizou a era de ouro dos 16-bits e introduziu o lendário chip de rotação de sprites Mode 7.",
  },
  {
    id: "console-ps1",
    label: "PlayStation",
    year: 1994,
    category: "console",
    creator: "Sony Interactive Entertainment",
    curiosity: "Foi o primeiro console de mesa na história a vender mais de 100 milhões de unidades mundialmente.",
  },
  {
    id: "console-ps2",
    label: "PlayStation 2",
    year: 2000,
    category: "console",
    creator: "Sony",
    curiosity: "Permanece até hoje como o console de videogames mais vendido de todos os tempos (+155 milhões).",
  },
  {
    id: "console-xbox",
    label: "Xbox",
    year: 2001,
    category: "console",
    creator: "Microsoft",
    curiosity: "Estreou no mercado de consoles trazendo o revolucionário 'Halo: Combat Evolved' e o HD interno embutido.",
  },
  {
    id: "console-wii",
    label: "Nintendo Wii",
    year: 2006,
    category: "console",
    creator: "Nintendo",
    curiosity: "Popularizou os controles por movimento (Wii Remote) tornando-se um fenômeno cultural de massas.",
  },
  {
    id: "console-switch",
    label: "Nintendo Switch",
    year: 2017,
    category: "console",
    creator: "Nintendo",
    curiosity: "Inovou ao combinar um console híbrido portabilidade total com jogos AAA de mesa.",
  },
  {
    id: "game-mario",
    label: "Super Mario Bros.",
    year: 1985,
    category: "game",
    creator: "Shigeru Miyamoto / Nintendo",
    curiosity: "Estabeleceu os pilares fundamentais dos jogos de plataforma 2D e tornou o encanador Mario o maior ícone dos games.",
  },
  {
    id: "game-zelda",
    label: "The Legend of Zelda",
    year: 1986,
    category: "game",
    creator: "Shigeru Miyamoto / Nintendo",
    curiosity: "Pioneiro na inclusão de bateria interna para salvar o progresso do jogador na fita dourada do NES.",
  },
  {
    id: "game-tetris",
    label: "Tetris",
    year: 1984,
    category: "game",
    creator: "Alexey Pajitnov",
    curiosity: "Criado na União Soviética durante a Guerra Fria em um computador Electronika 60 sem gráficos coloridos.",
  },
  {
    id: "game-pokemon",
    label: "Pokémon Red & Green",
    year: 1996,
    category: "game",
    creator: "Satoshi Tajiri / Game Freak",
    curiosity: "Deu início à maior franquia de mídia e entretenimento do planeta Terra.",
  },
  {
    id: "game-minecraft",
    label: "Minecraft",
    year: 2011,
    category: "game",
    creator: "Markus 'Notch' Persson / Mojang",
    curiosity: "É o jogo mais vendido de todos os tempos, ultrapassando 300 milhões de cópias em diversas plataformas.",
  },
  {
    id: "game-fortnite",
    label: "Fortnite",
    year: 2017,
    category: "game",
    creator: "Epic Games",
    curiosity: "Transformou-se de um jogo de construção de defesa em um metaverso de eventos ao vivo e crossovers da cultura pop.",
  },
  {
    id: "movie-starwars",
    label: "Star Wars: Uma Nova Esperança",
    year: 1977,
    category: "movie",
    creator: "George Lucas / Lucasfilm",
    curiosity: "Revolucionou a computação gráfica, os efeitos especiais práticos e a indústria de merchandising no cinema.",
  },
  {
    id: "movie-jurassic",
    label: "Jurassic Park",
    year: 1993,
    category: "movie",
    creator: "Steven Spielberg / Universal Pictures",
    curiosity: "Pioneiro no uso de CGI hiper-realista combinado com animatrônicos em tamanho real de dinossauros.",
  },
  {
    id: "movie-matrix",
    label: "Matrix",
    year: 1999,
    category: "movie",
    creator: "Irmãs Wachowski / Warner Bros.",
    curiosity: "Criou o lendário efeito 'Bullet Time' (tempo de bala) usando dezenas de câmeras fotográficas alinhadas.",
  },
  {
    id: "movie-avengers",
    label: "Os Vingadores",
    year: 2012,
    category: "movie",
    creator: "Joss Whedon / Marvel Studios",
    curiosity: "Consolidou o conceito inédito de Universo Cinematográfico Compartilhado (MCU) nos cinemas.",
  },
  {
    id: "anime-dragonball",
    label: "Dragon Ball (anime)",
    year: 1986,
    category: "anime",
    creator: "Akira Toriyama / Toei Animation",
    curiosity: "Influenciou quase todos os animes do gênero Shonen posteriores e popularizou a animação japonesa no ocidente.",
  },
  {
    id: "anime-onepiece",
    label: "One Piece (anime)",
    year: 1999,
    category: "anime",
    creator: "Eiichiro Oda / Toei Animation",
    curiosity: "Detém o recorde mundial do Guinness de mangá mais vendido por um único autor na história.",
  },
  {
    id: "anime-naruto",
    label: "Naruto (anime)",
    year: 2002,
    category: "anime",
    creator: "Masashi Kishimoto / Pierrot",
    curiosity: "Tornou-se um dos animes mais transmitidos e amados globalmente nos anos 2000.",
  },
];

const BY_ID: ReadonlyMap<string, TimelineItem> = new Map(ITEMS.map((i) => [i.id, i]));

export function getItem(id: string): TimelineItem | undefined {
  return BY_ID.get(id);
}
