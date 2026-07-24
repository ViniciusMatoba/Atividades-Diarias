import { describe, expect, it } from "vitest";
import { worldPin, type WorldPinState } from "./index";
import { getPinCountry, PIN_COUNTRIES } from "./data/pinCountries";

const seed = "2026-07-24:world-pin";

describe("worldPin.generateChallenge", () => {
  it("é determinístico e escolhe um país existente", () => {
    const c1 = worldPin.generateChallenge(seed);
    const c2 = worldPin.generateChallenge(seed);
    expect(c1.countryId).toBe(c2.countryId);
    expect(getPinCountry(c1.countryId)).toBeDefined();
  });
});

describe("worldPin.applyGuess (adivinhar o país)", () => {
  it("acerto → resolvido, finished e 1000 na 1ª tentativa", () => {
    const c = worldPin.generateChallenge(seed);
    const out = worldPin.applyGuess(c, worldPin.initialState(c), { countryId: c.countryId });
    expect(out.solved).toBe(true);
    expect(out.finished).toBe(true);
    expect(worldPin.score(c, out.state)).toBe(1000);
  });

  it("erro revela a distância, sem encerrar antes do limite", () => {
    const c = { countryId: "brasil" };
    const wrong = "japao";
    const out = worldPin.applyGuess(c, worldPin.initialState(c), { countryId: wrong });
    expect(out.solved).toBe(false);
    expect(out.finished).toBe(false);
    const pub = worldPin.toPublic(c, out.state);
    const row = pub.guesses[0]!;
    expect(row.distanceKm).toBeGreaterThan(0);
    expect(pub.guessesRemaining).toBe(5);
  });

  it("encerra após 6 tentativas erradas com 0 pontos", () => {
    const c = worldPin.generateChallenge(seed);
    const wrong = PIN_COUNTRIES.find((p) => p.id !== c.countryId)!.id;
    let state: WorldPinState = worldPin.initialState(c);
    for (let i = 0; i < 6; i++) state = worldPin.applyGuess(c, state, { countryId: wrong }).state;
    expect(state.finished).toBe(true);
    expect(state.solved).toBe(false);
    expect(worldPin.score(c, state)).toBe(0);
  });

  it("penaliza tentativas antes do acerto", () => {
    const c = worldPin.generateChallenge(seed);
    const wrong = PIN_COUNTRIES.find((p) => p.id !== c.countryId)!.id;
    let state = worldPin.initialState(c);
    state = worldPin.applyGuess(c, state, { countryId: wrong }).state;
    state = worldPin.applyGuess(c, state, { countryId: c.countryId }).state;
    expect(worldPin.score(c, state)).toBe(Math.round(1000 * (1 - 1 / 6))); // 2ª tentativa
  });

  it("rejeita país inexistente", () => {
    expect(() => worldPin.parseGuess({ countryId: "narnia" })).toThrow();
  });
});

describe("worldPin.toPublic", () => {
  it("mostra o pino (localização) mas esconde o país até o fim", () => {
    const c = worldPin.generateChallenge(seed);
    const answer = getPinCountry(c.countryId)!;
    const pub = worldPin.toPublic(c, worldPin.initialState(c));
    expect(pub.pin).toEqual({ lat: answer.lat, lon: answer.lon });
    expect(pub.answer).toBeNull();
    expect(pub.countryList.length).toBe(PIN_COUNTRIES.length);
  });

  it("revela o país (nome/bandeira/curiosidade) ao terminar", () => {
    const c = worldPin.generateChallenge(seed);
    const state = worldPin.applyGuess(c, worldPin.initialState(c), { countryId: c.countryId }).state;
    const pub = worldPin.toPublic(c, state);
    expect(pub.answer?.name).toBe(getPinCountry(c.countryId)!.name);
    expect(pub.answer?.code).toBeTruthy();
  });
});
