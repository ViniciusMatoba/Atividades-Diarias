import type { UserDiscoveryState, DailyDiscoveryType } from "../types";

const STORAGE_KEY = "geekdaily_user_discoveries_v1";

function loadFromStorage(): Record<string, UserDiscoveryState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveToStorage(data: Record<string, UserDiscoveryState>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Silently ignore storage quota or private window errors
  }
}

export function getUserDiscoveryState(discoveryId: string): UserDiscoveryState | undefined {
  const store = loadFromStorage();
  return store[discoveryId];
}

export function getUserDiscoveryStates(dateKey: string): Record<string, UserDiscoveryState> {
  const store = loadFromStorage();
  const res: Record<string, UserDiscoveryState> = {};
  for (const [id, state] of Object.entries(store)) {
    if (state.dateKey === dateKey) {
      res[id] = state;
    }
  }
  return res;
}

export function recordViewDiscovery(discoveryId: string, dateKey: string, type: DailyDiscoveryType, contentId: string): UserDiscoveryState {
  const store = loadFromStorage();
  const existing = store[discoveryId] || {
    discoveryId,
    dateKey,
    type,
    contentId,
  };

  if (!existing.viewedAt) {
    existing.viewedAt = new Date().toISOString();
  }

  store[discoveryId] = existing;
  saveToStorage(store);
  return existing;
}

export function revealDiscovery(
  discoveryId: string,
  dateKey: string,
  type: DailyDiscoveryType,
  contentId: string,
  userGuess?: string,
  isCorrect?: boolean,
): UserDiscoveryState {
  const store = loadFromStorage();
  const existing = store[discoveryId] || {
    discoveryId,
    dateKey,
    type,
    contentId,
  };

  existing.viewedAt = existing.viewedAt || new Date().toISOString();
  existing.revealedAt = existing.revealedAt || new Date().toISOString();
  if (userGuess !== undefined) existing.userGuess = userGuess;
  if (isCorrect !== undefined) existing.isCorrect = isCorrect;

  store[discoveryId] = existing;
  saveToStorage(store);
  return existing;
}

export function toggleFavorite(
  discoveryId: string,
  dateKey: string,
  type: DailyDiscoveryType,
  contentId: string,
): UserDiscoveryState {
  const store = loadFromStorage();
  const existing = store[discoveryId] || {
    discoveryId,
    dateKey,
    type,
    contentId,
  };

  existing.isFavorite = !existing.isFavorite;

  store[discoveryId] = existing;
  saveToStorage(store);
  return existing;
}

export function toggleWatchlist(
  discoveryId: string,
  dateKey: string,
  type: DailyDiscoveryType,
  contentId: string,
): UserDiscoveryState {
  const store = loadFromStorage();
  const existing = store[discoveryId] || {
    discoveryId,
    dateKey,
    type,
    contentId,
  };

  existing.inWatchlist = !existing.inWatchlist;

  store[discoveryId] = existing;
  saveToStorage(store);
  return existing;
}

export function getAllFavorites(): UserDiscoveryState[] {
  const store = loadFromStorage();
  return Object.values(store).filter((s) => s.isFavorite);
}

export function getAllWatchlist(): UserDiscoveryState[] {
  const store = loadFromStorage();
  return Object.values(store).filter((s) => s.inWatchlist);
}

export function getAllRevealedHistory(): UserDiscoveryState[] {
  const store = loadFromStorage();
  return Object.values(store).filter((s) => s.revealedAt);
}
