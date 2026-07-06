import { useState, useEffect } from 'react';
import Board from '../board/Board';
import { checkWinner, getBotMove } from './../../../utils';

import { PlayerSymbol } from '@/src/interfaces/types';
interface LocalGameProps {
    onComplete: () => void;
}

export default function LocalGame({ onComplete }: LocalGameProps) {
  const [board, setBoard] = useState<PlayerSymbol[]>(Array(9).fill(null));
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [currentTurn, setCurrentTurn] = useState<PlayerSymbol>('X');
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [winner, setWinner] = useState<PlayerSymbol | 'draw' | null>(null);
  const [matchWinner, setMatchWinner] = useState<PlayerSymbol | null>(null);


}