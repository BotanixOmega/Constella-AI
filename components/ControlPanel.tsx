
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
  isLoading: boolean;
  isSuggesting: boolean;
  storyName: string;
  setStoryName: (name: string) => void;
  seriesName: string;
  setSeriesName: (name: string) => void;
  sceneNumber: string;
  setSceneNumber: (n: string) => void;
  synopsis: string;
  setSynopsis: (s: string) => void;
  onGenerateSynopsis: () => void;
  onEnhanceSynopsis: () => void;
}

type Tab = 'General' | 'OutputSettings' | 'CastMembers' | 'ScenesList';

export const ControlPanel: React.FC<ControlPanelProps> = (props) => {
    const {
        characters, loadingSlots, onUpdateCharacter, onGenerateCharacter, style, setStyle, aspectRatio, setAspectRatio,
        styleLocked, setStyleLocked, aspectRatioLocked, setAspectRatioLocked,
        prompts, setPrompts, onGenerateAll, onSuggestPrompt, isLoading, isSuggesting,
        storyName, setStoryName, seriesName, setSeriesName, sceneNumber, setSceneNumber,
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

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-800 bg-gray-950 px-4">
        {[
          { id: 'General', label: 'General' },
          { id: 'OutputSettings', label: 'Output Settings' },
          { id: 'CastMembers', label: 'Cast Members' },
          { id: 'ScenesList', label: 'Scenes List' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as Tab)}
            className={`px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all ${
              activeTab === t.id 
                ? 'text-bee-gold border-b-2 border-bee-gold' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
        <div className="ml-auto flex items-center pr-4">
            <button
                onClick={onGenerateAll}
                disabled={isLoading}
                style={{ backgroundColor: '#55DDE0' }}
                className="text-black font-black text-xs px-6 py-2 rounded-full hover:brightness-110 transition-all disabled:opacity-50 uppercase tracking-tighter"
            >
                {isLoading ? 'Rendering...' : 'Render Sequence'}
            </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'General' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Series Name</label>
                  <input value={seriesName} onChange={e => setSeriesName(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-bee-gold outline-none"/>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Story Name</label>
                  <input value={storyName} onChange={e => setStoryName(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-bee-gold outline-none"/>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Scene Number</label>
                <input type="number" value={sceneNumber} onChange={e => setSceneNumber(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-bee-gold outline-none max-w-[100px]"/>
              </div>
            </div>
            <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Synopsis (max 300 words)</label>
                <textarea 
                    value={synopsis} 
                    onChange={e => setSynopsis(e.target.value.slice(0, 1500))} 
                    rows={6}
                    className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-bee-gold outline-none resize-none"
                    placeholder="Enter the overall narrative direction..."
                />
                <div className="flex space-x-2">
                    <button onClick={onGenerateSynopsis} className="px-3 py-1 bg-gray-800 text-[10px] font-bold rounded hover:bg-gray-700 transition-colors">GENERATE STORYLINE</button>
                    <button onClick={onEnhanceSynopsis} className="px-3 py-1 bg-gray-800 text-[10px] font-bold rounded hover:bg-gray-700 transition-colors">ENHANCE STORY</button>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'OutputSettings' && (
          <div className="flex flex-wrap gap-12 max-w-4xl mx-auto items-start">
             <div className="space-y-4 min-w-[250px]">
                <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest">Image Style</label>
                    <button onClick={() => setStyleLocked(!styleLocked)} className={`text-[10px] font-bold ${styleLocked ? 'text-bee-gold' : 'text-gray-600'}`}>
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
             <div className="space-y-4 min-w-[250px]">
                <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest">Aspect Ratio</label>
                    <button onClick={() => setAspectRatioLocked(!aspectRatioLocked)} className={`text-[10px] font-bold ${aspectRatioLocked ? 'text-bee-gold' : 'text-gray-600'}`}>
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

        {activeTab === 'CastMembers' && (
          <div className="flex overflow-x-auto gap-4 pb-4 px-2 no-scrollbar">
            {characters.map(char => (
                <div key={char.id} className="min-w-[180px]">
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

        {activeTab === 'ScenesList' && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                {prompts.map((prompt, index) => (
                    <div key={index} className="flex items-start space-x-3 bg-gray-950 p-3 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors group">
                        <span className="text-bee-gold font-black text-xs mt-2">{String(index + 1).padStart(2, '0')}</span>
                        <textarea
                            value={prompt}
                            onChange={e => handlePromptChange(index, e.target.value)}
                            rows={2}
                            className="flex-grow bg-transparent text-sm focus:outline-none resize-none"
                            placeholder="Describe the action and environment..."
                        />
                        <button onClick={() => handleRemovePrompt(index)} className="p-2 text-gray-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
            
            <div className="flex justify-center mt-8 space-x-4">
                {prompts.length < 20 && (
                    <button 
                        onClick={handleAddPrompt} 
                        className="flex items-center space-x-2 py-2 px-8 border border-gray-800 rounded-full text-gray-500 hover:text-white hover:border-gray-600 transition-all text-xs font-bold uppercase tracking-widest"
                    >
                        <PlusIcon className="w-3 h-3" />
                        <span>Add Scene</span>
                    </button>
                )}
                <button 
                    onClick={onSuggestPrompt}
                    disabled={isSuggesting}
                    className="flex items-center space-x-2 py-2 px-8 bg-bee-gold/5 border border-bee-gold/20 text-bee-gold rounded-full hover:bg-bee-gold/10 transition-all text-xs font-bold uppercase tracking-widest disabled:opacity-50"
                >
                    <SparklesIcon className="w-3 h-3" />
                    <span>Magic Prompt</span>
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
