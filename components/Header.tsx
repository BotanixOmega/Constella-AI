
import React from 'react';
import { StarConstellationIcon } from './icons/StarConstellationIcon';
import { RotateIcon } from './icons/RotateIcon';

interface HeaderProps {
  onResetTrigger: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onResetTrigger }) => {
  return (
    <header className="bg-buzz-black border-b border-bee-gold/30 py-4 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
      <div className="flex items-center space-x-3 group cursor-pointer">
        <div className="text-bee-gold p-1.5 rounded-lg transform group-hover:scale-110 transition-transform duration-500">
          <StarConstellationIcon className="w-8 h-8" />
        </div>
        <div className="flex flex-col">
          <span className="text-bee-gold font-black text-2xl tracking-tight leading-none">CONSTELLA</span>
          <span className="text-white/60 text-[9px] font-bold tracking-[0.25em] uppercase leading-none mt-1.5 ml-0.5">
            CRAFT IN FLAWLESS CONTINUITY
          </span>
        </div>
      </div>

      <button
        onClick={onResetTrigger}
        className="flex items-center space-x-2 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-red-300 font-black text-[9px] tracking-widest uppercase px-4 py-2 rounded-full transition-all focus:outline-none focus:ring-1 focus:ring-red-500/50 hover:bg-red-950/20 shadow-lg"
      >
        <RotateIcon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Reset All Inputs</span>
        <span className="sm:hidden">Reset</span>
      </button>
    </header>
  );
};

