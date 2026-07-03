import { PlayerSymbol } from './../../../interfaces/types';
import { cn } from '../../../utils';

interface BoardProps {
  board: PlayerSymbol[];
  onClick: (index: number) => void;
  disabled?: boolean;
}

export default function Board({ board, onClick, disabled }: BoardProps) {
  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-3 sm:gap-4 w-full max-w-[320px] sm:max-w-[380px] aspect-square mx-auto z-10">
      {board.map((cell, index) => (
        <button
          key={index}
          onClick={() => onClick(index)}
          disabled={disabled || cell !== null}
          className={cn(
            "rounded-2xl sm:rounded-3xl border flex items-center justify-center text-5xl sm:text-6xl font-black transition-all duration-300",
            cell === null && !disabled 
              ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyan-500/50 cursor-pointer" 
              : "bg-white/5 border-white/10 cursor-default",
            cell === 'X' && "text-cyan-400 bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.2)]",
            cell === 'O' && "text-rose-500 bg-rose-500/10 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
          )}
        >
          <span className="drop-shadow-md">{cell}</span>
        </button>
      ))}
    </div>
  );
}
