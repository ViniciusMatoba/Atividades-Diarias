/**
 * Países com centroide aproximado (lat/lon) para o Pin do Mundo.
 * Dados factuais aproximados — a coordenada da resposta fica só no servidor.
 */

export interface PinCountry {
  id: string;
  code: string;
  name: string;
  lat: number;
  lon: number;
  curiosity: string;
}

export function getPinFlagUrl(code: string): string {
  return `https://flagcdn.com/w160/${code.toLowerCase()}.png`;
}

export const PIN_COUNTRIES: readonly PinCountry[] = [
  { id: "brasil", code: "br", name: "Brasil", lat: -10, lon: -55, curiosity: "Possui mais de 7.400 km de litoral e a maior bacia hidrográfica do mundo." },
  { id: "argentina", code: "ar", name: "Argentina", lat: -34, lon: -64, curiosity: "A gelada Patagônia argentina abriga a famosa geleira Perito Moreno." },
  { id: "chile", code: "cl", name: "Chile", lat: -35, lon: -71, curiosity: "As Ilhas de Páscoa e os misteriosos Moais pertencem ao território chileno." },
  { id: "peru", code: "pe", name: "Peru", lat: -10, lon: -76, curiosity: "O Lago Titicaca, na fronteira do Peru, é o lago navegável mais alto do planeta." },
  { id: "colombia", code: "co", name: "Colômbia", lat: 4, lon: -73, curiosity: "É o único país da América do Sul com costas tanto no Oceano Pacífico quanto no Mar do Caribe." },
  { id: "venezuela", code: "ve", name: "Venezuela", lat: 7, lon: -66, curiosity: "O Relâmpago do Catatumbo gera até 280 raios por hora sobre o Lago Maracaibo." },
  { id: "estados-unidos", code: "us", name: "Estados Unidos", lat: 39, lon: -98, curiosity: "Yellowstone foi o primeiro Parque Nacional criado no mundo em 1872." },
  { id: "mexico", code: "mx", name: "México", lat: 23, lon: -102, curiosity: "A culinária tradicional mexicana é reconhecida pela UNESCO como Patrimônio Imaterial da Humanidade." },
  { id: "canada", code: "ca", name: "Canadá", lat: 56, lon: -106, curiosity: "Possui a linha costeira mais longa de qualquer país do mundo, com 202.080 km." },
  { id: "portugal", code: "pt", name: "Portugal", lat: 39, lon: -8, curiosity: "A Livraria Lello, no Porto, é considerada uma das mais belas e antigas do mundo." },
  { id: "espanha", code: "es", name: "Espanha", lat: 40, lon: -4, curiosity: "É a maior produtora mundial de azeite de oliva, superando até a Itália." },
  { id: "franca", code: "fr", name: "França", lat: 46, lon: 2, curiosity: "O Museu do Louvre em Paris é o maior museu de arte do mundo." },
  { id: "alemanha", code: "de", name: "Alemanha", lat: 51, lon: 10, curiosity: "A famosa Autobahn possui trechos sem limite oficial de velocidade." },
  { id: "italia", code: "it", name: "Itália", lat: 42, lon: 12, curiosity: "A Itália possui dois microestados inteiramente encravados em seu território: San Marino e o Vaticano." },
  { id: "reino-unido", code: "gb", name: "Reino Unido", lat: 54, lon: -2, curiosity: "O Big Ben é na verdade o nome do grande sino dentro da Elizabeth Tower." },
  { id: "polonia", code: "pl", name: "Polônia", lat: 52, lon: 19, curiosity: "O Castelo de Malbork na Polônia é o maior castelo do mundo em área construída." },
  { id: "russia", code: "ru", name: "Rússia", lat: 61, lon: 90, curiosity: "É o maior país do mundo em área e abrange 11 fusos horários diferentes." },
  { id: "egito", code: "eg", name: "Egito", lat: 26, lon: 30, curiosity: "O Rio Nilo é um dos rios mais longos do mundo e foi vital para a civilização egípcia." },
  { id: "nigeria", code: "ng", name: "Nigéria", lat: 9, lon: 8, curiosity: "É o país com a maior diversidade de borboletas do continente africano." },
  { id: "africa-do-sul", code: "za", name: "África do Sul", lat: -30, lon: 25, curiosity: "É o único país do mundo com TRÊS capitais oficiais (Pretória, Cidade do Cabo e Bloemfontein)." },
  { id: "quenia", code: "ke", name: "Quênia", lat: 0, lon: 38, curiosity: "Famoso pela Grande Migração anual de milhões de gnus e zebras no Parque Masai Mara." },
  { id: "china", code: "cn", name: "China", lat: 35, lon: 104, curiosity: "Todos os ursos pandas gigantes do mundo pertencem oficialmente ao governo chinês." },
  { id: "india", code: "in", name: "Índia", lat: 21, lon: 78, curiosity: "Kumbh Mela é a maior reunião humana da Terra, visível até do espaço sideral." },
  { id: "japao", code: "jp", name: "Japão", lat: 36, lon: 138, curiosity: "O Monte Fuji é um vulcão ativo venerado como uma montanha sagrada." },
  { id: "coreia-do-sul", code: "kr", name: "Coreia do Sul", lat: 36, lon: 128, curiosity: "Possui a velocidade média de internet banda larga mais rápida do planeta." },
  { id: "australia", code: "au", name: "Austrália", lat: -25, lon: 133, curiosity: "Possui mais de 10.000 praias; se você visitasse uma nova praia por dia, levaria 27 anos." },
  { id: "nova-zelandia", code: "nz", name: "Nova Zelândia", lat: -42, lon: 172, curiosity: "Foi o primeiro país do mundo a conceder o direito de voto às mulheres em 1893." },
  { id: "indonesia", code: "id", name: "Indonésia", lat: -2, lon: 118, curiosity: "É o maior país arquipélago do mundo, composto por mais de 17.000 ilhas." },
  { id: "arabia-saudita", code: "sa", name: "Arábia Saudita", lat: 24, lon: 45, curiosity: "Possui o Rub' al-Khali, a maior área contínua de deserto de areia do mundo." },
  { id: "turquia", code: "tr", name: "Turquia", lat: 39, lon: 35, curiosity: "Istambul é a única grande metrópole do mundo situada em dois continentes simultaneamente (Europa e Ásia)." },
];

const BY_ID: ReadonlyMap<string, PinCountry> = new Map(PIN_COUNTRIES.map((c) => [c.id, c]));

export function getPinCountry(id: string): PinCountry | undefined {
  return BY_ID.get(id);
}
