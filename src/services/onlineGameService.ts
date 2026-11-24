import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  runTransaction,
  serverTimestamp,
  Timestamp,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { PlayerSymbol } from '../interfaces/types';
import { UserProfile } from '../interfaces/UserProfile.interface';
import { checkWinner } from '../utils';

// Interfaces for online rooms and matchmaking
export interface RoomData {
  id: string;
  roomCode: string;
  status: 'waiting' | 'playing' | 'finished' | 'abandoned';
  hostId: string;
  playerX: string;
  playerO: string | null;
  playerXProfile?: {
    uid: string;
    displayName: string;
    photoURL: string;
    rankPoints: number;
  };
  playerOProfile?: {
    uid: string;
    displayName: string;
    photoURL: string;
    rankPoints: number;
  } | null;
  board: PlayerSymbol[]; // Array of 9 elements: 'X', 'O', or null
  currentTurn: 'X' | 'O';
  scores: {
    X: number;
    O: number;
  };
  winner: PlayerSymbol | 'draw' | null;
  matchWinner: PlayerSymbol | null;
  rematchRequestedBy?: string[];
  lastActivity: Timestamp | any;
  createdAt: Timestamp | any;
}

export interface MatchmakingTicket {
  uid: string;
  displayName: string;
  photoURL: string;
  rankPoints: number;
  createdAt: Timestamp | any;
}

/**
 * Generates a random 6-digit alphanumeric room code.
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded confusing chars like I, O, 0, 1
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Creates a new online game room.
 */
export async function createRoom(user: UserProfile): Promise<RoomData> {
  const roomId = doc(collection(db, 'rooms')).id;
  const roomCode = generateRoomCode();

  const newRoom: RoomData = {
    id: roomId,
    roomCode,
    status: 'waiting',
    hostId: user.uid,
    playerX: user.uid,
    playerO: null,
    playerXProfile: {
      uid: user.uid,
      displayName: user.displayName || 'Player X',
      photoURL: user.photoURL || '',
      rankPoints: user.rankPoints || 0
    },
    playerOProfile: null,
    board: Array(9).fill(null),
    currentTurn: 'X',
    scores: { X: 0, O: 0 },
    winner: null,
    matchWinner: null,
    rematchRequestedBy: [],
    lastActivity: serverTimestamp(),
    createdAt: serverTimestamp()
  };

  await setDoc(doc(db, 'rooms', roomId), newRoom);
  return newRoom;
}

/**
 * Joins an existing room using a 6-digit Room Code.
 */
export async function joinRoomByCode(roomCode: string, user: UserProfile): Promise<RoomData> {
  const q = query(collection(db, 'rooms'), where('roomCode', '==', roomCode.toUpperCase()), limit(1));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error('ไม่พบห้องที่ตรงกับรหัสนี้ กรุณาตรวจสอบรหัสห้องอีกครั้ง');
  }

  const roomDoc = querySnapshot.docs[0];
  const roomData = roomDoc.data() as RoomData;

  if (roomData.status !== 'waiting') {
    throw new Error('ห้องนี้กำลังแข่งขันอยู่แล้ว หรือเกมได้จบลงแล้ว');
  }

  if (roomData.playerX === user.uid) {
    // Already in room as playerX
    return roomData;
  }

  if (roomData.playerO && roomData.playerO !== user.uid) {
    throw new Error('ห้องนี้มีผู้เล่นครบ 2 คนแล้ว');
  }

  // Update room with playerO joining
  const updatedRoom: Partial<RoomData> = {
    playerO: user.uid,
    playerOProfile: {
      uid: user.uid,
      displayName: user.displayName || 'Player O',
      photoURL: user.photoURL || '',
      rankPoints: user.rankPoints || 0
    },
    status: 'playing',
    lastActivity: serverTimestamp()
  };

  await updateDoc(doc(db, 'rooms', roomDoc.id), updatedRoom);

  const freshDoc = await getDoc(doc(db, 'rooms', roomDoc.id));
  return freshDoc.data() as RoomData;
}

