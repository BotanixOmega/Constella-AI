
import React, { useRef } from 'react';
import { Character } from '../types';
import { UploadIcon } from './icons/UploadIcon';
import { GenerateIcon } from './icons/GenerateIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { RotateIcon } from './icons/RotateIcon';
import { UserIcon } from './icons/UserIcon';

interface CharacterSlotProps {
  character: Character;
  onUpdate: (character: Character) => void;
  onGenerate: (characterId: number) => void;
}

export const CharacterSlot: React.FC<CharacterSlotProps> = ({ character, onUpdate, onGenerate }) => {
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

  const handleRotate = () => {
    const newRotation = (character.rotation + 90) % 360;
    onUpdate({ ...character, rotation: newRotation });
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
    <div className="bg-gray-800 p-2 rounded-lg space-y-2 flex flex-col">
        <div className="relative aspect-square w-full bg-gray-700 rounded-md overflow-hidden flex items-center justify-center">
            {character.image ? (
                <img 
                    src={`data:${character.mimeType};base64,${character.image}`} 
                    alt={character.name} 
                    className="w-full h-full object-cover"
                    style={{ transform: `rotate(${character.rotation}deg)`}}
                />
            ) : (
                <UserIcon className="w-16 h-16 text-gray-500"/>
            )}
             <div className="absolute top-1 right-1">
                <input 
                    type="checkbox" 
                    checked={character.isSelected}
                    onChange={(e) => onUpdate({ ...character, isSelected: e.target.checked })}
                    className="h-5 w-5 rounded bg-gray-700 border-gray-500 text-bee-gold focus:ring-bee-amber"
                />
            </div>
        </div>
      
        <input
            type="text"
            value={character.name}
            onChange={(e) => onUpdate({ ...character, name: e.target.value })}
            className="w-full bg-gray-700 text-white px-2 py-1 rounded-md text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-bee-gold"
        />
        
        <div className="grid grid-cols-4 gap-1">
            <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-gray-700 rounded hover:bg-bee-gold hover:text-black transition-colors" title="Upload">
                <UploadIcon />
            </button>
            <button onClick={() => onGenerate(character.id)} className="p-2 bg-gray-700 rounded hover:bg-bee-gold hover:text-black transition-colors" title="Generate">
                <GenerateIcon />
            </button>
             <button onClick={handleDownload} disabled={!character.image} className="p-2 bg-gray-700 rounded hover:bg-bee-gold hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Download">
                <DownloadIcon />
            </button>
            <button onClick={handleRotate} disabled={!character.image} className="p-2 bg-gray-700 rounded hover:bg-bee-gold hover:text-black transition-colors disabled:opacity-50" title="Rotate">
                <RotateIcon />
            </button>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*"/>
    </div>
  );
};
