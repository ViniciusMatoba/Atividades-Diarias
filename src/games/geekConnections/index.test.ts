import { describe, expect, it } from "vitest";
import { geekConnections, type GeekConnectionsState } from "./index";

const seed = "2026-07-24:geek-connections";
const fresh = (): GeekConnectionsState => geekConnections.initialState(geekConnections.generateChallenge(seed));

describe("geekConnections.generateChallenge", () => {
  it("é determinístico com 4 grupos e 16 termos", () => {
    const c1 = geekConnections.generateChallenge(seed);
    const c2 = geekConnections.generateChallenge(seed);
    expect(c1).toEqual(c2);
    expect(c1.groups).toHaveLength(4);
    expect(c1.presented).toHaveLength(16);
    expect(Object.keys(c1.termLabels)).toHaveLength(16);
    c1.groups.forEach((g) => expect(g.termIds).toHaveLength(4));
  });

  it("ids de termo são opacos (t0..t15) e não revelam o grupo", () => {
    const c = geekConnections.generateChallenge(seed);
    c.presented.forEach((id) => expect(id).toMatch(/^t\d+$/));
  });
});

describe("geekConnections.applyGuess", () => {
  it("grupo correto é aceito; resolver os 4 → vitória e 1000", () => {
    const challenge = geekConnections.generateChallenge(seed);
    let state = geekConnections.initialState(challenge);
    for (const g of challenge.groups) {
      const out = geekConnections.applyGuess(challenge, state, { terms: g.termIds });
      state = out.state;
    }
    expect(state.solved).toBe(true);
    expect(state.finished).toBe(true);
    expect(geekConnections.score(challenge, state)).toBe(1000);
  });

  it("palpite errado incrementa erros; 4 erros encerram sem vitória", () => {
    const challenge = geekConnections.generateChallenge(seed);
    // 1 termo de cada grupo → nunca é um grupo válido
    const wrong = challenge.groups.map((g) => g.termIds[0]!) as string[];
    let state = geekConnections.initialState(challenge);
    for (let i = 0; i < 4; i++) {
      state = geekConnections.applyGuess(challenge, state, { terms: wrong }).state;
    }
    expect(state.mistakes).toBe(4);
    expect(state.finished).toBe(true);
    expect(state.solved).toBe(false);
  });

  it("detecta 'quase' (3 de 4 certos)", () => {
    const challenge = geekConnections.generateChallenge(seed);
    const g0 = challenge.groups[0]!.termIds;
    const otherTerm = challenge.groups[1]!.termIds[0]!;
    const almost = [g0[0]!, g0[1]!, g0[2]!, otherTerm];
    const out = geekConnections.applyGuess(challenge, fresh(), { terms: almost });
    expect(out.feedback.details?.oneAway).toBe(true);
  });

  it("rejeita palpite com termo inexistente", () => {
    const challenge = geekConnections.generateChallenge(seed);
    expect(() =>
      geekConnections.applyGuess(challenge, fresh(), { terms: ["t0", "t1", "t2", "zzz"] }),
    ).toThrow();
  });
});

describe("geekConnections.parseGuess", () => {
  it("exige exatamente 4 termos", () => {
    expect(() => geekConnections.parseGuess({ terms: ["t0", "t1", "t2"] })).toThrow();
    expect(() => geekConnections.parseGuess({ terms: ["t0", "t1", "t2", "t3"] })).not.toThrow();
  });
});

describe("geekConnections.toPublic", () => {
  it("não revela grupos antes do fim e expõe só id+label", () => {
    const challenge = geekConnections.generateChallenge(seed);
    const pub = geekConnections.toPublic(challenge, geekConnections.initialState(challenge));
    expect(pub.reveal).toBeNull();
    expect(pub.remaining).toHaveLength(16);
    pub.remaining.forEach((t) => expect(Object.keys(t).sort()).toEqual(["id", "label"]));
  });
});
