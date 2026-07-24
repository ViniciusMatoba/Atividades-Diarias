"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { getFirebaseAuth, getDb, isFirebaseClientConfigured } from "./client";
import { getDailyKey } from "@/lib/dailyKey";
import type { StarRating } from "@/lib/stars";

export interface ProfileData {
  username: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalScore: number;
  gamesCompleted: number;
  lastCompletedKey: string | null;
}

export interface TodayResult {
  gameId: string;
  score: number;
  stars: StarRating;
}

interface AuthContextValue {
  user: User | null;
  profile: ProfileData | null;
  todayResults: TodayResult[];
  loading: boolean;
  configured: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [todayResults, setTodayResults] = useState<TodayResult[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async (uid: string) => {
    const db = getDb();
    const dateKey = getDailyKey();
    const [profileSnap, resultsSnap] = await Promise.all([
      getDoc(doc(db, "profiles", uid)),
      getDocs(
        query(collection(db, "officialResults"), where("uid", "==", uid), where("dateKey", "==", dateKey)),
      ),
    ]);
    setProfile(profileSnap.exists() ? (profileSnap.data() as ProfileData) : null);
    setTodayResults(
      resultsSnap.docs.map((d) => ({
        gameId: d.get("gameId") as string,
        score: d.get("score") as number,
        stars: (d.get("stars") as StarRating) ?? 1,
      })),
    );
  }, []);

  const refresh = useCallback(async () => {
    if (user) await loadUserData(user.uid);
  }, [user, loadUserData]);

  useEffect(() => {
    if (!isFirebaseClientConfigured) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(getFirebaseAuth(), async (u) => {
      setUser(u);
      if (u) {
        await loadUserData(u.uid);
      } else {
        setProfile(null);
        setTodayResults([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [loadUserData]);

  return (
    <AuthContext.Provider
      value={{ user, profile, todayResults, loading, configured: isFirebaseClientConfigured, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthCtx(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthCtx deve ser usado dentro de <AuthProvider>");
  return ctx;
}
