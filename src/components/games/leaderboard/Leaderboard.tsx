import { useEffect, useState } from 'react';
import { UserProfile } from '../../../interfaces/UserProfile.interface';
import { db } from '../../../config/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Leaderboard({ onComplete }: { onComplete: () => void }) {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLeaderboard() {
            const q = query(collection(db, 'users'), orderBy('rankPoints', 'desc'), limit(50));
            const snap = await getDocs(q);
            const data = snap.docs.map(doc => doc.data() as UserProfile);
            setUsers(data);
            setLoading(false);
        }
        fetchLeaderboard();
    }, []);

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /></div>;
    }

    return (
        <div className="max-w-2xl mx-auto w-full pt-4 sm:pt-8 pb-12">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-6 flex flex-col shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="flex items-center justify-between mb-6 relative z-10">
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Global Rankings</h2>
                    <span className="text-[10px] text-slate-400 italic">Top 50 Players</span>
                </div>

                <div className="flex flex-col gap-2 relative z-10">
                    {users.map((u, idx) => {
                        const isFirst = idx === 0;
                        const isSecond = idx === 1;
                        const isThird = idx === 2;

                        let bgClass = "bg-white/5 border-transparent";
                        let rankColor = "text-slate-400";
                        if (isFirst) {
                            bgClass = "bg-amber-400/10 border border-amber-400/20 shadow-[0_0_15px_rgba(251,191,36,0.1)]";
                            rankColor = "text-amber-400";
                        } else if (isSecond) {
                            bgClass = "bg-slate-300/10 border border-slate-300/20";
                            rankColor = "text-slate-300";
                        } else if (isThird) {
                            bgClass = "bg-orange-400/10 border border-orange-400/20";
                            rankColor = "text-orange-400";
                        }

                        return (
                            <motion.div
                                key={u.uid}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-colors hover:bg-white/10 ${bgClass}`}
                            >
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <span className={`font-black text-xs sm:text-sm w-6 text-center ${rankColor}`}>#{idx + 1}</span>
                                    {u.photoURL ? (
                                        <img src={u.photoURL} alt="" className="w-8 h-8 rounded-full border border-white/20" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-slate-700 border border-white/20 flex items-center justify-center font-bold text-xs">
                                            {u.displayName.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-xs sm:text-sm font-bold text-slate-200">{u.displayName}</div>
                                        <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest">W: {u.wins} • L: {u.losses}</div>
                                    </div>
                                </div>
                                <div className={`text-sm sm:text-base font-mono font-bold ${isFirst ? 'text-amber-400' : isSecond ? 'text-slate-300' : isThird ? 'text-orange-400' : 'text-cyan-400'}`}>
                                    {u.rankPoints} <span className="text-[9px] sm:text-[10px] text-slate-500">RP</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
                <div className="flex flex-col mt-8 items-center gap-4 animate-in fade-in zoom-in duration-300">
                    <button onClick={onComplete} className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95">
                        Back to Menu
                    </button>
                </div>
            </div>
        </div>
    );
}
