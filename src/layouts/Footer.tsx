export default function Footer() {
    return (
        <footer className="px-4 sm:px-8 py-4 bg-black/40 border-t border-white/5 flex flex-wrap items-center justify-center sm:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6 sm:gap-8 justify-center">
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-white/5 px-3 py-1.5 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                <span>Global Server Online</span>
            </div>
        </footer>
    );
}