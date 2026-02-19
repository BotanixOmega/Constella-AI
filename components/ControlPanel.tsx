
import React, { useState } from 'react';
import { Character, ImageStyle, AspectRatio } from '../types';
import { CharacterSlot } from './CharacterSlot';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface ControlPanelProps {
  characters: Character[];
  loadingSlots: Record<number, boolean>;
  onUpdateCharacter: (character: Character) => void;
  onGenerateCharacter: (characterId: number) => void;
  style: ImageStyle;
  setStyle: (style: ImageStyle) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  styleLocked: boolean;
  setStyleLocked: (l: boolean) => void;
  aspectRatioLocked: boolean;
  setAspectRatioLocked: (l: boolean) => void;
  prompts: string[];
  setPrompts: (prompts: string[]) => void;
  onGenerateAll: () => void;
  onSuggestPrompt: () => void;
  onSuggestSinglePrompt: (index: number) => void;
  promptActiveCharacterIds: number[];
  setPromptActiveCharacterIds: (ids: number[]) => void;
  isLoading: boolean;
  isSuggesting: boolean;
  storyName: string;
  setStoryName: (name: string) => void;
  seriesName: string;
  setSeriesName: (name: string) => void;
  synopsis: string;
  setSynopsis: (s: string) => void;
  onGenerateSynopsis: () => void;
  onEnhanceSynopsis: () => void;
}

type Tab = 'General' | 'Output' | 'Cast' | 'Scenes';

