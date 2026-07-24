import { describe, expect, it } from "vitest";
import { whoCameFirst } from "./index";
import { getItem } from "./data/items";

const seed = "2026-07-24:who-came-first";

function correctOrder(itemIds: string[]): string[] {
  return [...itemIds].sort((a, b) => (getItem(a)?.year ?? 0) - (getItem(b)?.year ?? 0));
}

describe("whoCameFirst.generateChallenge", () => {
  it("é determinístico e seleciona 5 itens válidos", () => {
    const c1 = whoCameFirst.generateChallenge(seed);
    const c2 = whoCameFirst.generateChallenge(seed);
    expect(c1).toEqual(c2);
    expect(c1.itemIds).toHaveLength(5);
    c1.itemIds.forEach((id) => expect(getItem(id)).toBeDefined());
  });

  it("apresenta uma permutação dos itens, não já na ordem correta", () => {
    const c = whoCameFirst.generateChallenge(seed);
    expect([...c.presented].sort()).toEqual([...c.itemIds].sort());
    expect(c.presented).not.toEqual(correctOrder(c.itemIds));
  });
});

describe("whoCameFirst.applyGuess", () => {
  it("ordem cronológica perfeita → resolvido e 1000 pontos", () => {
    const c = whoCameFirst.generateChallenge(seed);
    const state = whoCameFirst.initialState(c);
    const out = whoCameFirst.applyGuess(c, state, { order: correctOrder(c.itemIds) });
    expect(out.solved).toBe(true);
    expect(out.finished).toBe(true);
    expect(whoCameFirst.score(c, out.state)).toBe(1000);
  });

  it("ordem totalmente invertida → 0 pontos, não resolvido", () => {
    const c = whoCameFirst.generateChallenge(seed);
    const state = whoCameFirst.initialState(c);
    const out = whoCameFirst.applyGuess(c, state, { order: [...correctOrder(c.itemIds)].reverse() });
    expect(out.solved).toBe(false);
    expect(whoCameFirst.score(c, out.state)).toBe(0);
  });

  it("rejeita ordenação que não é permutação exata dos itens", () => {
    const c = whoCameFirst.generateChallenge(seed);
    const state = whoCameFirst.initialState(c);
    const bad = [...c.itemIds.slice(0, 4), "item-inexistente"];
    expect(() => whoCameFirst.applyGuess(c, state, { order: bad })).toThrow();
  });

  it("não altera partida já enviada (idempotência)", () => {
    const c = whoCameFirst.generateChallenge(seed);
    const submitted = whoCameFirst.applyGuess(c, whoCameFirst.initialState(c), {
      order: correctOrder(c.itemIds),
    }).state;
    const again = whoCameFirst.applyGuess(c, submitted, { order: [...c.itemIds].reverse() });
    expect(again.state).toEqual(submitted);
  });
});

describe("whoCameFirst.toPublic", () => {
  it("não vaza anos antes de enviar", () => {
    const c = whoCameFirst.generateChallenge(seed);
    const pub = whoCameFirst.toPublic(c, whoCameFirst.initialState(c));
    expect(pub.reveal).toBeNull();
    expect(pub.items).toHaveLength(5);
    // cada item exposto tem apenas id e label
    pub.items.forEach((it) => expect(Object.keys(it).sort()).toEqual(["id", "label"]));
  });

  it("revela a ordem correta após enviar", () => {
    const c = whoCameFirst.generateChallenge(seed);
    const submitted = whoCameFirst.applyGuess(c, whoCameFirst.initialState(c), {
      order: correctOrder(c.itemIds),
    }).state;
    const pub = whoCameFirst.toPublic(c, submitted);
    expect(pub.reveal).not.toBeNull();
    expect(pub.reveal!.correct.map((x) => x.id)).toEqual(correctOrder(c.itemIds));
  });
});
