import { describe, expect, it } from "vitest";
import { getDailyDiscoveries, getSingleDiscovery } from "./dailySelection";

describe("dailySelection service", () => {
  it("gera 3 descobertas determinísticas para a mesma data", () => {
    const key = "2026-07-24";
    const d1 = getDailyDiscoveries(key);
    const d2 = getDailyDiscoveries(key);

    expect(d1).toHaveLength(3);
    expect(d1).toEqual(d2);
    expect(d1[0]?.type).toBe("pokemon");
    expect(d1[1]?.type).toBe("country");
    expect(["movie", "series"]).toContain(d1[2]?.type);
  });

  it("gera novos conteúdos ao mudar de data", () => {
    const d1 = getDailyDiscoveries("2026-07-24");
    const d2 = getDailyDiscoveries("2026-07-25");

    expect(d1[0]?.id).not.toEqual(d2[0]?.id);
  });

  it("recupera uma descoberta específica por tipo", () => {
    const key = "2026-07-24";
    const poke = getSingleDiscovery(key, "pokemon");
    expect(poke).toBeDefined();
    expect(poke?.type).toBe("pokemon");
  });
});
