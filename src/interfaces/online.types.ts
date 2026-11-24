import type { Timestamp } from 'firebase/firestore';
import type { PlayerSymbol } from './types';

export type OnlineRoomStatus = 'waiting' | 'playing' | 'finished' | 'abandoned';

export interface OnlinePlayerProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  rankPoints: number;
}

export interface RoomData {
  id: string;
  roomCode: string;
  status: OnlineRoomStatus;
  hostId: string;
  playerX: string;
  playerO: string | null;
  playerXProfile?: OnlinePlayerProfile;
  playerOProfile?: OnlinePlayerProfile | null;
  board: PlayerSymbol[];
  currentTurn: 'X' | 'O';
  scores: {
    X: number;
    O: number;
  };
  winner: PlayerSymbol | 'draw' | null;
  matchWinner: PlayerSymbol | null;
  rematchRequestedBy?: string[];
  lastActivity: Timestamp | unknown;
  createdAt: Timestamp | unknown;
}

export interface MatchmakingTicket {
  uid: string;
  displayName: string;
  photoURL: string;
  rankPoints: number;
  createdAt: Timestamp | unknown;
}
