"use client";

import { useState, useEffect } from "react";

export function usePersistedGameState<TPublic, TState>(
  dateKey: string,
  gameId: string,
  initialPublic: TPublic,
  initialState: TState,
) {
  const storageKey = `geekdaily:v1:state:${dateKey}:${gameId}`;

  const [pub, setPub] = useState<TPublic>(() => {
    if (typeof window === "undefined") return initialPublic;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.public) return parsed.public;
      }
    } catch {
      // fallback
    }
    return initialPublic;
  });

  const [state, setState] = useState<TState>(() => {
    if (typeof window === "undefined") return initialState;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.state) return parsed.state;
      }
    } catch {
      // fallback
    }
    return initialState;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ public: pub, state }));
    } catch {
      // storage quota
    }
  }, [storageKey, pub, state]);

  function updateGame(newPublic: TPublic, newState: TState) {
    setPub(newPublic);
    setState(newState);
  }

  function resetGame() {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // storage
      }
    }
    setPub(initialPublic);
    setState(initialState);
  }

  return { pub, state, updateGame, resetGame };
}
