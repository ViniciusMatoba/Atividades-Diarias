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
  code: string; // ISO-3166 2 letras
  name: string;
  continent: Continent;
  capital: string;
  languages: string[];
  neighbors: string[]; // ids de países vizinhos presentes nesta base
  populationBucket: PopulationBucket;
  curiosity: string;
}

export function getFlagUrl(code: string): string {
  return `https://flagcdn.com/w160/${code.toLowerCase()}.png`;
}

export const COUNTRIES: readonly Country[] = [
  {
    id: "brasil",
    code: "br",
    name: "Brasil",
    continent: "América do Sul",
    capital: "Brasília",
    languages: ["Português"],
    neighbors: ["argentina", "bolivia", "peru", "colombia", "venezuela", "uruguai", "paraguai"],
    populationBucket: "> 150 milhões",
    curiosity: "É o único país das Américas onde se fala português e abriga a Floresta Amazônica, detentora da maior biodiversidade do planeta.",
  },
  {
    id: "argentina",
    code: "ar",
    name: "Argentina",
    continent: "América do Sul",
    capital: "Buenos Aires",
    languages: ["Espanhol"],
    neighbors: ["brasil", "chile", "bolivia", "paraguai", "uruguai"],
    populationBucket: "10–50 milhões",
    curiosity: "Possui o ponto mais alto das Américas (Aconcágua com 6.961m) e foi o berço do Tango no final do século XIX.",
  },
  {
    id: "chile",
    code: "cl",
    name: "Chile",
    continent: "América do Sul",
    capital: "Santiago",
    languages: ["Espanhol"],
    neighbors: ["argentina", "bolivia", "peru"],
    populationBucket: "10–50 milhões",
    curiosity: "É o país mais longo e estreito do mundo em extensão norte-sul e abriga o Atacama, o deserto mais seco da Terra.",
  },
  {
    id: "peru",
    code: "pe",
    name: "Peru",
    continent: "América do Sul",
    capital: "Lima",
    languages: ["Espanhol", "Quíchua"],
    neighbors: ["brasil", "chile", "bolivia", "colombia"],
    populationBucket: "10–50 milhões",
    curiosity: "Berço do Império Inca e da cidadela de Machu Picchu, possui mais de 3.000 variedades nativas de batata.",
  },
  {
    id: "bolivia",
    code: "bo",
    name: "Bolívia",
    continent: "América do Sul",
    capital: "Sucre",
    languages: ["Espanhol", "Quíchua", "Aimará"],
    neighbors: ["brasil", "argentina", "chile", "peru", "paraguai"],
    populationBucket: "10–50 milhões",
    curiosity: "Abriga o Salar de Uyuni, o maior deserto de sal do mundo, que se transforma em um espelho gigante durante a época de chuvas.",
  },
  {
    id: "colombia",
    code: "co",
    name: "Colômbia",
    continent: "América do Sul",
    capital: "Bogotá",
    languages: ["Espanhol"],
    neighbors: ["brasil", "peru", "venezuela"],
    populationBucket: "50–150 milhões",
    curiosity: "É o segundo país com maior biodiversidade por metro quadrado e produz alguns dos grãos de café de maior qualidade mundial.",
  },
  {
    id: "venezuela",
    code: "ve",
    name: "Venezuela",
    continent: "América do Sul",
    capital: "Caracas",
    languages: ["Espanhol"],
    neighbors: ["brasil", "colombia"],
    populationBucket: "10–50 milhões",
    curiosity: "Possui o Angel Falls (Salto Ángel), a queda d'água ininterrupta mais alta do mundo com 979 metros de altura.",
  },
  {
    id: "uruguai",
    code: "uy",
    name: "Uruguai",
    continent: "América do Sul",
    capital: "Montevidéu",
    languages: ["Espanhol"],
    neighbors: ["brasil", "argentina"],
    populationBucket: "< 10 milhões",
    curiosity: "Sediou e venceu a PRIMEIRA Copa do Mundo da FIFA na história em 1930 no Estádio Centenário.",
  },
  {
    id: "paraguai",
    code: "py",
    name: "Paraguai",
    continent: "América do Sul",
    capital: "Assunção",
    languages: ["Espanhol", "Guarani"],
    neighbors: ["brasil", "argentina", "bolivia"],
    populationBucket: "< 10 milhões",
    curiosity: "É o único país das Américas onde a maioria da população fala uma língua indígena nativa (o Guarani) no cotidiano.",
  },
  {
    id: "mexico",
    code: "mx",
    name: "México",
    continent: "América do Norte",
    capital: "Cidade do México",
    languages: ["Espanhol"],
    neighbors: ["estados-unidos"],
    populationBucket: "50–150 milhões",
    curiosity: "A Cidade do México foi construída sobre as ruínas de Tenochtitlán e a pirâmide de Chichén Itzá é uma das Sete Maravilhas do Mundo.",
  },
  {
    id: "estados-unidos",
    code: "us",
    name: "Estados Unidos",
    continent: "América do Norte",
    capital: "Washington, D.C.",
    languages: ["Inglês"],
    neighbors: ["mexico", "canada"],
    populationBucket: "> 150 milhões",
    curiosity: "Abriga o Grand Canyon e o Vale do Silício, polo global de tecnologia e inovação digital.",
  },
  {
    id: "canada",
    code: "ca",
    name: "Canadá",
    continent: "América do Norte",
    capital: "Ottawa",
    languages: ["Inglês", "Francês"],
    neighbors: ["estados-unidos"],
    populationBucket: "10–50 milhões",
    curiosity: "Possui mais de 60% de todos os lagos naturais de água doce do planeta Terra.",
  },
  {
    id: "portugal",
    code: "pt",
    name: "Portugal",
    continent: "Europa",
    capital: "Lisboa",
    languages: ["Português"],
    neighbors: ["espanha"],
    populationBucket: "10–50 milhões",
    curiosity: "É uma das nações mais antigas da Europa, com fronteiras definidas mantidas desde o século XII.",
  },
  {
    id: "espanha",
    code: "es",
    name: "Espanha",
    continent: "Europa",
    capital: "Madri",
    languages: ["Espanhol"],
    neighbors: ["portugal", "franca"],
    populationBucket: "10–50 milhões",
    curiosity: "É o segundo país do mundo com maior número de cidades Patrimônio Mundial da UNESCO.",
  },
  {
    id: "franca",
    code: "fr",
    name: "França",
    continent: "Europa",
    capital: "Paris",
    languages: ["Francês"],
    neighbors: ["espanha", "alemanha", "italia", "belgica", "suica"],
    populationBucket: "50–150 milhões",
    curiosity: "É o país mais visitado por turistas internacionais no mundo, famoso por sua gastronomia e pela Torre Eiffel.",
  },
  {
    id: "alemanha",
    code: "de",
    name: "Alemanha",
    continent: "Europa",
    capital: "Berlim",
    languages: ["Alemão"],
    neighbors: ["franca", "belgica", "suica", "austria", "polonia"],
    populationBucket: "50–150 milhões",
    curiosity: "Berço da imprensa moderna (Gutenberg) e da física quântica, possui mais de 20.000 castelos históricos.",
  },
  {
    id: "italia",
    code: "it",
    name: "Itália",
    continent: "Europa",
    capital: "Roma",
    languages: ["Italiano"],
    neighbors: ["franca", "suica", "austria"],
    populationBucket: "50–150 milhões",
    curiosity: "Abriga o Coliseu, as ruínas de Pompéia e o Vaticano, o menor estado independente do mundo.",
  },
  {
    id: "belgica",
    code: "be",
    name: "Bélgica",
    continent: "Europa",
    capital: "Bruxelas",
    languages: ["Neerlandês", "Francês", "Alemão"],
    neighbors: ["franca", "alemanha"],
    populationBucket: "10–50 milhões",
    curiosity: "Inventou as batas fritas (*french fries*) e produz mais de 1.500 variedades de chocolates finos artesanais.",
  },
  {
    id: "suica",
    code: "ch",
    name: "Suíça",
    continent: "Europa",
    capital: "Berna",
    languages: ["Alemão", "Francês", "Italiano"],
    neighbors: ["franca", "alemanha", "italia", "austria"],
    populationBucket: "< 10 milhões",
    curiosity: "Conhecida por seus Alpes deslumbrantes, relógios de alta precisão e нейтраlidade diplomática centenária.",
  },
  {
    id: "austria",
    code: "at",
    name: "Áustria",
    continent: "Europa",
    capital: "Viena",
    languages: ["Alemão"],
    neighbors: ["alemanha", "italia", "suica"],
    populationBucket: "< 10 milhões",
    curiosity: "Capital mundial da música clássica, berço de compositores lendários como Mozart, Beethoven e Strauss.",
  },
  {
    id: "polonia",
    code: "pl",
    name: "Polônia",
    continent: "Europa",
    capital: "Varsóvia",
    languages: ["Polonês"],
    neighbors: ["alemanha"],
    populationBucket: "10–50 milhões",
    curiosity: "Terra natal do astrônomo Nicolau Copérnico, que provou que a Terra orbita em volta do Sol.",
  },
  {
    id: "reino-unido",
    code: "gb",
    name: "Reino Unido",
    continent: "Europa",
    capital: "Londres",
    languages: ["Inglês"],
    neighbors: [],
    populationBucket: "50–150 milhões",
    curiosity: "Berço da Revolução Industrial, de William Shakespeare e de bandas icônicas como The Beatles e Queen.",
  },
  {
    id: "japao",
    code: "jp",
    name: "Japão",
    continent: "Ásia",
    capital: "Tóquio",
    languages: ["Japonês"],
    neighbors: [],
    populationBucket: "50–150 milhões",
    curiosity: "Composto por mais de 6.800 ilhas, é a capital mundial do Anime, Mangá e trens-bala de alta velocidade.",
  },
  {
    id: "china",
    code: "cn",
    name: "China",
    continent: "Ásia",
    capital: "Pequim",
    languages: ["Mandarim"],
    neighbors: ["india"],
    populationBucket: "> 150 milhões",
    curiosity: "Possui a Grande Muralha (com mais de 21.000 km) e inventou o papel, a bússola, a pólvora e a seda.",
  },
  {
    id: "india",
    code: "in",
    name: "Índia",
    continent: "Ásia",
    capital: "Nova Déli",
    languages: ["Híndi", "Inglês"],
    neighbors: ["china"],
    populationBucket: "> 150 milhões",
    curiosity: "Abriga o majestoso Taj Mahal e é o berço do Xadrez, da Yoga e do conceito matemático do número Zero.",
  },
  {
    id: "coreia-do-sul",
    code: "kr",
    name: "Coreia do Sul",
    continent: "Ásia",
    capital: "Seul",
    languages: ["Coreano"],
    neighbors: [],
    populationBucket: "50–150 milhões",
    curiosity: "Líder mundial em tecnologia móvel, e-Sports competitivos e fenômenos culturais globais como K-Pop e K-Dramas.",
  },
  {
    id: "egito",
    code: "eg",
    name: "Egito",
    continent: "África",
    capital: "Cairo",
    languages: ["Árabe"],
    neighbors: ["libia"],
    populationBucket: "50–150 milhões",
    curiosity: "Abriga as Pirâmides de Gizé e a Esfinge, uma das civilizações mais fascinantes e antigas da história humana.",
  },
  {
    id: "libia",
    code: "ly",
    name: "Líbia",
    continent: "África",
    capital: "Trípoli",
    languages: ["Árabe"],
    neighbors: ["egito"],
    populationBucket: "< 10 milhões",
    curiosity: "Mais de 90% do seu território é coberto pelo Deserto do Saara, abrigando oásis históricos impressionantes.",
  },
  {
    id: "africa-do-sul",
    code: "za",
    name: "África do Sul",
    continent: "África",
    capital: "Pretória",
    languages: ["Zulu", "Inglês", "Africâner"],
    neighbors: [],
    populationBucket: "50–150 milhões",
    curiosity: "Conhecida como a 'Nação Arco-Íris', possui 11 idiomas oficiais e é famosa por seus safáris selvagens.",
  },
  {
    id: "nigeria",
    code: "ng",
    name: "Nigéria",
    continent: "África",
    capital: "Abuja",
    languages: ["Inglês"],
    neighbors: [],
    populationBucket: "> 150 milhões",
    curiosity: "É o país mais populoso da África e abriga 'Nollywood', a segunda maior indústria de cinema do mundo em volume.",
  },
  {
    id: "australia",
    code: "au",
    name: "Austrália",
    continent: "Oceania",
    capital: "Camberra",
    languages: ["Inglês"],
    neighbors: [],
    populationBucket: "10–50 milhões",
    curiosity: "Abriga a Grande Barreira de Corais e animais únicos no mundo como cangurus, coalas e ornitorrincos.",
  },
  {
    id: "nova-zelandia",
    code: "nz",
    name: "Nova Zelândia",
    continent: "Oceania",
    capital: "Wellington",
    languages: ["Inglês", "Maori"],
    neighbors: [],
    populationBucket: "< 10 milhões",
    curiosity: "Famosa por suas paisagens épicas onde foi filmada a trilogia 'O Senhor dos Anéis' e pelo povo Maori.",
  },
  {
    id: "japao",
    code: "jp",
    name: "Japão",
    continent: "Ásia",
    capital: "Tóquio",
    languages: ["Japonês"],
    neighbors: [],
    populationBucket: "50–150 milhões",
    curiosity: "Composto por mais de 6.800 ilhas, é a capital mundial do Anime, Mangá e trens-bala de alta velocidade.",
  }
];

const BY_ID: ReadonlyMap<string, Country> = new Map(COUNTRIES.map((c) => [c.id, c]));

export function getCountry(id: string): Country | undefined {
  return BY_ID.get(id);
}

export function countryName(id: string): string {
  return BY_ID.get(id)?.name ?? id;
}
