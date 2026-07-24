import { describe, expect, it } from "vitest";
import { bearingDirection, haversineKm, proximityPct, scoreWorldPin } from "./scoring";

describe("haversineKm", () => {
  it("é 0 para o mesmo ponto", () => {
    expect(haversineKm({ lat: 0, lon: 0 }, { lat: 0, lon: 0 })).toBe(0);
  });
  it("aproxima ~111km por grau no equador", () => {
    const d = haversineKm({ lat: 0, lon: 0 }, { lat: 0, lon: 1 });
    expect(d).toBeGreaterThan(105);
    expect(d).toBeLessThan(115);
  });
});

describe("bearingDirection", () => {
  it("aponta Leste quando o alvo está a leste", () => {
    expect(bearingDirection({ lat: 0, lon: 0 }, { lat: 0, lon: 20 })).toBe("Leste");
  });
  it("aponta Norte quando o alvo está ao norte", () => {
    expect(bearingDirection({ lat: 0, lon: 0 }, { lat: 20, lon: 0 })).toBe("Norte");
  });
  it("aponta Sul quando o alvo está ao sul", () => {
    expect(bearingDirection({ lat: 10, lon: 0 }, { lat: -20, lon: 0 })).toBe("Sul");
  });
});

describe("proximityPct", () => {
  it("100 para distância 0 e cai com a distância", () => {
    expect(proximityPct(0)).toBe(100);
    expect(proximityPct(20015)).toBe(0);
    expect(proximityPct(10000)).toBeGreaterThan(40);
  });
});

describe("scoreWorldPin (por tentativas)", () => {
  it("acerto de primeira → 1000", () => {
    expect(scoreWorldPin(1, true)).toBe(1000);
  });
  it("cai a cada tentativa", () => {
    expect(scoreWorldPin(2, true)).toBe(Math.round(1000 * (1 - 1 / 6)));
    expect(scoreWorldPin(6, true)).toBe(Math.round(1000 * (1 - 5 / 6)));
  });
  it("não acertou → 0", () => {
    expect(scoreWorldPin(3, false)).toBe(0);
  });
});
