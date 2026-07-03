import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

// CSS
import './Auth.css';

// Interface
interface AuthProps {
    onLogin: () => void;
}

export default function Auth({ onLogin }: AuthProps) {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-screen items-center justify-center bg-[#05060f] text-slate-100 space-y-8 p-4 text-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-5xl shadow-[0_0_30px_rgba(6,182,212,0.5)] z-10 text-white">OX</div>
            <div className="z-10">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white uppercase drop-shadow-sm">X2O League</h1>
            </div>
            <button
                onClick={onLogin}
                className="z-10 mt-8 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl text-sm uppercase transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 flex items-center gap-3"
            >
                <LogIn className="w-5 h-5" />
                Login with Google
            </button>
        </div>
    );
}