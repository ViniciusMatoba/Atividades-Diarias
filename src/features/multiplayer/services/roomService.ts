import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { getDb, isFirebaseClientConfigured } from "@/lib/firebase/client";
import {
  IMPOSTOR_WORDS_CATALOG,
  type ImpostorRoom,
  type MultiplayerPlayer,
  type PlayerHint,
  type PlayerVote,
} from "../types";

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "GEEK-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function subscribeToRoom(roomId: string, onUpdate: (room: ImpostorRoom | null) => void): () => void {
  if (typeof window === "undefined") return () => {};

  if (isFirebaseClientConfigured) {
    try {
      const db = getDb();
      const ref = doc(db, "multiplayerRooms", roomId.toUpperCase());
      return onSnapshot(
        ref,
        (snap) => {
          if (snap.exists()) {
            onUpdate(snap.data() as ImpostorRoom);
          } else {
            onUpdate(null);
          }
        },
        () => {
          onUpdate(getRoomFromLocalStorage(roomId));
        },
      );
    } catch {
      // fallback
    }
  }

  // Fallback para localStorage + BroadcastChannel
  const updateLocal = () => onUpdate(getRoomFromLocalStorage(roomId));
  updateLocal();

  let bc: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== "undefined") {
    bc = new BroadcastChannel(`impostor_room_${roomId.toUpperCase()}`);
    bc.onmessage = () => updateLocal();
  }

  const interval = setInterval(updateLocal, 1000);

  return () => {
    clearInterval(interval);
    if (bc) bc.close();
  };
}

