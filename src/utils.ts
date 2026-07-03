import { PlayerSymbol } from './interfaces/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function checkWinner(board: PlayerSymbol[]): PlayerSymbol | 'draw' {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], 
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (!board.includes(null)) {
    return 'draw';
  }
  return null;
}

export function getBotMove(board: PlayerSymbol[], botSymbol: PlayerSymbol): number {
  const emptyIndices = board.map((cell, idx) => cell === null ? idx : null).filter(val => val !== null) as number[];
  if (emptyIndices.length === 0) return -1;
  const randomIndex = Math.floor(Math.random() * emptyIndices.length);
  return emptyIndices[randomIndex];
}