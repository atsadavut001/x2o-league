import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../../interfaces/UserProfile.interface';
import { RoomData, makeOnlineMove, nextOnlineRound, requestRematch, leaveRoom } from '../../../services/onlineGameService';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../config/firebase';

interface OnlineBoardProps {
  initialRoom: RoomData;
  currentUser: UserProfile;
  onLeaveRoom: () => void;
}

export const OnlineBoard: React.FC<OnlineBoardProps> = ({ initialRoom, currentUser, onLeaveRoom }) => {
  const [room, setRoom] = useState<RoomData>(initialRoom);
  const [loadingMove, setLoadingMove] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  // Real-time listener for room updates via Firestore onSnapshot
  useEffect(() => {
    const roomRef = doc(db, 'rooms', initialRoom.id);
    const unsubscribe = onSnapshot(
      roomRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const updatedData = docSnap.data() as RoomData;
          setRoom(updatedData);
        } else {
          setErrorMsg('ห้องแข่งขันนี้ถูกปิดหรือผู้เล่นอีกฝ่ายออกจากห้องแล้ว');
        }
      },
      (error) => {
        console.error('Error listening to room updates:', error);
        setErrorMsg('เกิดข้อผิดพลาดในการซิงค์ข้อมูลเรียลไทม์');
      }
    );

    return () => unsubscribe();
  }, [initialRoom.id]);

  // Turn timer countdown (30 seconds per turn)
  useEffect(() => {
    setTimeLeft(30);
    if (room.status !== 'playing' || room.winner || room.matchWinner) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time out could trigger automatic pass or let service handle it
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [room.currentTurn, room.board, room.status, room.winner, room.matchWinner]);

  // Determine player symbol for current user ('X' or 'O')
  const isPlayerX = room.playerX === currentUser.uid;
  const isPlayerO = room.playerO === currentUser.uid;
  const mySymbol: 'X' | 'O' | null = isPlayerX ? 'X' : isPlayerO ? 'O' : null;
  const isMyTurn = mySymbol !== null && room.currentTurn === mySymbol && !room.winner && !room.matchWinner;

  // Player Profiles
  const playerXName = room.playerXProfile?.displayName || 'Player X';
  const playerXPhoto = room.playerXProfile?.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=X';
  const playerXRank = room.playerXProfile?.rankPoints ?? 0;

  const playerOName = room.playerOProfile?.displayName || (room.playerO ? 'Player O' : 'กำลังรอผู้เล่น...');
  const playerOPhoto = room.playerOProfile?.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=O';
  const playerORank = room.playerOProfile?.rankPoints ?? 0;

  const handleCellClick = async (index: number) => {
    if (!mySymbol) {
      setErrorMsg('คุณเป็นผู้ชม ไม่สามารถเดินหมากได้');
      return;
    }
    if (!isMyTurn) {
      setErrorMsg('ไม่ใช่ตาเดินของคุณ');
      return;
    }
    if (room.board[index] !== null) {
      return;
    }
    if (room.winner || room.matchWinner) {
      return;
    }

    try {
      setErrorMsg('');
      setLoadingMove(true);
      await makeOnlineMove(room.id, index, currentUser.uid);
    } catch (err: any) {
      setErrorMsg(err.message || 'ไม่สามารถเดินหมากได้');
    } finally {
      setLoadingMove(false);
    }
  };

  const handleNextRound = async () => {
    try {
      await nextOnlineRound(room.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'ไม่สามารถเริ่มรอบใหม่ได้');
    }
  };

  const handleRequestRematch = async () => {
    try {
      await requestRematch(room.id, currentUser.uid);
    } catch (err: any) {
      setErrorMsg(err.message || 'ไม่สามารถขอรีแมตช์ได้');
    }
  };

  const handleLeave = async () => {
    if (window.confirm('คุณต้องการออกจากห้องแข่งขันนี้ใช่หรือไม่? (การออกระหว่างเกมจะถือว่าแพ้)')) {
      try {
        await leaveRoom(room.id, currentUser.uid);
      } catch (err) {
        console.error(err);
      } finally {
        onLeaveRoom();
      }
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasRequestedRematch = room.rematchRequestedBy?.includes(currentUser.uid);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col items-center justify-between p-4 sm:p-6 relative">
      {/* Background Glows */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-4 z-10">
        <button
          onClick={handleLeave}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 rounded-xl border border-slate-700/80 transition text-sm font-medium backdrop-blur-md"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          ออกจากห้อง
        </button>

        {/* Room Code Badge & Copy */}
        <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/80 backdrop-blur-md">
          <span className="text-xs text-slate-400 font-medium">รหัสห้อง:</span>
          <span className="font-mono font-bold text-cyan-400 text-base tracking-widest">{room.roomCode}</span>
          <button
            onClick={copyRoomCode}
            className="ml-2 px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs rounded-lg transition font-medium border border-indigo-500/30"
          >
            {copied ? 'คัดลอกแล้ว! ✓' : 'คัดลอกรหัส'}
          </button>
        </div>
      </div>

      {/* Error Notification Alert */}
      {errorMsg && (
        <div className="w-full max-w-4xl mb-4 p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-200 text-sm flex items-center justify-between z-10 animate-shake">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-rose-400 hover:text-rose-200 font-bold ml-2">×</button>
        </div>
      )}

      {/* Main Game Arena */}
      <div className="w-full max-w-4xl flex flex-col items-center flex-1 justify-center z-10 my-4">
        {/* Waiting for Opponent Banner */}
        {room.status === 'waiting' && (
          <div className="w-full bg-slate-800/90 border border-indigo-500/30 rounded-3xl p-8 mb-6 text-center backdrop-blur-xl shadow-2xl animate-pulse">
            <div className="inline-block p-4 bg-indigo-500/20 rounded-2xl mb-4 text-3xl">⏳</div>
            <h2 className="text-2xl font-bold text-white mb-2">กำลังรอผู้เล่นคนที่ 2 เข้าร่วมห้อง...</h2>
            <p className="text-slate-400 text-sm mb-4">แชร์รหัสห้อง <span className="font-mono text-cyan-400 font-bold">{roomCodeFormatted(room.roomCode)}</span> ให้เพื่อนของคุณเพื่อเริ่มแข่งขัน</p>
          </div>
        )}

        {/* X vs O Players Score Banner */}
        <div className="grid grid-cols-2 gap-4 sm:gap-8 w-full max-w-2xl mb-6">
          {/* Player X Card */}
          <div className={`p-4 sm:p-5 rounded-3xl border backdrop-blur-xl transition-all flex items-center gap-4 ${
            room.currentTurn === 'X' && !room.winner && !room.matchWinner && room.status === 'playing'
              ? 'bg-cyan-500/20 border-cyan-500 shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-500/40'
              : 'bg-slate-800/80 border-slate-700/80'
          }`}>
            <img src={playerXPhoto} alt={playerXName} className="w-12 h-12 rounded-2xl bg-cyan-500/20 object-cover border border-cyan-500/40 shrink-0" />
            <div className="overflow-hidden flex-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">X</span>
                <h3 className="font-bold text-white truncate text-sm sm:text-base">{playerXName} {isPlayerX && '(คุณ)'}</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">⭐ {playerXRank} PTS</p>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 bg-slate-900/60 w-10 h-10 rounded-2xl flex items-center justify-center border border-slate-700">
              {room.scores?.X || 0}
            </div>
          </div>

          {/* Player O Card */}
          <div className={`p-4 sm:p-5 rounded-3xl border backdrop-blur-xl transition-all flex items-center gap-4 ${
            room.currentTurn === 'O' && !room.winner && !room.matchWinner && room.status === 'playing'
              ? 'bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/20 ring-2 ring-purple-500/40'
              : 'bg-slate-800/80 border-slate-700/80'
          }`}>
            <img src={playerOPhoto} alt={playerOName} className="w-12 h-12 rounded-2xl bg-purple-500/20 object-cover border border-purple-500/40 shrink-0" />
            <div className="overflow-hidden flex-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">O</span>
                <h3 className="font-bold text-white truncate text-sm sm:text-base">{playerOName} {isPlayerO && '(คุณ)'}</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">⭐ {playerORank} PTS</p>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-400 bg-slate-900/60 w-10 h-10 rounded-2xl flex items-center justify-center border border-slate-700">
              {room.scores?.O || 0}
            </div>
          </div>
        </div>

        {/* Turn Indicator & Timer Banner */}
        {room.status === 'playing' && !room.winner && !room.matchWinner && (
          <div className="flex items-center gap-4 mb-6 px-6 py-2.5 bg-slate-800/90 border border-slate-700 rounded-2xl backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              <span className="text-sm font-semibold text-slate-200">
                ตาเดินของ: <strong className={room.currentTurn === 'X' ? 'text-cyan-400' : 'text-purple-400'}>
                  {room.currentTurn === 'X' ? playerXName : playerOName} ({room.currentTurn})
                </strong>
                {isMyTurn ? ' (ตาของคุณ!)' : ''}
              </span>
            </div>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{timeLeft}s</span>
            </div>
          </div>
        )}

        {/* Tic-Tac-Toe Board (3x3) */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-md aspect-square bg-slate-800/80 p-4 sm:p-6 rounded-3xl border border-slate-700/80 backdrop-blur-2xl shadow-2xl relative">
          {room.board.map((cell, index) => {
            const isWinningCell = false; // Optional highlight logic if needed
            return (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={cell !== null || !isMyTurn || loadingMove || room.status !== 'playing' || !!room.winner}
                className={`w-full h-full rounded-2xl flex items-center justify-center text-4xl sm:text-6xl font-black transition-all duration-200 shadow-inner ${
                  cell === 'X'
                    ? 'bg-cyan-500/20 text-cyan-400 border-2 border-cyan-500/50 shadow-cyan-500/10 scale-100'
                    : cell === 'O'
                    ? 'bg-purple-500/20 text-purple-400 border-2 border-purple-500/50 shadow-purple-500/10 scale-100'
                    : isMyTurn && room.status === 'playing' && !room.winner
                    ? 'bg-slate-900/60 hover:bg-slate-700/80 border-2 border-slate-700 hover:border-indigo-500/50 cursor-pointer transform hover:scale-[1.02]'
                    : 'bg-slate-900/40 border-2 border-slate-800 cursor-not-allowed opacity-70'
                }`}
              >
                {cell}
              </button>
            );
          })}
        </div>

        {/* Round Winner / Match Winner Modal Banner */}
        {(room.winner || room.matchWinner) && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative">
              {room.matchWinner ? (
                <div>
                  <div className="w-20 h-20 bg-amber-500/20 border-2 border-amber-500/50 rounded-3xl mx-auto flex items-center justify-center text-4xl mb-4 shadow-lg shadow-amber-500/20">
                    🏆
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">จบการแข่งขัน!</h2>
                  <p className="text-lg text-slate-300 mb-6">
                    ผู้ชนะแมตช์นี้คือ:{' '}
                    <span className={`font-black ${room.matchWinner === 'X' ? 'text-cyan-400' : 'text-purple-400'}`}>
                      {room.matchWinner === 'X' ? playerXName : playerOName} ({room.matchWinner})
                    </span>
                  </p>

                  <div className="space-y-3">
                    <button
                      onClick={handleRequestRematch}
                      disabled={hasRequestedRematch}
                      className={`w-full py-3.5 px-6 rounded-2xl font-bold text-base transition shadow-lg ${
                        hasRequestedRematch
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                      }`}
                    >
                      {hasRequestedRematch ? 'รอคู่แข่งยืนยันรีแมตช์... (1/2)' : 'ขอรีแมตช์ (Rematch)'}
                    </button>
                    <button
                      onClick={handleLeave}
                      className="w-full py-3 px-6 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-2xl font-medium text-sm transition border border-slate-600"
                    >
                      กลับสู่หน้าล็อบบี้
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 bg-indigo-500/20 border border-indigo-500/40 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4">
                    {room.winner === 'draw' ? '🤝' : '🎉'}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {room.winner === 'draw' ? 'เสมอในรอบนี้!' : `ผู้ชนะรอบนี้: ${room.winner === 'X' ? playerXName : playerOName}`}
                  </h3>
                  <p className="text-slate-400 text-sm mb-6">คะแนนปัจจุบัน: X ({room.scores.X}) - O ({room.scores.O}) (ใครถึง 2 ก่อนชนะ)</p>

                  <div className="space-y-3">
                    <button
                      onClick={handleNextRound}
                      className="w-full py-3.5 px-6 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-2xl transition shadow-lg shadow-indigo-500/25"
                    >
                      เริ่มรอบถัดไป (Next Round)
                    </button>
                    <button
                      onClick={handleLeave}
                      className="w-full py-2.5 px-6 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-2xl font-medium text-sm transition border border-slate-600"
                    >
                      ออกจากห้อง
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-4xl text-center text-slate-500 text-xs z-10">
        Zberus Tech x2o-league Online PvP &bull; Real-time Firestore Sync
      </div>
    </div>
  );
};

function roomCodeFormatted(code: string): string {
  if (!code) return '';
  return code;
}
