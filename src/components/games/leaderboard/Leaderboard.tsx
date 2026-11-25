import { useEffect, useState } from 'react';
import { UserProfile } from '../../../interfaces/UserProfile.interface';
import { db } from '../../../config/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Loader2, Trophy, Globe, User, Shield, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { RankBadge } from './RankBadge';

export default function Leaderboard({ onComplete }: { onComplete: () => void }) {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'global' | 'online' | 'local'>('global');

    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                const q = query(collection(db, 'users'), orderBy('rankPoints', 'desc'), limit(50));
                const snap = await getDocs(q);
                const data = snap.docs.map(doc => doc.data() as UserProfile);
                setUsers(data);
            } catch (err) {
                console.error("Error fetching leaderboard:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-16 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                <p className="text-xs text-slate-400 font-mono">กำลังโหลดตารางคะแนน...</p>
            </div>
        );
    }

    // Filter or sort users based on active tab
    const filteredUsers = [...users].sort((a, b) => {
        if (activeTab === 'online') {
            return (b.wins || 0) - (a.wins || 0);
        } else if (activeTab === 'local') {
            // Sort by win rate or total matches
            return ((b.wins || 0) + (b.losses || 0)) - ((a.wins || 0) + (a.losses || 0));
        }
        return (b.rankPoints || 0) - (a.rankPoints || 0);
    });

    return (
        <div className="max-w-3xl mx-auto w-full pt-4 sm:pt-6 pb-12 px-4">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 sm:p-8 flex flex-col shadow-2xl relative overflow-hidden backdrop-blur-xl">
                {/* Background glow effects */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none"></div>

                {/* Header Title & Tabs */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 relative z-10 border-b border-white/10 pb-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-amber-400" />
                            <h2 className="text-lg sm:text-xl font-bold text-white">ตารางจัดอันดับ (Leaderboard)</h2>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">จัดอันดับผู้เล่นยอดเยี่ยมประจำฤดูกาล x2o-league</p>
                    </div>

                    {/* Mode selector tabs */}
                    <div className="flex items-center bg-slate-900/60 border border-white/10 rounded-2xl p-1.5 gap-1">
                        <button
                            onClick={() => setActiveTab('global')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                activeTab === 'global' 
                                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' 
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Globe className="w-3.5 h-3.5" />
                            <span>Global RP</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('online')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                activeTab === 'online' 
                                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' 
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Shield className="w-3.5 h-3.5" />
                            <span>Online PvP</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('local')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                activeTab === 'local' 
                                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' 
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <User className="w-3.5 h-3.5" />
                            <span>Activity</span>
                        </button>
                    </div>
                </div>

                {/* Users List */}
                <div className="flex flex-col gap-2.5 relative z-10 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
                    {filteredUsers.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 text-xs">ไม่พบข้อมูลผู้เล่นในระบบ</div>
                    ) : (
                        filteredUsers.map((u, idx) => {
                            const isFirst = idx === 0;
                            const isSecond = idx === 1;
                            const isThird = idx === 2;

                            let rowStyle = "bg-white/5 border-white/5 hover:border-cyan-500/30 hover:bg-white/10";
                            let rankBadgeColor = "bg-slate-800 text-slate-300 border-slate-700";
                            
                            if (isFirst) {
                                rowStyle = "bg-amber-500/10 border-amber-500/30 shadow-[0_0_20px_rgba(251,191,36,0.1)]";
                                rankBadgeColor = "bg-amber-500 text-slate-950 font-black border-amber-400";
                            } else if (isSecond) {
                                rowStyle = "bg-slate-300/10 border-slate-300/25";
                                rankBadgeColor = "bg-slate-300 text-slate-950 font-black border-slate-200";
                            } else if (isThird) {
                                rowStyle = "bg-orange-600/10 border-orange-600/25";
                                rankBadgeColor = "bg-orange-500 text-slate-950 font-black border-orange-400";
                            }

                            const userPoints = u.rankPoints ?? 0;

                            return (
                                <motion.div
                                    key={u.uid || idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all ${rowStyle}`}
                                >
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-mono font-bold border ${rankBadgeColor}`}>
                                            #{idx + 1}
                                        </div>
                                        
                                        {u.photoURL ? (
                                            <img src={u.photoURL} alt="" className="w-10 h-10 rounded-xl object-cover border border-white/20 shadow" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center font-bold text-sm text-cyan-400">
                                                {u.displayName ? u.displayName.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                        )}

                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm sm:text-base font-bold text-white tracking-wide">
                                                    {u.displayName || 'ผู้เล่นนิรนาม'}
                                                </span>
                                                {isFirst && <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-slate-400 font-mono">
                                                    ชนะ: <strong className="text-emerald-400">{u.wins || 0}</strong> • แพ้: <strong className="text-rose-400">{u.losses || 0}</strong>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 sm:gap-4">
                                        {/* RankBadge Component Integration */}
                                        <div className="hidden md:block">
                                            <RankBadge points={userPoints} size="sm" variant="badge" />
                                        </div>
                                        <div className="block md:hidden">
                                            <RankBadge points={userPoints} size="sm" variant="shield" showName={false} />
                                        </div>

                                        <div className="text-right min-w-[70px] sm:min-w-[90px]">
                                            <div className="text-sm sm:text-base font-mono font-bold text-cyan-400">
                                                {userPoints.toLocaleString()} <span className="text-[10px] text-slate-400 font-sans">RP</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>

                {/* Footer Action */}
                <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-4 border-t border-white/10 gap-4 relative z-10">
                    <p className="text-[11px] text-slate-400 italic">
                        💡 คะแนน RP จะเพิ่มขึ้นเมื่อชนะการแข่งขันในโหมด Online Ranked
                    </p>
                    <button 
                        onClick={onComplete} 
                        className="w-full sm:w-auto px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg"
                    >
                        กลับสู่เมนูหลัก
                    </button>
                </div>
            </div>
        </div>
    );
}
