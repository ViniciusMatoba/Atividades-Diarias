import { describe, expect, it } from "vitest";
import { scoreGeekConnections } from "./scoring";

describe("scoreGeekConnections", () => {
  it("4 grupos sem erro → 1000", () => {
    expect(scoreGeekConnections({ solvedGroups: 4, mistakes: 0 })).toBe(1000);
  });

  it("0 grupos → 0", () => {
    expect(scoreGeekConnections({ solvedGroups: 0, mistakes: 0 })).toBe(0);
  });

  it("penaliza erros com piso de 0.4", () => {
    // 4 grupos, 4 erros → 1000 * 1 * max(0.4, 1-0.6=0.4) = 400
    expect(scoreGeekConnections({ solvedGroups: 4, mistakes: 4 })).toBe(400);
  });

  it("pontua parcial por grupos resolvidos", () => {
    // 2 grupos, 1 erro → 0.5 * 1000 * 0.85 = 425
    expect(scoreGeekConnections({ solvedGroups: 2, mistakes: 1 })).toBe(425);
  });
});
