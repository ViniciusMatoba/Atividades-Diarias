"use client";

import { useState, useEffect } from "react";
import { getOrCreateUserSeedId } from "./userSeed";
import { getGameModule } from "@/games/core/registry";
import type { GameId } from "@/games/core/types";

export function usePersistedGameState<TPublic, TState>(
  dateKey: string,
  gameId: string,
  initialPublic: TPublic,
  initialState: TState,
  userId?: string | null,
) {
  const [userSeedId, setUserSeedId] = useState<string>("");

  useEffect(() => {
    setUserSeedId(getOrCreateUserSeedId(userId));
  }, [userId]);

  const effectiveSeedId = userSeedId || (typeof window !== "undefined" ? getOrCreateUserSeedId(userId) : "");
  const storageKey = effectiveSeedId
    ? `geekdaily:v3:state:${dateKey}:${effectiveSeedId}:${gameId}`
    : `geekdaily:v3:state:${dateKey}:${gameId}`;

  const [pub, setPub] = useState<TPublic>(() => {
    if (typeof window === "undefined") return initialPublic;
    try {
      const sKey = effectiveSeedId
        ? `geekdaily:v3:state:${dateKey}:${effectiveSeedId}:${gameId}`
        : `geekdaily:v3:state:${dateKey}:${gameId}`;
      const saved = localStorage.getItem(sKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.public) return parsed.public;
      }
      const mod = getGameModule(gameId as GameId);
      if (mod && effectiveSeedId) {
        const challenge = mod.generateChallenge(`${dateKey}:${effectiveSeedId}:${gameId}`);
        return mod.toPublic(challenge, mod.initialState(challenge));
      }
    } catch {
      // fallback
    }
    return initialPublic;
  });

  const [state, setState] = useState<TState>(() => {
    if (typeof window === "undefined") return initialState;
    try {
      const sKey = effectiveSeedId
        ? `geekdaily:v3:state:${dateKey}:${effectiveSeedId}:${gameId}`
        : `geekdaily:v3:state:${dateKey}:${gameId}`;
      const saved = localStorage.getItem(sKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.state) return parsed.state;
      }
      const mod = getGameModule(gameId as GameId);
      if (mod && effectiveSeedId) {
        const challenge = mod.generateChallenge(`${dateKey}:${effectiveSeedId}:${gameId}`);
        return mod.initialState(challenge);
      }
    } catch {
      // fallback
    }
    return initialState;
  });

  useEffect(() => {
    if (!effectiveSeedId || typeof window === "undefined") return;
    try {
      const sKey = `geekdaily:v3:state:${dateKey}:${effectiveSeedId}:${gameId}`;
      const saved = localStorage.getItem(sKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.public && parsed?.state) {
          setPub(parsed.public);
          setState(parsed.state);
          return;
        }
      }
      const mod = getGameModule(gameId as GameId);
      if (mod) {
        const challenge = mod.generateChallenge(`${dateKey}:${effectiveSeedId}:${gameId}`);
        const st = mod.initialState(challenge);
        const pb = mod.toPublic(challenge, st);
        setPub(pb);
        setState(st);
        localStorage.setItem(sKey, JSON.stringify({ public: pb, state: st }));
      }
    } catch {
      // fallback
    }
  }, [effectiveSeedId, dateKey, gameId]);

  useEffect(() => {
    if (typeof window === "undefined" || !storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ public: pub, state }));
    } catch {
      // storage
    }
  }, [storageKey, pub, state]);

  function updateGame(newPublic: TPublic, newState: TState) {
    setPub(newPublic);
    setState(newState);
  }

  function resetGame() {
    if (typeof window !== "undefined" && storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // storage
      }
    }
    if (effectiveSeedId) {
      const mod = getGameModule(gameId as GameId);
      if (mod) {
        const randomSeed = `${dateKey}:${effectiveSeedId}:${gameId}:${Date.now()}`;
        const challenge = mod.generateChallenge(randomSeed);
        const st = mod.initialState(challenge);
        const pb = mod.toPublic(challenge, st);
        setPub(pb);
        setState(st);
        return;
      }
    }
    setPub(initialPublic);
    setState(initialState);
  }

  return { pub, state, updateGame, resetGame, userSeedId: effectiveSeedId };
}
