import { describe, expect, it } from "vitest";
import { worldPin } from "./index";
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

describe("worldPin.applyGuess", () => {
  it("clique exato no centroide → 1000 e bullseye", () => {
    const c = worldPin.generateChallenge(seed);
    const ans = getPinCountry(c.countryId)!;
    const out = worldPin.applyGuess(c, worldPin.initialState(c), { lat: ans.lat, lon: ans.lon });
    expect(out.solved).toBe(true);
    expect(out.finished).toBe(true);
    expect(worldPin.score(c, out.state)).toBe(1000);
  });

  it("clique distante pontua pouco/zero", () => {
    const c = { countryId: "brasil" };
    // clica no Japão (bem longe do Brasil)
    const out = worldPin.applyGuess(c, worldPin.initialState(c), { lat: 36, lon: 138 });
    expect(out.solved).toBe(false);
    expect(worldPin.score(c, out.state)).toBe(0);
  });

  it("não revela o centroide antes de enviar", () => {
    const c = worldPin.generateChallenge(seed);
    const pub = worldPin.toPublic(c, worldPin.initialState(c));
    expect(pub.result).toBeNull();
    expect(pub.countryName).toBeTruthy();
  });

  it("revela alvo + distância após enviar", () => {
    const c = worldPin.generateChallenge(seed);
    const state = worldPin.applyGuess(c, worldPin.initialState(c), { lat: 0, lon: 0 }).state;
    const pub = worldPin.toPublic(c, state);
    expect(pub.result).not.toBeNull();
    expect(pub.result!.distanceKm).toBeGreaterThanOrEqual(0);
  });

  it("rejeita coordenadas fora do intervalo", () => {
    expect(() => worldPin.parseGuess({ lat: 200, lon: 0 })).toThrow();
    expect(() => worldPin.parseGuess({ lat: 0, lon: 999 })).toThrow();
  });
});

describe("dados", () => {
  it("todos os países têm coordenadas válidas", () => {
    PIN_COUNTRIES.forEach((c) => {
      expect(c.lat).toBeGreaterThanOrEqual(-90);
      expect(c.lat).toBeLessThanOrEqual(90);
      expect(c.lon).toBeGreaterThanOrEqual(-180);
      expect(c.lon).toBeLessThanOrEqual(180);
    });
  });
});
