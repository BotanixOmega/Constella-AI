
import React from 'react';
import { StarConstellationIcon } from './icons/StarConstellationIcon';

export const Header: React.FC = () => {
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
    </header>
  );
};
