import { useState, useEffect } from 'react';
import Board from '../board/Board';
import { checkWinner, getBotMove } from './../../../utils';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

import './BotGame.css';

import { PlayerSymbol } from '@/src/interfaces/types';
import { UserProfile } from '@/src/interfaces/UserProfile.interface';
interface BotGameProps {
    user: UserProfile | null;
    onComplete: () => void;
}

export default function BotGame({ user, onComplete }: BotGameProps) {

    const [playerSymbol] = useState<PlayerSymbol>(() => Math.random() > 0.5 ? 'X' : 'O');
    const botSymbol: PlayerSymbol = playerSymbol === 'X' ? 'O' : 'X';
    const [board, setBoard] = useState<PlayerSymbol[]>(Array(9).fill(null));
    const [gamesPlayed, setGamesPlayed] = useState(0);
    const [currentTurn, setCurrentTurn] = useState<PlayerSymbol>('X');
    const [scores, setScores] = useState({ X: 0, O: 0 });
    const [winner, setWinner] = useState<PlayerSymbol | 'draw' | null>(null);
    const [matchWinner, setMatchWinner] = useState<PlayerSymbol | null>(null);
    const [showRoundSplash, setShowRoundSplash] = useState(true);

    useEffect(() => {
        if (showRoundSplash) {
            const timer = setTimeout(() => setShowRoundSplash(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [showRoundSplash]);

    useEffect(() => {
        if (currentTurn === botSymbol && !winner && !matchWinner) {
            const timer = setTimeout(() => {
                const botMove = getBotMove(board, botSymbol);
                if (botMove !== -1) {
                    handleMove(botMove, botSymbol);
                }
            }, 500);
            return () => clearTimeout(timer);
        }
        if (matchWinner) {
            updateUserStats(playerSymbol, matchWinner);
        }
    }, [currentTurn, winner, matchWinner, board, botSymbol]);

    const handleMove = (index: number, player: PlayerSymbol) => {
        if (board[index] || winner || matchWinner) return;

        const newBoard = [...board];
        newBoard[index] = player;
        setBoard(newBoard);

        const win = checkWinner(newBoard);
        if (win) {
            setWinner(win);
            if (win !== 'draw') {
                const newScores = { ...scores, [win]: scores[win as 'X' | 'O'] + 1 };
                setScores(newScores);
                if (newScores[win as 'X' | 'O'] >= 2) {
                    setMatchWinner(win);
                }
            }
        } else {
            setCurrentTurn(player === 'X' ? 'O' : 'X');
        }
    };

    const nextRound = () => {
        setBoard(Array(9).fill(null));
        setWinner(null);
        const newGamesPlayed = gamesPlayed + 1;
        setGamesPlayed(newGamesPlayed);
        setCurrentTurn(newGamesPlayed % 2 === 0 ? 'X' : 'O');
        setShowRoundSplash(true);
    };

    const updateUserStats = async (playerSymbol: PlayerSymbol, matchWinner: PlayerSymbol | 'draw') => {
        if (!user) return;
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            user.winsBotCount = userDoc.data().winsBotCount;
            user.totalGames += 1;
            let winPointsIncrement = 0;

            if (matchWinner === playerSymbol) {
                winPointsIncrement += 1;
                user.winsBotCount += 1;
                user.wins += 1;

                if (user.winsBotCount >= 3) {
                    winPointsIncrement += 1;
                    user.winsBotCount = 0;
                }
            }
            else if (matchWinner === 'draw') {
                winPointsIncrement += 0;
                user.winsBotCount = 0;
                user.draws += 1;
            }
            else {
                winPointsIncrement -= 1;
                user.winsBotCount = 0;
                user.losses += 1;
            }

            const updates: any = {
                rankPoints: increment(winPointsIncrement),
                winsBotCount: user.winsBotCount,
                totalGames: user.totalGames,
                wins: user.wins,
                losses: user.losses,
                draws: user.draws
            };

            await updateDoc(userRef, updates);
        }
    };

    if (showRoundSplash) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-white/5 rounded-3xl border border-white/5 relative shadow-inner overflow-hidden w-full max-w-3xl mx-auto p-4 sm:p-8">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="z-10 animate-in zoom-in fade-in duration-300">
                    <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-widest text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                        Round {gamesPlayed + 1}
                    </h2>
                </div>
            </div>
        );
    }
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-white/5 rounded-3xl border border-white/5 relative shadow-inner overflow-hidden w-full max-w-3xl mx-auto p-4 sm:p-8">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="flex items-center gap-6 sm:gap-12 mb-8 sm:mb-10 z-10 w-full justify-center">
                <div className={`text-center w-24 transition-opacity duration-300 ${currentTurn === playerSymbol && !winner && !matchWinner ? 'opacity-100' : 'opacity-50'}`}>
                    <div className="text-[10px] text-slate-400 uppercase mb-1 tracking-widest font-bold">You ({playerSymbol})</div>
                    <div className={`text-4xl sm:text-5xl font-black drop-shadow-[0_0_10px_currentColor] ${playerSymbol === 'X' ? 'text-cyan-400' : 'text-rose-500'}`}>{scores[playerSymbol as 'X' | 'O']}</div>
                </div>
                <div >
                    <h2 className="text-2xl sm:text-2xl font-black uppercase tracking-widest text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] mb-2">
                        Round {gamesPlayed + 1}
                    </h2>
                    <div className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest text-slate-400 italic shadow-inner text-center ">
                        Best of 3
                    </div>
                </div>
                <div className={`text-center w-24 transition-opacity duration-300 ${currentTurn === botSymbol && !winner && !matchWinner ? 'opacity-100' : 'opacity-50'}`}>
                    <div className="text-[10px] text-slate-400 uppercase mb-1 tracking-widest font-bold">Bot ({botSymbol})</div>
                    <div className={`text-4xl sm:text-5xl font-black drop-shadow-[0_0_10px_currentColor] ${botSymbol === 'X' ? 'text-cyan-400' : 'text-rose-500'}`}>{scores[botSymbol as 'X' | 'O']}</div>
                </div>
            </div>

            <Board board={board} onClick={(idx) => currentTurn === playerSymbol && handleMove(idx, playerSymbol)} disabled={currentTurn === botSymbol || !!winner || !!matchWinner} />

            <div className="h-28 mt-8 z-10 flex flex-col items-center justify-center w-full">
                {winner && !matchWinner && (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                        <div className={`text-xl font-black uppercase tracking-widest drop-shadow-md ${winner === 'draw' ? 'text-slate-300' : winner === playerSymbol ? (playerSymbol === 'X' ? 'text-cyan-400' : 'text-rose-500') : (botSymbol === 'X' ? 'text-cyan-400' : 'text-rose-500')}`}>
                            {winner === 'draw' ? "Round Draw" : winner === playerSymbol ? "You Win Round" : "Bot Wins Round"}
                        </div>
                        <button onClick={nextRound} className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95">
                            Next Round
                        </button>
                    </div>
                )}

                {matchWinner && (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                        <div className={`text-2xl sm:text-3xl font-black uppercase tracking-widest drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] ${matchWinner === playerSymbol ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]'}`}>
                            {matchWinner === playerSymbol ? 'You Win Match!' : 'Bot Wins Match!'}
                        </div>
                        <button onClick={onComplete} className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95">
                            Back to Menu
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}