/**
 * Base local de países para o MVP do País Misterioso.
 * Fonte textual desacoplada — pode ser substituída por uma API pública depois
 * sem alterar a lógica do jogo. Dados aproximados, suficientes para o protótipo.
 *
 * populationBucket: faixa aproximada para a pista de população.
 */

export type Continent =
  | "África"
  | "América do Sul"
  | "América do Norte"
  | "Ásia"
  | "Europa"
  | "Oceania";

export type PopulationBucket =
  | "< 10 milhões"
  | "10–50 milhões"
  | "50–150 milhões"
  | "> 150 milhões";

export interface Country {
  id: string; // slug estável
  name: string;
  continent: Continent;
  capital: string;
  languages: string[];
  neighbors: string[]; // ids de países vizinhos presentes nesta base
  populationBucket: PopulationBucket;
}

export const COUNTRIES: readonly Country[] = [
  {
    id: "brasil",
    name: "Brasil",
    continent: "América do Sul",
    capital: "Brasília",
    languages: ["Português"],
    neighbors: ["argentina", "bolivia", "peru", "colombia", "venezuela", "uruguai", "paraguai"],
    populationBucket: "> 150 milhões",
  },
  {
    id: "argentina",
    name: "Argentina",
    continent: "América do Sul",
    capital: "Buenos Aires",
    languages: ["Espanhol"],
    neighbors: ["brasil", "chile", "bolivia", "paraguai", "uruguai"],
    populationBucket: "10–50 milhões",
  },
  {
    id: "chile",
    name: "Chile",
    continent: "América do Sul",
    capital: "Santiago",
    languages: ["Espanhol"],
    neighbors: ["argentina", "bolivia", "peru"],
    populationBucket: "10–50 milhões",
  },
  {
    id: "peru",
    name: "Peru",
    continent: "América do Sul",
    capital: "Lima",
    languages: ["Espanhol", "Quíchua"],
    neighbors: ["brasil", "chile", "bolivia", "colombia"],
    populationBucket: "10–50 milhões",
  },
  {
    id: "bolivia",
    name: "Bolívia",
    continent: "América do Sul",
    capital: "Sucre",
    languages: ["Espanhol", "Quíchua", "Aimará"],
    neighbors: ["brasil", "argentina", "chile", "peru", "paraguai"],
    populationBucket: "10–50 milhões",
  },
  {
    id: "colombia",
    name: "Colômbia",
    continent: "América do Sul",
    capital: "Bogotá",
    languages: ["Espanhol"],
    neighbors: ["brasil", "peru", "venezuela"],
    populationBucket: "50–150 milhões",
  },
  {
    id: "venezuela",
    name: "Venezuela",
    continent: "América do Sul",
    capital: "Caracas",
    languages: ["Espanhol"],
    neighbors: ["brasil", "colombia"],
    populationBucket: "10–50 milhões",
  },
  {
    id: "uruguai",
    name: "Uruguai",
    continent: "América do Sul",
    capital: "Montevidéu",
    languages: ["Espanhol"],
    neighbors: ["brasil", "argentina"],
    populationBucket: "< 10 milhões",
  },
  {
    id: "paraguai",
    name: "Paraguai",
    continent: "América do Sul",
    capital: "Assunção",
    languages: ["Espanhol", "Guarani"],
    neighbors: ["brasil", "argentina", "bolivia"],
    populationBucket: "< 10 milhões",
  },
  {
    id: "mexico",
    name: "México",
    continent: "América do Norte",
    capital: "Cidade do México",
    languages: ["Espanhol"],
    neighbors: ["estados-unidos"],
    populationBucket: "50–150 milhões",
  },
  {
    id: "estados-unidos",
    name: "Estados Unidos",
    continent: "América do Norte",
    capital: "Washington, D.C.",
    languages: ["Inglês"],
    neighbors: ["mexico", "canada"],
    populationBucket: "> 150 milhões",
  },
  {
    id: "canada",
    name: "Canadá",
    continent: "América do Norte",
    capital: "Ottawa",
    languages: ["Inglês", "Francês"],
    neighbors: ["estados-unidos"],
    populationBucket: "10–50 milhões",
  },
  {
    id: "portugal",
    name: "Portugal",
    continent: "Europa",
    capital: "Lisboa",
    languages: ["Português"],
    neighbors: ["espanha"],
    populationBucket: "10–50 milhões",
  },
  {
    id: "espanha",
    name: "Espanha",
    continent: "Europa",
    capital: "Madri",
    languages: ["Espanhol"],
    neighbors: ["portugal", "franca"],
    populationBucket: "10–50 milhões",
  },
  {
    id: "franca",
    name: "França",
    continent: "Europa",
    capital: "Paris",
    languages: ["Francês"],
    neighbors: ["espanha", "alemanha", "italia", "belgica", "suica"],
    populationBucket: "50–150 milhões",
  },
  {
    id: "alemanha",
    name: "Alemanha",
    continent: "Europa",
    capital: "Berlim",
    languages: ["Alemão"],
    neighbors: ["franca", "belgica", "suica", "austria", "polonia"],
    populationBucket: "50–150 milhões",
  },
  {
    id: "italia",
    name: "Itália",
    continent: "Europa",
    capital: "Roma",
    languages: ["Italiano"],
    neighbors: ["franca", "suica", "austria"],
    populationBucket: "50–150 milhões",
  },
  {
    id: "belgica",
    name: "Bélgica",
    continent: "Europa",
    capital: "Bruxelas",
    languages: ["Neerlandês", "Francês", "Alemão"],
    neighbors: ["franca", "alemanha"],
    populationBucket: "10–50 milhões",
  },
  {
    id: "suica",
    name: "Suíça",
    continent: "Europa",
    capital: "Berna",
    languages: ["Alemão", "Francês", "Italiano"],
    neighbors: ["franca", "alemanha", "italia", "austria"],
    populationBucket: "< 10 milhões",
  },
  {
    id: "austria",
    name: "Áustria",
    continent: "Europa",
    capital: "Viena",
    languages: ["Alemão"],
    neighbors: ["alemanha", "italia", "suica"],
    populationBucket: "< 10 milhões",
  },
  {
    id: "polonia",
    name: "Polônia",
    continent: "Europa",
    capital: "Varsóvia",
    languages: ["Polonês"],
    neighbors: ["alemanha"],
    populationBucket: "10–50 milhões",
  },
  {
    id: "reino-unido",
    name: "Reino Unido",
    continent: "Europa",
    capital: "Londres",
    languages: ["Inglês"],
    neighbors: [],
    populationBucket: "50–150 milhões",
  },
  {
    id: "japao",
    name: "Japão",
    continent: "Ásia",
    capital: "Tóquio",
    languages: ["Japonês"],
    neighbors: [],
    populationBucket: "50–150 milhões",
  },
  {
    id: "china",
    name: "China",
    continent: "Ásia",
    capital: "Pequim",
    languages: ["Mandarim"],
    neighbors: ["india"],
    populationBucket: "> 150 milhões",
  },
  {
    id: "india",
    name: "Índia",
    continent: "Ásia",
    capital: "Nova Déli",
    languages: ["Híndi", "Inglês"],
    neighbors: ["china"],
    populationBucket: "> 150 milhões",
  },
  {
    id: "coreia-do-sul",
    name: "Coreia do Sul",
    continent: "Ásia",
    capital: "Seul",
    languages: ["Coreano"],
    neighbors: [],
    populationBucket: "50–150 milhões",
  },
  {
    id: "egito",
    name: "Egito",
    continent: "África",
    capital: "Cairo",
    languages: ["Árabe"],
    neighbors: ["libia"],
    populationBucket: "50–150 milhões",
  },
  {
    id: "libia",
    name: "Líbia",
    continent: "África",
    capital: "Trípoli",
    languages: ["Árabe"],
    neighbors: ["egito"],
    populationBucket: "< 10 milhões",
  },
  {
    id: "africa-do-sul",
    name: "África do Sul",
    continent: "África",
    capital: "Pretória",
    languages: ["Zulu", "Inglês", "Africâner"],
    neighbors: [],
    populationBucket: "50–150 milhões",
  },
  {
    id: "nigeria",
    name: "Nigéria",
    continent: "África",
    capital: "Abuja",
    languages: ["Inglês"],
    neighbors: [],
    populationBucket: "> 150 milhões",
  },
  {
    id: "australia",
    name: "Austrália",
    continent: "Oceania",
    capital: "Camberra",
    languages: ["Inglês"],
    neighbors: [],
    populationBucket: "10–50 milhões",
  },
  {
    id: "nova-zelandia",
    name: "Nova Zelândia",
    continent: "Oceania",
    capital: "Wellington",
    languages: ["Inglês", "Maori"],
    neighbors: [],
    populationBucket: "< 10 milhões",
  },
];

const BY_ID: ReadonlyMap<string, Country> = new Map(COUNTRIES.map((c) => [c.id, c]));

export function getCountry(id: string): Country | undefined {
  return BY_ID.get(id);
}

export function countryName(id: string): string {
  return BY_ID.get(id)?.name ?? id;
}
