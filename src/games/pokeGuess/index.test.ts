import { describe, expect, it } from "vitest";
import { pokeGuess, type PokeGuessState } from "./index";
import { POKEMON, getPokemon } from "./data/pokemon";

const seed = "2026-07-24:poke-guess";

describe("pokeGuess.generateChallenge", () => {
  it("é determinístico e escolhe um Pokémon existente", () => {
    const c1 = pokeGuess.generateChallenge(seed);
    const c2 = pokeGuess.generateChallenge(seed);
    expect(c1.answerId).toBe(c2.answerId);
    expect(getPokemon(c1.answerId)).toBeDefined();
  });
});

describe("pokeGuess.applyGuess", () => {
  it("acerto de primeira → resolvido e 1000", () => {
    const c = pokeGuess.generateChallenge(seed);
    const out = pokeGuess.applyGuess(c, pokeGuess.initialState(c), { pokemonId: c.answerId });
    expect(out.solved).toBe(true);
    expect(pokeGuess.score(c, out.state)).toBe(1000);
  });

  it("erra e encerra após 8 tentativas com 0 pontos", () => {
    const c = pokeGuess.generateChallenge(seed);
    const wrong = POKEMON.find((p) => p.id !== c.answerId)!.id;
    let state: PokeGuessState = pokeGuess.initialState(c);
    for (let i = 0; i < 8; i++) state = pokeGuess.applyGuess(c, state, { pokemonId: wrong }).state;
    expect(state.finished).toBe(true);
    expect(state.solved).toBe(false);
    expect(pokeGuess.score(c, state)).toBe(0);
  });

  it("rejeita Pokémon inexistente", () => {
    expect(() => pokeGuess.parseGuess({ pokemonId: "missingno" })).toThrow();
  });
});

describe("pokeGuess.toPublic comparações", () => {
  it("marca acerto/erro de atributos e direção numérica sem revelar a resposta", () => {
    // resposta = charizard (Fogo/Voador, Vermelho, stage 3, 1.7m, 90.5kg)
    const c = { answerId: "charizard" };
    // palpite = charmander (Fogo, Vermelho, stage 1, 0.6m, 8.5kg)
    const state = pokeGuess.applyGuess(c, pokeGuess.initialState(c), { pokemonId: "charmander" }).state;
    const pub = pokeGuess.toPublic(c, state);
    const row = pub.rows[0]!;
    expect(row.type1.match).toBe(true); // Fogo == Fogo
    expect(row.type2.match).toBe(false); // null != Voador
    expect(row.color.match).toBe(true); // Vermelho
    expect(row.stage.dir).toBe("up"); // resposta (3) > palpite (1)
    expect(row.height.dir).toBe("up"); // 1.7 > 0.6
    expect(row.weight.dir).toBe("up"); // 90.5 > 8.5
    expect(pub.answer).toBeNull(); // não revela antes do fim
  });
});
