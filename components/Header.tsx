
import React from 'react';
import { BeeIcon } from './icons/BeeIcon';

export const Header: React.FC = () => {
  return (
    <header className="bg-buzz-black border-b border-bee-gold/30 py-4 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
      <div className="flex items-center space-x-3 group cursor-pointer">
        <div className="bg-bee-gold p-1.5 rounded-lg transform group-hover:rotate-12 transition-transform duration-300">
          <BeeIcon className="text-buzz-black w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-bee-gold font-black text-xl tracking-tighter leading-none">BUZZCRAFT</span>
          <span className="text-white/60 text-[10px] font-bold tracking-[0.2em] uppercase leading-none mt-1">Constel AI</span>
        </div>
      </div>
      
      <nav className="hidden md:flex items-center space-x-8">
        <a href="#" className="text-white/70 hover:text-bee-gold text-xs font-bold uppercase tracking-widest transition-colors">Documentation</a>
        <a href="#" className="text-white/70 hover:text-bee-gold text-xs font-bold uppercase tracking-widest transition-colors">Templates</a>
        <button className="bg-bee-gold/10 border border-bee-gold text-bee-gold px-4 py-1.5 rounded-full text-xs font-bold hover:bg-bee-gold hover:text-buzz-black transition-all duration-300">
          PRO PLAN
        </button>
      </nav>

      <div className="md:hidden text-bee-gold">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </div>
    </header>
  );
};