/**
 * Quick Matchmaking: Finds an open waiting room or creates one.
 */
export async function quickMatchmake(user: UserProfile): Promise<RoomData> {
  // 1. Look for an available waiting room created by another user
  const q = query(
    collection(db, 'rooms'),
    where('status', '==', 'waiting'),
    where('playerO', '==', null),
    limit(5)
  );

  const snapshot = await getDocs(q);
  const availableRooms = snapshot.docs.filter(docSnap => docSnap.data().hostId !== user.uid);

  if (availableRooms.length > 0) {
    // Join the first available room
    const targetRoomDoc = availableRooms[0];

    await updateDoc(doc(db, 'rooms', targetRoomDoc.id), {
      playerO: user.uid,
      playerOProfile: {
        uid: user.uid,
        displayName: user.displayName || 'Player O',
        photoURL: user.photoURL || '',
        rankPoints: user.rankPoints || 0
      },
      status: 'playing',
      lastActivity: serverTimestamp()
    });

    const updated = await getDoc(doc(db, 'rooms', targetRoomDoc.id));
    return updated.data() as RoomData;
  } else {
    // No waiting rooms found, create a new one
    return await createRoom(user);
  }
}

/**
 * Executes a player move on the board using a Firestore Transaction to prevent race conditions.
 */
export async function makeOnlineMove(roomId: string, index: number, userId: string): Promise<void> {
  const roomRef = doc(db, 'rooms', roomId);

  await runTransaction(db, async (transaction) => {
    const roomSnap = await transaction.get(roomRef);
    if (!roomSnap.exists()) {
      throw new Error('ไม่พบข้อมูลห้องแข่งขันนี้');
    }

    const room = roomSnap.data() as RoomData;

    if (room.status !== 'playing') {
      throw new Error('เกมยังไม่เริ่ม หรือเกมได้จบลงแล้ว');
    }

    // Determine player symbol
    let playerSymbol: PlayerSymbol = null;
    if (room.playerX === userId) playerSymbol = 'X';
    else if (room.playerO === userId) playerSymbol = 'O';

    if (!playerSymbol) {
      throw new Error('คุณไม่ได้อยู่ในห้องแข่งขันนี้');
    }

    if (room.currentTurn !== playerSymbol) {
      throw new Error('ไม่ใช่ตาเดินของคุณ');
    }

    if (room.board[index] !== null) {
      throw new Error('ช่องนี้ถูกเลือกไปแล้ว');
    }

    if (room.winner || room.matchWinner) {
      throw new Error('เกมนี้ได้สิ้นสุดลงแล้ว');
    }

    // Apply move
    const newBoard = [...room.board];
    newBoard[index] = playerSymbol;

    const roundWin = checkWinner(newBoard);
    let newScores = { ...room.scores };
    let newWinner: PlayerSymbol | 'draw' | null = roundWin;
    let newMatchWinner: PlayerSymbol | null = room.matchWinner;

    if (roundWin && roundWin !== 'draw') {
      newScores[roundWin as 'X' | 'O'] = (newScores[roundWin as 'X' | 'O'] || 0) + 1;
      if (newScores[roundWin as 'X' | 'O'] >= 2) {
        newMatchWinner = roundWin as PlayerSymbol;
      }
    }

    const nextTurn = playerSymbol === 'X' ? 'O' : 'X';

    transaction.update(roomRef, {
      board: newBoard,
      currentTurn: nextTurn,
      scores: newScores,
      winner: newWinner,
      matchWinner: newMatchWinner,
      status: newMatchWinner ? 'finished' : 'playing',
      lastActivity: serverTimestamp()
    });

    // If match is won, update user rank statistics
    if (newMatchWinner) {
      // We can update stats outside or handle stats logging
      setTimeout(() => {
        updateOnlineMatchStats(room, newMatchWinner).catch(console.error);
      }, 100);
    }
  });
}

/**
 * Proceeds to the next round after a round win/draw.
 */
