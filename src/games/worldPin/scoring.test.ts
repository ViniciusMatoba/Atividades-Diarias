import { describe, expect, it } from "vitest";
import { haversineKm, scoreWorldPin, WORLD_PIN_CONFIG } from "./scoring";

describe("haversineKm", () => {
  it("é 0 para o mesmo ponto", () => {
    expect(haversineKm({ lat: 0, lon: 0 }, { lat: 0, lon: 0 })).toBe(0);
  });
  it("aproxima distâncias conhecidas (~equador 1° ≈ 111km)", () => {
    const d = haversineKm({ lat: 0, lon: 0 }, { lat: 0, lon: 1 });
    expect(d).toBeGreaterThan(105);
    expect(d).toBeLessThan(115);
  });
});

describe("scoreWorldPin", () => {
  it("clique exato → 1000", () => {
    expect(scoreWorldPin(0)).toBe(1000);
  });
  it("distância >= Dmax → 0", () => {
    expect(scoreWorldPin(WORLD_PIN_CONFIG.maxDistanceKm)).toBe(0);
    expect(scoreWorldPin(9999)).toBe(0);
  });
  it("cai linearmente", () => {
    expect(scoreWorldPin(2500)).toBe(500);
  });
});
