
import React, { useRef } from 'react';
import { Character } from '../types';
import { UploadIcon } from './icons/UploadIcon';
import { GenerateIcon } from './icons/GenerateIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { UserIcon } from './icons/UserIcon';

interface CharacterSlotProps {
  character: Character;
  isLoading?: boolean;
  onUpdate: (character: Character) => void;
  onGenerate: (characterId: number) => void;
}

export const CharacterSlot: React.FC<CharacterSlotProps> = ({ character, isLoading, onUpdate, onGenerate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = (e.target?.result as string).split(',')[1];
        onUpdate({ ...character, image: base64Image, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    if(!character.image) return;
    const link = document.createElement('a');
    link.href = `data:${character.mimeType};base64,${character.image}`;
    link.download = `${character.name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 p-3 rounded-xl space-y-3 flex flex-col group">
        <div className="relative aspect-square w-full bg-black rounded-lg overflow-hidden flex items-center justify-center border border-gray-800 group-hover:border-bee-gold/30 transition-colors">
            {isLoading ? (
                <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center">
                    <svg className="animate-spin h-8 w-8 text-bee-gold" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                </div>
            ) : null}
            
            {character.image ? (
                <img 
                    src={`data:${character.mimeType};base64,${character.image}`} 
                    alt={character.name} 
                    className="w-full h-full object-cover"
                />
            ) : (
                <UserIcon className="w-12 h-12 text-gray-800"/>
            )}
            
             <div className="absolute top-2 right-2">
                <input 
                    type="checkbox" 
                    checked={character.isSelected}
                    onChange={(e) => onUpdate({ ...character, isSelected: e.target.checked })}
                    className="h-4 w-4 rounded bg-black border-gray-700 text-bee-gold focus:ring-0 cursor-pointer"
                />
            </div>
            
            {character.id === 1 && (
                <div className="absolute bottom-2 left-2 bg-bee-gold text-black text-[8px] font-black px-1.5 py-0.5 rounded tracking-tighter">STYLE REF</div>
            )}
        </div>
      
        <div className="space-y-1">
            <input
                type="text"
                value={character.name}
                onChange={(e) => onUpdate({ ...character, name: e.target.value })}
                className="w-full bg-transparent text-white text-xs font-black uppercase tracking-widest focus:outline-none placeholder-gray-700"
                placeholder="Name"
            />
            <textarea
                value={character.prompt}
                onChange={(e) => onUpdate({ ...character, prompt: e.target.value })}
                className="w-full bg-gray-950 border border-gray-800 rounded px-2 py-1.5 text-[10px] text-gray-400 focus:outline-none focus:border-bee-gold/50 h-12 resize-none"
                placeholder="Visual prompt for this member..."
            />
        </div>
        
        <div className="flex justify-between items-center pt-1 border-t border-gray-800">
            <div className="flex space-x-1">
                <button onClick={() => fileInputRef.current?.click()} className="p-1.5 text-gray-500 hover:text-bee-gold transition-colors" title="Upload">
                    <UploadIcon className="w-4 h-4" />
                </button>
                <button onClick={handleDownload} disabled={!character.image} className="p-1.5 text-gray-500 hover:text-bee-gold transition-colors disabled:opacity-20" title="Download">
                    <DownloadIcon className="w-4 h-4" />
                </button>
            </div>
            <button onClick={() => onGenerate(character.id)} disabled={isLoading} className="bg-gray-800 text-[10px] font-bold px-3 py-1 rounded hover:bg-bee-gold hover:text-black transition-all">
                GENERATE
            </button>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*"/>
    </div>
  );
};