export const ControlPanel: React.FC<ControlPanelProps> = (props) => {
    const {
        characters, loadingSlots, onUpdateCharacter, onGenerateCharacter, style, setStyle, aspectRatio, setAspectRatio,
        styleLocked, setStyleLocked, aspectRatioLocked, setAspectRatioLocked,
        prompts, setPrompts, onGenerateAll, onSuggestPrompt, onSuggestSinglePrompt,
        promptActiveCharacterIds, setPromptActiveCharacterIds,
        isLoading, isSuggesting,
        storyName, setStoryName, seriesName, setSeriesName,
        synopsis, setSynopsis, onGenerateSynopsis, onEnhanceSynopsis
    } = props;

  const [activeTab, setActiveTab] = useState<Tab>('General');

  const handleAddPrompt = () => {
    if (prompts.length < 20) {
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

  const togglePromptActiveChar = (id: number) => {
      if (promptActiveCharacterIds.includes(id)) {
          setPromptActiveCharacterIds(promptActiveCharacterIds.filter(i => i !== id));
      } else {
          setPromptActiveCharacterIds([...promptActiveCharacterIds, id]);
      }
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Mobile Render Button Section */}
      <div className="md:hidden p-4 border-b border-gray-800">
        <button
            onClick={onGenerateAll}
            disabled={isLoading}
            style={{ backgroundColor: '#55DDE0' }}
            className="w-full text-black font-black text-sm py-3 rounded-full hover:brightness-110 transition-all disabled:opacity-50 uppercase tracking-widest shadow-lg"
        >
            {isLoading ? 'RENDERING...' : 'RENDER'}
        </button>
      </div>

      {/* Tab Headers - Compact for all devices to fit on one row */}
      <div className="flex border-b border-gray-800 bg-gray-950 overflow-x-hidden sticky top-0 z-20">
        {[
          { id: 'General', label: 'General' },
          { id: 'Output', label: 'Output' },
          { id: 'Cast', label: 'Cast' },
          { id: 'Scenes', label: 'Scenes' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as Tab)}
            className={`flex-1 px-2 py-4 text-[9px] md:text-sm font-black uppercase tracking-[0.15em] md:tracking-widest transition-all whitespace-nowrap text-center ${
              activeTab === t.id 
                ? 'text-bee-gold border-b-2 border-bee-gold' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
        {/* Desktop RENDER Button */}
        <div className="hidden md:flex ml-auto items-center pr-6">
            <button
                onClick={onGenerateAll}
                disabled={isLoading}
                style={{ backgroundColor: '#55DDE0' }}
                className="text-black font-black text-[10px] px-8 py-2 rounded-full hover:brightness-110 transition-all disabled:opacity-50 uppercase tracking-widest"
            >
                {isLoading ? 'RENDERING...' : 'RENDER'}
            </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden">
        {activeTab === 'General' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Series Name</label>
                  <input value={seriesName} onChange={e => setSeriesName(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-bee-gold outline-none"/>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Story Name</label>
                  <input value={storyName} onChange={e => setStoryName(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-bee-gold outline-none"/>
                </div>
              </div>
            </div>
            <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Synopsis</label>
                <textarea 
                    value={synopsis} 
                    onChange={e => setSynopsis(e.target.value.slice(0, 1500))} 
                    rows={6}
                    className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-bee-gold outline-none resize-none leading-relaxed"
                    placeholder="Enter the overall narrative direction..."
                />
                <div className="flex flex-wrap gap-2">
                    <button onClick={onGenerateSynopsis} className="flex-1 min-w-fit px-4 py-2 bg-gray-800 text-[9px] font-black rounded hover:bg-gray-700 transition-colors uppercase tracking-widest">GENERATE STORYLINE</button>
                    <button onClick={onEnhanceSynopsis} className="flex-1 min-w-fit px-4 py-2 bg-gray-800 text-[9px] font-black rounded hover:bg-gray-700 transition-colors uppercase tracking-widest">ENHANCE STORY</button>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'Output' && (
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 max-w-4xl mx-auto items-start">
             <div className="space-y-4 w-full md:w-1/2">
                <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest">Image Style</label>
                    <button onClick={() => setStyleLocked(!styleLocked)} className={`text-[10px] font-black ${styleLocked ? 'text-bee-gold' : 'text-gray-600'}`}>
                        {styleLocked ? 'LOCKED' : 'LOCK'}
                    </button>
                </div>
                <select 
                    disabled={styleLocked}
                    value={style} 
                    onChange={e => setStyle(e.target.value as ImageStyle)} 
                    className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-bee-gold outline-none"
                >
                    {Object.values(ImageStyle).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
             </div>
             <div className="space-y-4 w-full md:w-1/2">
                <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest">Aspect Ratio</label>
                    <button onClick={() => setAspectRatioLocked(!aspectRatioLocked)} className={`text-[10px] font-black ${aspectRatioLocked ? 'text-bee-gold' : 'text-gray-600'}`}>
                        {aspectRatioLocked ? 'LOCKED' : 'LOCK'}
                    </button>
                </div>
                <select 
                    disabled={aspectRatioLocked}
                    value={aspectRatio} 
                    onChange={e => setAspectRatio(e.target.value as AspectRatio)} 
                    className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-bee-gold outline-none"
                >
                    {Object.values(AspectRatio).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
             </div>
          </div>
        )}

        {activeTab === 'Cast' && (
          <div className="grid grid-cols-2 md:flex md:overflow-x-auto gap-4 pb-4 px-1 no-scrollbar max-w-7xl mx-auto">
            {characters.map(char => (
                <div key={char.id} className="w-full md:min-w-[200px]">
                    <CharacterSlot 
                        character={char} 
                        isLoading={loadingSlots[char.id]}
                        onUpdate={onUpdateCharacter} 
                        onGenerate={onGenerateCharacter} 
                    />
                </div>
            ))}
          </div>
        )}

        {activeTab === 'Scenes' && (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Active Characters Sub-window */}
            <div className="bg-gray-950/50 p-4 rounded-xl border border-gray-800">
                <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-4">Select Active Characters for Next Generation</h3>
                <div className="flex flex-wrap gap-2">
                    {characters.map(c => (
                        <button
                            key={c.id}
                            onClick={() => togglePromptActiveChar(c.id)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all border ${
                                promptActiveCharacterIds.includes(c.id)
                                    ? 'bg-bee-gold text-black border-bee-gold'
                                    : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600'
                            }`}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                {prompts.map((prompt, index) => (
                    <div key={index} className="flex items-start space-x-3 bg-gray-950 p-3 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors group relative">
                        <span className="text-bee-gold font-black text-[10px] mt-2 w-5">{String(index + 1).padStart(2, '0')}</span>
                        <textarea
                            value={prompt}
                            onChange={e => handlePromptChange(index, e.target.value)}
                            rows={2}
                            className="flex-grow bg-transparent text-sm focus:outline-none resize-none placeholder-gray-800"
                            placeholder="Describe the action..."
                        />
                        <div className="flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => onSuggestSinglePrompt(index)} 
                                disabled={isSuggesting}
                                className="p-1.5 text-bee-gold/50 hover:text-bee-gold transition-colors" 
                                title="Magic Prompt"
                            >
                                <SparklesIcon className={`w-3.5 h-3.5 ${isSuggesting ? 'animate-pulse' : ''}`} />
                            </button>
                            <button 
                                onClick={() => handleRemovePrompt(index)} 
                                className="p-1.5 text-gray-700 hover:text-red-500 transition-colors" 
                                title="Remove"
                            >
                                <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 pb-10">
                {prompts.length < 20 && (
                    <button 
                        onClick={handleAddPrompt} 
                        className="w-full sm:w-auto flex items-center justify-center space-x-2 py-3 px-10 border border-gray-800 rounded-full text-gray-500 hover:text-white hover:border-gray-600 transition-all text-[10px] font-black uppercase tracking-widest"
                    >
                        <PlusIcon className="w-3.5 h-3.5" />
                        <span>Add Scene</span>
                    </button>
                )}
                <button 
                    onClick={onSuggestPrompt}
                    disabled={isSuggesting || promptActiveCharacterIds.length === 0}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 py-3 px-10 bg-bee-gold/5 border border-bee-gold/20 text-bee-gold rounded-full hover:bg-bee-gold/10 transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-30"
                >
                    {isSuggesting ? (
                        <div className="w-3.5 h-3.5 border-2 border-bee-gold border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <SparklesIcon className="w-3.5 h-3.5" />
                    )}
                    <span>Populate Scenes</span>
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
