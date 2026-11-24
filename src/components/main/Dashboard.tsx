import { Bot, Monitor, Globe, Trophy, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

import './Dashboard.css';

export default function Dashboard() {
    const navigate = useNavigate();
    const cards = [
        { id: 'ranked_matchmaking', title: 'Online PvP Match', subtitle: 'Real-time 2-Player • Quick Match & Room Code', icon: Globe, highlight: true, path: '/game/online' },
        { id: 'bot', title: 'Practice vs Bot', subtitle: 'Improve your strategy', icon: Bot, highlight: false, path: '/game/bot' },
        // { id: 'room_setup', title: 'Custom Lobby', subtitle: 'Create Room / Local Play', icon: Users, highlight: false, path: '/game/custom' },
        // { id: 'local', title: 'Local Pass & Play', subtitle: 'Same device multiplayer', icon: Monitor, highlight: false, path: '/game/local' },
        { id: 'leaderboard', title: 'Global Rankings', subtitle: 'View top players', icon: Trophy, highlight: false, path: '/leaderboard' }
    ];

    return (
        <div className="flex flex-col gap-6 max-w-md mx-auto w-full pt-4 sm:pt-12">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-inner relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none"></div>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 relative z-10">Select Game Mode</h2>
                <div className="flex flex-col gap-3 relative z-10">
                    {cards.map((card, idx) => (
                        <motion.button
                            key={card.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => navigate(card.path)}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${card.highlight
                                    ? 'bg-cyan-500/10 border border-cyan-500/30 ring-1 ring-cyan-500/20 hover:bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                                    : 'bg-white/5 border border-white/5 hover:border-cyan-500/50 hover:bg-white/10'
                                }`}
                        >
                            <div className="flex items-center gap-4 text-left">
                                <card.icon className={`w-6 h-6 ${card.highlight ? 'text-cyan-400' : 'text-slate-400'}`} />
                                <div>
                                    <p className={`font-bold ${card.highlight ? 'text-cyan-400' : 'text-slate-200'}`}>{card.title}</p>
                                    <p className={`text-[10px] uppercase tracking-tighter ${card.highlight ? 'text-cyan-400/70 font-bold' : 'text-slate-500'}`}>{card.subtitle}</p>
                                </div>
                            </div>
                            {card.highlight ? (
                                <div className="flex gap-1">
                                    <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
                                    <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                                </div>
                            ) : (
                                <span className="text-slate-600 font-black text-lg">→</span>
                            )}
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
}