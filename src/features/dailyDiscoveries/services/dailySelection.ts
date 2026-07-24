import { getDailyKey } from "@/lib/dailyKey";
import { hashSeed } from "@/games/core/seed";
import { POKEMON, type Pokemon } from "@/games/pokeGuess/data/pokemon";
import { COUNTRIES, type Country } from "@/games/mysteryCountry/data/countries";
import { MOVIES_SERIES } from "../data/moviesSeries";
import type { DailyDiscovery, DailyDiscoveryType, PokemonTeaser, CountryTeaser, MovieSeriesTeaser, MovieSeries } from "../types";

function buildPokemonTeaser(pokemon: Pokemon): PokemonTeaser {
  return {
    type1: pokemon.type1,
    generation: pokemon.generation,
    heightApprox: `~${pokemon.heightM}m`,
    clueText: `Conhecido pela cor ${pokemon.color.toLowerCase()} e estágio evolutivo ${pokemon.stage}.`,
  };
}

function buildCountryTeaser(country: Country): CountryTeaser {
  // Embaralha deterministicamente os caracteres da capital sem variação em sort()
  const chars = country.capital.split("");
  const scrambled = chars
    .map((char, i) => ({ char, i, sortKey: (country.id.charCodeAt(i % country.id.length) + i * 7) % 13 }))
    .sort((a, b) => a.sortKey - b.sortKey || a.char.charCodeAt(0) - b.char.charCodeAt(0) || a.i - b.i)
    .map((item) => item.char)
    .join("");

  return {
    continent: country.continent,
    languages: country.languages,
    clueText: `Fica na região do continente ${country.continent} e possui capital iniciada por "${country.capital.charAt(0)}".`,
    scrambledCapital: scrambled,
  };
}

function buildMovieSeriesTeaser(media: MovieSeries): MovieSeriesTeaser {
  return {
    year: media.year,
    genres: media.genres,
    directorOrCreator: media.directorOrCreator,
    clueText: `Lançado em ${media.year} no gênero ${media.genres.join(", ")} dirigido por ${media.directorOrCreator}.`,
  };
}

/**
 * Seleciona deterministicamente as 3 Descobertas do Dia para a data especificada (America/Sao_Paulo).
 */
export function getDailyDiscoveries(dateKey: string = getDailyKey()): DailyDiscovery[] {
  // Seeds únicas por tipo e data para garantia de variação
  const seedPoke = hashSeed(`discovery:pokemon:${dateKey}`);
  const seedCountry = hashSeed(`discovery:country:${dateKey}`);
  const seedMedia = hashSeed(`discovery:movie:${dateKey}`);

  const pokeIndex = Math.abs(seedPoke) % POKEMON.length;
  const pokemon = POKEMON[pokeIndex] ?? POKEMON[0]!;

  const countryIndex = Math.abs(seedCountry) % COUNTRIES.length;
  const country = COUNTRIES[countryIndex] ?? COUNTRIES[0]!;

  const mediaIndex = Math.abs(seedMedia) % MOVIES_SERIES.length;
  const media = MOVIES_SERIES[mediaIndex] ?? MOVIES_SERIES[0]!;

  const discoveries: DailyDiscovery[] = [
    {
      id: `${dateKey}:pokemon`,
      dateKey,
      type: "pokemon",
      contentId: pokemon.id,
      title: `Pokémon do Dia: ${pokemon.name}`,
      content: pokemon,
      teaser: buildPokemonTeaser(pokemon),
    },
    {
      id: `${dateKey}:country`,
      dateKey,
      type: "country",
      contentId: country.id,
      title: `País do Dia: ${country.name}`,
      content: country,
      teaser: buildCountryTeaser(country),
    },
    {
      id: `${dateKey}:${media.type}`,
      dateKey,
      type: media.type,
      contentId: media.id,
      title: `${media.type === "movie" ? "Filme" : "Série"} do Dia: ${media.title}`,
      content: media,
      teaser: buildMovieSeriesTeaser(media),
    },
  ];

  return discoveries;
}

export function getSingleDiscovery(dateKey: string, type: DailyDiscoveryType): DailyDiscovery | undefined {
  const all = getDailyDiscoveries(dateKey);
  return all.find((d) => d.type === type || (type === "movie" && d.type === "series"));
}
