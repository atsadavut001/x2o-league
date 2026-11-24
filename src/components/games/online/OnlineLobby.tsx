import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../../interfaces/UserProfile.interface';
import { RoomData, createRoom, joinRoomByCode, quickMatchmake } from '../../../services/onlineGameService';

interface OnlineLobbyProps {
  user: UserProfile;
  onRoomJoined: (room: RoomData) => void;
  onBack: () => void;
}

export const OnlineLobby: React.FC<OnlineLobbyProps> = ({ user, onRoomJoined, onBack }) => {
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [matching, setMatching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Quick matchmaking timeout / animation effect
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (matching) {
      timer = setTimeout(async () => {
        try {
          const room = await quickMatchmake(user);
          onRoomJoined(room);
        } catch (err: any) {
          setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการค้นหาคู่แข่ง');
          setMatching(false);
        }
      }, 1500);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [matching, user, onRoomJoined]);

  const handleCreateRoom = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const room = await createRoom(user);
      onRoomJoined(room);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'ไม่สามารถสร้างห้องได้');
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) {
      setErrorMsg('กรุณากรอกรหัสห้อง 6 หลัก');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const room = await joinRoomByCode(roomCodeInput.trim(), user);
      onRoomJoined(room);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'ไม่สามารถเข้าร่วมห้องได้');
      setLoading(false);
    }
  };

  const handleQuickMatch = () => {
    setErrorMsg('');
    setMatching(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back Button Header */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={onBack}
          disabled={matching || loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl transition font-medium backdrop-blur-md border border-white/10 disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          กลับสู่เมนูหลัก
        </button>
      </div>

      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* User Profile Mini Header */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-700/80">
          <img
            src={user.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=default'}
            alt={user.displayName}
            className="w-14 h-14 rounded-2xl bg-indigo-500/20 object-cover border-2 border-indigo-500/40 shadow-inner"
          />
          <div>
            <h2 className="text-lg font-bold text-white">{user.displayName || 'ผู้เล่น'}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30">
                ⭐ Rank: {user.rankPoints || 0} PTS
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
                🏆 ชนะ {user.wins || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-200 text-sm flex items-start gap-3 animate-shake">
            <svg className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {matching ? (
          /* Quick Matchmaking Searching State */
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-2xl">
                ⚔️
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">กำลังค้นหาคู่แข่งออนไลน์...</h3>
            <p className="text-slate-400 text-sm mb-6">ระบบกำลังจับคู่ท่านกับผู้เล่นอื่นที่มีระดับใกล้เคียงกัน</p>
            <button
              onClick={() => setMatching(false)}
              className="px-6 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-medium rounded-xl border border-rose-500/30 transition"
            >
              ยกเลิกการค้นหา
            </button>
          </div>
        ) : (
          /* Main Lobby Options */
          <div className="space-y-6">
            {/* Quick Matchmaking Button */}
            <div>
              <button
                onClick={handleQuickMatch}
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 text-lg disabled:opacity-50"
              >
                <span className="text-2xl">⚡</span>
                ค้นหาคู่แข่งอัตโนมัติ (Quick Match)
              </button>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-700"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-xs uppercase tracking-wider">หรือ สร้าง / เข้าร่วมห้องส่วนตัว</span>
              <div className="flex-grow border-t border-slate-700"></div>
            </div>

            {/* Create Room Button */}
            <div>
              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className="w-full py-3.5 px-6 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-2xl border border-slate-600 transition flex items-center justify-center gap-2 text-base disabled:opacity-50 shadow-md"
              >
                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                สร้างห้องใหม่ (Create Room)
              </button>
            </div>

            {/* Join Room by Code Form */}
            <form onSubmit={handleJoinRoom} className="space-y-3">
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider">
                กรอกรหัสห้อง 6 หลักเพื่อเข้าร่วม
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder="เช่น ABC123"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 uppercase font-mono tracking-widest text-lg focus:outline-none focus:border-indigo-500 transition"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !roomCodeInput.trim()}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl transition shadow-md flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'เข้าร่วม'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-slate-500 text-xs">
        Zberus Tech x2o-league Online PvP System &bull; Powered by Firebase Firestore Realtime
      </div>
    </div>
  );
};