function getRoomFromLocalStorage(roomId: string): ImpostorRoom | null {
  try {
    const raw = localStorage.getItem(`impostor_room:${roomId.toUpperCase()}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveRoomToLocalStorage(room: ImpostorRoom) {
  try {
    localStorage.setItem(`impostor_room:${room.id}`, JSON.stringify(room));
    if (typeof BroadcastChannel !== "undefined") {
      const bc = new BroadcastChannel(`impostor_room_${room.id}`);
      bc.postMessage("update");
      bc.close();
    }
  } catch {
    // quota
  }
}

export async function createRoom(hostPlayer: MultiplayerPlayer): Promise<ImpostorRoom> {
  const roomId = generateRoomCode();
  const room: ImpostorRoom = {
    id: roomId,
    createdAt: Date.now(),
    hostId: hostPlayer.id,
    status: "lobby",
    category: "",
    secretWord: "",
    impostorId: "",
    players: [hostPlayer],
    hints: [],
    votes: [],
  };

  saveRoomToLocalStorage(room);

  if (isFirebaseClientConfigured) {
    try {
      const db = getDb();
      await setDoc(doc(db, "multiplayerRooms", roomId), room);
    } catch {
      // fallback
    }
  }

  return room;
}

export async function joinRoom(roomId: string, player: MultiplayerPlayer): Promise<ImpostorRoom | null> {
  const code = roomId.toUpperCase().trim();
  const room = getRoomFromLocalStorage(code);

  if (!room && isFirebaseClientConfigured) {
    try {
      const db = getDb();
      await doc(db, "multiplayerRooms", code);
    } catch {
      // fallback
    }
  }

  if (!room) return null;

  const existingIdx = room.players.findIndex((p) => p.id === player.id);
  const updatedPlayers = [...room.players];
  if (existingIdx >= 0) {
    updatedPlayers[existingIdx] = { ...updatedPlayers[existingIdx]!, ...player };
  } else {
    updatedPlayers.push(player);
  }

  const updatedRoom: ImpostorRoom = { ...room, players: updatedPlayers };
  saveRoomToLocalStorage(updatedRoom);

  if (isFirebaseClientConfigured) {
    try {
      const db = getDb();
      await updateDoc(doc(db, "multiplayerRooms", code), { players: updatedPlayers });
    } catch {
      // fallback
    }
  }

  return updatedRoom;
}

export async function startNewRound(roomId: string): Promise<void> {
  const code = roomId.toUpperCase().trim();
  const room = getRoomFromLocalStorage(code);
  if (!room || room.players.length === 0) return;

  const item = IMPOSTOR_WORDS_CATALOG[Math.floor(Math.random() * IMPOSTOR_WORDS_CATALOG.length)]!;
  const impostor = room.players[Math.floor(Math.random() * room.players.length)]!;

  const updatedRoom: ImpostorRoom = {
    ...room,
    status: "hints",
    category: item.category,
    secretWord: item.word,
    impostorId: impostor.id,
    hints: [],
    votes: [],
    impostorFinalGuess: undefined,
    winner: undefined,
  };

  saveRoomToLocalStorage(updatedRoom);

  if (isFirebaseClientConfigured) {
    try {
      const db = getDb();
      await updateDoc(doc(db, "multiplayerRooms", code), {
        status: "hints",
        category: item.category,
        secretWord: item.word,
        impostorId: impostor.id,
        hints: [],
        votes: [],
        impostorFinalGuess: undefined,
        winner: undefined,
      });
    } catch {
      // fallback
    }
  }
}

export async function submitPlayerHint(roomId: string, hint: PlayerHint): Promise<void> {
  const code = roomId.toUpperCase().trim();
  const room = getRoomFromLocalStorage(code);
  if (!room) return;

  const updatedHints = [...room.hints.filter((h) => h.playerId !== hint.playerId), hint];
  const allHintsSubmitted = updatedHints.length >= room.players.length;
  const newStatus = allHintsSubmitted ? "voting" : "hints";

  const updatedRoom: ImpostorRoom = {
    ...room,
    hints: updatedHints,
    status: newStatus,
  };

  saveRoomToLocalStorage(updatedRoom);

  if (isFirebaseClientConfigured) {
    try {
      const db = getDb();
      await updateDoc(doc(db, "multiplayerRooms", code), {
        hints: updatedHints,
        status: newStatus,
      });
    } catch {
      // fallback
    }
  }
}

export async function submitPlayerVote(roomId: string, vote: PlayerVote): Promise<void> {
  const code = roomId.toUpperCase().trim();
  const room = getRoomFromLocalStorage(code);
  if (!room) return;

  const updatedVotes = [...room.votes.filter((v) => v.voterId !== vote.voterId), vote];
  const allVoted = updatedVotes.length >= room.players.length;

  let winner = room.winner;
  let newStatus = room.status;

  if (allVoted) {
    newStatus = "result";
    // Contabiliza os votos
    const voteCounts = new Map<string, number>();
    for (const v of updatedVotes) {
      voteCounts.set(v.targetPlayerId, (voteCounts.get(v.targetPlayerId) ?? 0) + 1);
    }

    let maxVotes = 0;
    let mostVotedId = "";
    voteCounts.forEach((count, pid) => {
      if (count > maxVotes) {
        maxVotes = count;
        mostVotedId = pid;
      }
    });

    if (mostVotedId === room.impostorId) {
      winner = "players";
    } else {
      winner = "impostor";
    }

    // Atualiza pontuações dos jogadores
    const updatedPlayers = room.players.map((p) => {
      if (winner === "impostor" && p.id === room.impostorId) {
        return { ...p, score: p.score + 500 };
      }
      if (winner === "players" && p.id !== room.impostorId) {
        return { ...p, score: p.score + 300 };
      }
      return p;
    });

    room.players = updatedPlayers;
  }

  const updatedRoom: ImpostorRoom = {
    ...room,
    votes: updatedVotes,
    status: newStatus,
    winner,
  };

  saveRoomToLocalStorage(updatedRoom);

  if (isFirebaseClientConfigured) {
    try {
      const db = getDb();
      await updateDoc(doc(db, "multiplayerRooms", code), {
        votes: updatedVotes,
        status: newStatus,
        winner,
        players: room.players,
      });
    } catch {
      // fallback
    }
  }
}
