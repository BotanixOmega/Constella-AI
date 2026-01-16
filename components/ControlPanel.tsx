
import React, { useState } from 'react';
import { Character, ImageStyle, AspectRatio } from '../types';
import { CharacterSlot } from './CharacterSlot';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface ControlPanelProps {
  characters: Character[];
  onUpdateCharacter: (character: Character) => void;
  onGenerateCharacter: (characterId: number) => void;
  style: ImageStyle;
  setStyle: (style: ImageStyle) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  prompts: string[];
  setPrompts: (prompts: string[]) => void;
  onGenerateAll: () => void;
  onSuggestPrompt: () => void;
  isLoading: boolean;
  isSuggesting: boolean;
  storyName: string;
  setStoryName: (name: string) => void;
  seriesName: string;
  setSeriesName: (name: string) => void;
}

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="border-b border-gray-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-800 transition-colors"
            >
                <h2 className="text-xl font-bold text-bee-gold">{title}</h2>
                {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </button>
            {isOpen && <div className="p-4 space-y-4">{children}</div>}
        </div>
    );
};

export const ControlPanel: React.FC<ControlPanelProps> = (props) => {
    const {
        characters, onUpdateCharacter, onGenerateCharacter, style, setStyle, aspectRatio, setAspectRatio,
        prompts, setPrompts, onGenerateAll, onSuggestPrompt, isLoading, isSuggesting,
        storyName, setStoryName, seriesName, setSeriesName
    } = props;

  const handleAddPrompt = () => {
    if (prompts.length < 10) {
      setPrompts([...prompts, '']);
    }
  };

  const handleRemovePrompt = (index: number) => {
    setPrompts(prompts.filter((_, i) => i !== index));
  };

  const handlePromptChange = (index: number, value: string) => {
    const newPrompts = [...prompts];
    newPrompts[index] = value;
    setPrompts(newPrompts);
  };

  return (
    <aside className="w-full lg:w-1/3 xl:w-1/4 bg-gray-900 min-h-screen lg:max-h-screen lg:overflow-y-auto p-2">
      <div className="space-y-2">
         <CollapsibleSection title="Story & Series">
            <div className="space-y-4">
                 <div>
                    <label htmlFor="seriesName" className="block text-sm font-medium text-gray-300 mb-1">Series Name</label>
                    <input type="text" id="seriesName" value={seriesName} onChange={e => setSeriesName(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bee-gold"/>
                </div>
                 <div>
                    <label htmlFor="storyName" className="block text-sm font-medium text-gray-300 mb-1">Story Name</label>
                    <input type="text" id="storyName" value={storyName} onChange={e => setStoryName(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bee-gold"/>
                </div>
            </div>
         </CollapsibleSection>

         <CollapsibleSection title="Character References">
            <div className="grid grid-cols-2 gap-4">
                {characters.map(char => (
                    <CharacterSlot key={char.id} character={char} onUpdate={onUpdateCharacter} onGenerate={onGenerateCharacter} />
                ))}
            </div>
         </CollapsibleSection>

         <CollapsibleSection title="Style & Format">
             <div>
                <label htmlFor="style" className="block text-sm font-medium text-gray-300 mb-1">Image Style</label>
                <select id="style" value={style} onChange={e => setStyle(e.target.value as ImageStyle)} className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bee-gold">
                    {Object.values(ImageStyle).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
             </div>
             <div>
                <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-300 mb-1">Aspect Ratio</label>
                <select id="aspectRatio" value={aspectRatio} onChange={e => setAspectRatio(e.target.value as AspectRatio)} className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bee-gold">
                    {Object.values(AspectRatio).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <p className="text-xs text-gray-500 mt-1">Note: The model will attempt to match the ratio but consistency is prioritized.</p>
             </div>
         </CollapsibleSection>

        <CollapsibleSection title="Prompt List">
            <div className="space-y-2">
                {prompts.map((prompt, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <span className="text-gray-400">{index + 1}.</span>
                        <textarea
                            value={prompt}
                            onChange={e => handlePromptChange(index, e.target.value)}
                            rows={2}
                            className="flex-grow bg-gray-800 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bee-gold resize-none text-sm"
                            placeholder={`Prompt ${index + 1}`}
                        />
                        <button onClick={() => handleRemovePrompt(index)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                            <TrashIcon />
                        </button>
                    </div>
                ))}
                
                <div className="grid grid-cols-2 gap-2 mt-4">
                    {prompts.length < 10 && (
                        <button 
                            onClick={handleAddPrompt} 
                            className="flex items-center justify-center space-x-2 py-2 px-4 border-2 border-dashed border-gray-600 rounded-md text-gray-400 hover:text-white hover:border-gray-400 transition-colors text-xs font-bold"
                        >
                            <PlusIcon className="w-4 h-4" />
                            <span>Add Step</span>
                        </button>
                    )}
                    
                    <button 
                        onClick={onSuggestPrompt}
                        disabled={isSuggesting}
                        className="flex items-center justify-center space-x-2 py-2 px-4 bg-bee-gold/10 border border-bee-gold text-bee-gold rounded-md hover:bg-bee-gold hover:text-buzz-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold"
                    >
                        {isSuggesting ? (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                        ) : (
                            <SparklesIcon className="w-4 h-4" />
                        )}
                        <span>Magic Prompt</span>
                    </button>
                </div>
            </div>
        </CollapsibleSection>
      </div>
      <div className="p-4 mt-4">
        <button
          onClick={onGenerateAll}
          disabled={isLoading}
          className="w-full bg-red-600 text-white font-bold text-lg py-3 rounded-lg hover:bg-red-700 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-105"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Story...
            </>
          ) : (
            'Render Sequence'
          )}
        </button>
      </div>
    </aside>
  );
};
