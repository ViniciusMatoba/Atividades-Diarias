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
  explanation: string;
}

export const CONNECTION_GROUPS: readonly ConnectionGroup[] = [
  { id: "poke-tipos", theme: "Tipos de Pokémon", terms: ["Fogo", "Água", "Planta", "Elétrico"], explanation: "Tipos elementares clássicos presentes desde a 1ª geração dos jogos Pokémon." },
  { id: "consoles-nintendo", theme: "Consoles Nintendo", terms: ["NES", "SNES", "GameCube", "Wii U"], explanation: "Consoles de mesa lendários criados pela gigante japonesa Nintendo." },
  { id: "consoles-sony", theme: "Consoles PlayStation", terms: ["PS1", "PS2", "PS3", "PS5"], explanation: "Gerações da linha de videogames PlayStation desenvolvida pela Sony." },
  { id: "animes-shounen", theme: "Animes Shounen", terms: ["Naruto", "Bleach", "One Piece", "Dragon Ball"], explanation: "Grandes marcos da Weekly Shōnen Jump que definiram a cultura pop otaku mundial." },
  { id: "personagens-mario", theme: "Universo Mario", terms: ["Luigi", "Peach", "Bowser", "Yoshi"], explanation: "Personagens centrais do Reino dos Cogumelos nas aventuras de Mario." },
  { id: "golpes", theme: "Golpes de anime", terms: ["Rasengan", "Kamehameha", "Bankai", "Getsuga"], explanation: "Ataques icônicos e transformações marcantes de batalhas em animes de sucesso." },
  { id: "cdz", theme: "Cavaleiros do Zodíaco", terms: ["Seiya", "Shiryu", "Hyoga", "Shun"], explanation: "Os quatro Cavaleiros de Bronze de Atena que protagonizam Saint Seiya." },
  { id: "rpgs", theme: "Franquias de RPG", terms: ["Final Fantasy", "Dragon Quest", "Persona", "Chrono Trigger"], explanation: "Séries consagradas de JRPG que marcaram a história da indústria dos games." },
  { id: "streamings", theme: "Serviços de streaming", terms: ["Netflix", "Disney+", "Crunchyroll", "Max"], explanation: "Plataformas digitais de transmissão contínua de filmes, séries e animes." },
  { id: "lotr", theme: "Raças de O Senhor dos Anéis", terms: ["Hobbit", "Elfo", "Anão", "Ent"], explanation: "Povos e raças fantásticas da Terra-média criadas por J.R.R. Tolkien." },
  { id: "moedas", theme: "Moedas de jogos", terms: ["Rupee", "Zenny", "Gil", "Bell"], explanation: "Unidades monetárias usadas para comprar itens em Zelda, Dragon Ball, Final Fantasy e Animal Crossing." },
  { id: "herois-marvel", theme: "Heróis Marvel", terms: ["Homem-Aranha", "Thor", "Hulk", "Pantera Negra"], explanation: "Vingadores e heróis emblemáticos dos quadrinhos e do cinema Marvel." },
];

const BY_ID: ReadonlyMap<string, ConnectionGroup> = new Map(CONNECTION_GROUPS.map((g) => [g.id, g]));

export function getGroup(id: string): ConnectionGroup | undefined {
  return BY_ID.get(id);
}