export async function nextOnlineRound(roomId: string): Promise<void> {
  const roomRef = doc(db, 'rooms', roomId);

  await runTransaction(db, async (transaction) => {
    const roomSnap = await transaction.get(roomRef);
    if (!roomSnap.exists()) throw new Error('ไม่พบห้องแข่งขัน');

    const room = roomSnap.data() as RoomData;
    if (room.matchWinner) return; // Match is already finished

    const nextBoard = Array(9).fill(null);
    // Alternate starting turn based on total rounds played
    const totalRoundsPlayed = (room.scores.X || 0) + (room.scores.O || 0);
    const nextTurn = totalRoundsPlayed % 2 === 0 ? 'X' : 'O';

    transaction.update(roomRef, {
      board: nextBoard,
      winner: null,
      currentTurn: nextTurn,
      lastActivity: serverTimestamp()
    });
  });
}

/**
 * Requests a rematch after match conclusion.
 */
export async function requestRematch(roomId: string, userId: string): Promise<void> {
  const roomRef = doc(db, 'rooms', roomId);

  await runTransaction(db, async (transaction) => {
    const roomSnap = await transaction.get(roomRef);
    if (!roomSnap.exists()) throw new Error('ไม่พบห้องแข่งขัน');

    const room = roomSnap.data() as RoomData;
    const currentRequests = room.rematchRequestedBy || [];

    if (currentRequests.includes(userId)) return;

    const updatedRequests = [...currentRequests, userId];

    if (updatedRequests.length >= 2) {
      // Both players want rematch! Reset game completely.
      transaction.update(roomRef, {
        board: Array(9).fill(null),
        status: 'playing',
        currentTurn: 'X',
        scores: { X: 0, O: 0 },
        winner: null,
        matchWinner: null,
        rematchRequestedBy: [],
        lastActivity: serverTimestamp()
      });
    } else {
      transaction.update(roomRef, {
        rematchRequestedBy: updatedRequests,
        lastActivity: serverTimestamp()
      });
    }
  });
}

/**
 * Leaves or abandons a room.
 */
export async function leaveRoom(roomId: string, userId: string): Promise<void> {
  const roomRef = doc(db, 'rooms', roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) return;
  const room = roomSnap.data() as RoomData;

  if (room.status === 'playing' && !room.matchWinner) {
    // Opponent wins by default due to abandonment
    const winnerSymbol = room.playerX === userId ? 'O' : 'X';
    await updateDoc(roomRef, {
      status: 'abandoned',
      matchWinner: winnerSymbol,
      lastActivity: serverTimestamp()
    });
    await updateOnlineMatchStats(room, winnerSymbol);
  } else {
    await deleteDoc(roomRef);
  }
}

/**
 * Updates user rank points and win/loss/draw statistics upon match completion.
 */
async function updateOnlineMatchStats(room: RoomData, matchWinner: PlayerSymbol | 'draw'): Promise<void> {
  if (!room.playerX || !room.playerO) return;

  const playerXRef = doc(db, 'users', room.playerX);
  const playerORef = doc(db, 'users', room.playerO);

  const [playerXSnap, playerOSnap] = await Promise.all([getDoc(playerXRef), getDoc(playerORef)]);

  if (playerXSnap.exists() && playerOSnap.exists()) {
    const isXWinner = matchWinner === 'X';
    const isOWinner = matchWinner === 'O';
    const isDraw = matchWinner === 'draw';

    // Player X updates
    await updateDoc(playerXRef, {
      totalGames: increment(1),
      wins: increment(isXWinner ? 1 : 0),
      losses: increment(isOWinner ? 1 : 0),
      draws: increment(isDraw ? 1 : 0),
      rankPoints: increment(isXWinner ? 2 : isOWinner ? -1 : 0)
    });

    // Player O updates
    await updateDoc(playerORef, {
      totalGames: increment(1),
      wins: increment(isOWinner ? 1 : 0),
      losses: increment(isXWinner ? 1 : 0),
      draws: increment(isDraw ? 1 : 0),
      rankPoints: increment(isOWinner ? 2 : isXWinner ? -1 : 0)
    });
  }
}
