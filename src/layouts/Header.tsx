import { LogOut } from 'lucide-react';

// Interface
import { UserProfile } from '../interfaces/UserProfile.interface';
interface HeaderProps {
  user: UserProfile | null;
  onLogout: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {

    return (
        <header className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-lg sm:text-xl shadow-[0_0_15px_rgba(6,182,212,0.5)] text-white">OX</div>
                <div className="hidden sm:block">
                    <h1 className="text-xl font-bold tracking-tight uppercase">X2O League</h1>
                </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Current Rating</span>
                    <span className="text-xl font-black text-white">{user?.rankPoints} <span className="text-[10px] text-cyan-400">RP</span></span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2 bg-white/10 rounded-xl border border-white/10">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="Avatar" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/20" />
                    ) : (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-700 border border-white/20 overflow-hidden flex items-center justify-center font-bold text-xs">
                            {user?.displayName?.charAt(0)}
                        </div>
                    )}
                    <div className="text-sm hidden sm:block">
                        <p className="font-bold text-slate-200">{user?.displayName}</p>
                    </div>
                    <button onClick={onLogout} className="ml-1 sm:ml-2 text-slate-400 hover:text-rose-400 transition" title="Log out">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </header>
    );
}