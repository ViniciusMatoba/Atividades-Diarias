import { describe, expect, it, beforeEach } from "vitest";
import {
  revealDiscovery,
  toggleFavorite,
  toggleWatchlist,
  getUserDiscoveryState,
  getAllFavorites,
  getAllWatchlist,
} from "./userDiscoveries";

describe("userDiscoveries service", () => {
  beforeEach(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }
  });

  it("registra revelação de descoberta", () => {
    const id = "2026-07-24:pokemon";
    const st = revealDiscovery(id, "2026-07-24", "pokemon", "25", "Pikachu", true);

    expect(st.revealedAt).toBeDefined();
    expect(st.userGuess).toBe("Pikachu");
    expect(st.isCorrect).toBe(true);

    const saved = getUserDiscoveryState(id);
    expect(saved?.revealedAt).toEqual(st.revealedAt);
  });

  it("alterna estado de favorito de forma idempotente", () => {
    const id = "2026-07-24:country";
    const st1 = toggleFavorite(id, "2026-07-24", "country", "BR");
    expect(st1.isFavorite).toBe(true);
    expect(getAllFavorites()).toHaveLength(1);

    const st2 = toggleFavorite(id, "2026-07-24", "country", "BR");
    expect(st2.isFavorite).toBe(false);
    expect(getAllFavorites()).toHaveLength(0);
  });

  it("alterna estado da lista Quero Assistir", () => {
    const id = "2026-07-24:movie";
    const st1 = toggleWatchlist(id, "2026-07-24", "movie", "movie-interstellar");
    expect(st1.inWatchlist).toBe(true);
    expect(getAllWatchlist()).toHaveLength(1);

    const st2 = toggleWatchlist(id, "2026-07-24", "movie", "movie-interstellar");
    expect(st2.inWatchlist).toBe(false);
    expect(getAllWatchlist()).toHaveLength(0);
  });
});
