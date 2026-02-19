
import React, { useState, useCallback } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Header } from './components/Header';
import { XIcon } from './components/icons/XIcon';
import { Character, GeneratedImageResult, ImageStyle, AspectRatio } from './types';
import { generateImageWithRetry, suggestCreativePrompt, generateSynopsis, enhanceSynopsis, suggestBulkScenes } from './services/geminiService';

const INITIAL_CHARACTERS = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

const App: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>(
    INITIAL_CHARACTERS.map((name, i) => ({
      id: i + 1,
      name,
      image: null,
      mimeType: null,
      rotation: 0,
      isSelected: i < 4,
      prompt: ''
    }))
  );
  
  const [style, setStyle] = useState<ImageStyle>(ImageStyle.ANIME);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.ONE_ONE);
  const [styleLocked, setStyleLocked] = useState(false);
  const [aspectRatioLocked, setAspectRatioLocked] = useState(false);
  
  const [prompts, setPrompts] = useState<string[]>(Array(6).fill(''));
  const [promptActiveCharacterIds, setPromptActiveCharacterIds] = useState<number[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  
  const [storyName, setStoryName] = useState('NewStory');
  const [seriesName, setSeriesName] = useState('NewSeries');
  const [synopsis, setSynopsis] = useState('');
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleUpdateCharacter = (updatedCharacter: Character) => {
    setCharacters(characters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c));
  };

  const handleGenerateAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    const selectedCharacters = characters.filter(c => c.isSelected && c.image && c.mimeType);
    if (selectedCharacters.length === 0) {
      setError('Please select at least one character with a reference image.');
      setIsLoading(false);
      return;
    }

    const referenceImages = selectedCharacters.map(c => ({
      data: c.image!,
      mimeType: c.mimeType!
    }));

    const styleRefChar = characters.find(c => c.id === 1);
    const styleRef = (style === ImageStyle.USE_REFERENCE_ONE && styleRefChar?.image) 
        ? { data: styleRefChar.image, mimeType: styleRefChar.mimeType! } 
        : undefined;

    const results: GeneratedImageResult[] = [];
    const activePrompts = prompts.map((p, i) => ({ text: p, originalIndex: i + 1 })).filter(p => p.text.trim());
    
    for (let i = 0; i < activePrompts.length; i++) {
      const { text, originalIndex } = activePrompts[i];
      try {
        const fullPrompt = `${style !== ImageStyle.USE_REFERENCE_ONE ? `In a ${style} style, ` : ''}generate an image for the scene: "${text}". Consistent characters: ${selectedCharacters.map(c => c.name).join(', ')}. Story context: ${synopsis.slice(0, 200)}`;
        const imageData = await generateImageWithRetry(fullPrompt, referenceImages, styleRef);
        if (imageData) {
          results.push({ id: crypto.randomUUID(), prompt: text, imageData, sceneIndex: originalIndex });
          setGeneratedImages([...results]);
        }
      } catch (e) {
        setError(`Failed at scene ${originalIndex}.`);
        break;
      }
    }
    setIsLoading(false);
  }, [characters, prompts, style, synopsis]);
  
  const handleGenerateCharacter = useCallback(async (characterId: number) => {
      const character = characters.find(c => c.id === characterId);
      if (!character) return;

      setLoadingSlots(prev => ({ ...prev, [characterId]: true }));
      setError(null);
      try {
        const promptText = character.prompt || `A character portrait of ${character.name}.`;
        const styleRefChar = characters.find(c => c.id === 1);
        const styleRef = (style === ImageStyle.USE_REFERENCE_ONE && styleRefChar?.image && characterId !== 1) 
            ? { data: styleRefChar.image, mimeType: styleRefChar.mimeType! } 
            : undefined;

        const prompt = `${style !== ImageStyle.USE_REFERENCE_ONE ? `Style: ${style}. ` : ''}${promptText}`;
        const imageData = await generateImageWithRetry(prompt, [], styleRef);
        if (imageData) {
            handleUpdateCharacter({
                ...character,
                image: imageData,
                mimeType: 'image/png'
            });
        }
      } catch (e) {
        setError(`Failed to generate character ${character.name}`);
      }
      setLoadingSlots(prev => ({ ...prev, [characterId]: false }));
  }, [characters, style]);

  const handleSuggestSinglePrompt = useCallback(async (index: number) => {
    setIsSuggesting(true);
    try {
        const activeCharNames = characters.filter(c => promptActiveCharacterIds.includes(c.id)).map(c => c.name);
        const newPrompt = await suggestCreativePrompt({
            storyName,
            seriesName,
            characters: characters.map(c => c.name),
            activeCharacters: activeCharNames,
            existingPrompts: prompts,
            synopsis
        });
        const newPrompts = [...prompts];
        newPrompts[index] = newPrompt;
        setPrompts(newPrompts);
    } catch (e) {
        setError("Failed to suggest scene.");
    } finally {
        setIsSuggesting(false);
    }
  }, [characters, promptActiveCharacterIds, storyName, seriesName, prompts, synopsis]);

  const handleSuggestBulkPrompts = useCallback(async () => {
    setIsSuggesting(true);
    try {
        const emptyIndices = prompts.map((p, i) => p.trim() === '' ? i : -1).filter(i => i !== -1);
        if (emptyIndices.length === 0) return;

        const activeCharNames = characters.filter(c => promptActiveCharacterIds.includes(c.id)).map(c => c.name);
        const suggested = await suggestBulkScenes({
            storyName,
            seriesName,
            activeCharacters: activeCharNames,
            synopsis,
            count: emptyIndices.length,
            existingScenes: prompts
        });

        const newPrompts = [...prompts];
        emptyIndices.forEach((targetIdx, i) => {
            if (suggested[i]) newPrompts[targetIdx] = suggested[i];
        });
        setPrompts(newPrompts);
    } catch (e) {
        setError("Failed to populate scenes.");
    } finally {
        setIsSuggesting(false);
    }
  }, [characters, promptActiveCharacterIds, storyName, seriesName, prompts, synopsis]);

  const handleGenerateSynopsis = async () => {
    setIsLoading(true);
    const chars = characters.filter(c => c.isSelected).map(c => c.name);
    const result = await generateSynopsis(chars);
    setSynopsis(result);
    setIsLoading(false);
  };

  const handleEnhanceSynopsis = async () => {
    setIsLoading(true);
    const chars = characters.filter(c => c.isSelected).map(c => c.name);
    const result = await enhanceSynopsis(synopsis, chars);
    setSynopsis(result);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black font-sans flex flex-col overflow-hidden">
      <Header />
      
      <div className="flex-1 flex flex-col">
        {/* TOP: Results Display */}
        <div className="h-1/2 overflow-y-auto border-b border-gray-800">
            <ResultsDisplay 
                images={generatedImages} 
                isLoading={isLoading} 
                error={error} 
                storyName={storyName}
                seriesName={seriesName}
                onPreview={setPreviewImage}
            />
        </div>

        {/* BOTTOM: Generations Setting */}
        <div className="h-1/2 bg-gray-900 overflow-y-auto">
            <ControlPanel
              characters={characters}
              loadingSlots={loadingSlots}
              onUpdateCharacter={handleUpdateCharacter}
              onGenerateCharacter={handleGenerateCharacter}
              style={style}
              setStyle={setStyle}
              aspectRatio={aspectRatio}
              setAspectRatio={setAspectRatio}
              styleLocked={styleLocked}
              setStyleLocked={setStyleLocked}
              aspectRatioLocked={aspectRatioLocked}
              setAspectRatioLocked={setAspectRatioLocked}
              prompts={prompts}
              setPrompts={setPrompts}
              onGenerateAll={handleGenerateAll}
              onSuggestPrompt={handleSuggestBulkPrompts}
              onSuggestSinglePrompt={handleSuggestSinglePrompt}
              promptActiveCharacterIds={promptActiveCharacterIds}
              setPromptActiveCharacterIds={setPromptActiveCharacterIds}
              isLoading={isLoading}
              isSuggesting={isSuggesting}
              storyName={storyName}
              setStoryName={setStoryName}
              seriesName={seriesName}
              setSeriesName={setSeriesName}
              synopsis={synopsis}
              setSynopsis={setSynopsis}
              onGenerateSynopsis={handleGenerateSynopsis}
              onEnhanceSynopsis={handleEnhanceSynopsis}
            />
        </div>
      </div>
      
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-md"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-gray-900 p-2 rounded-2xl shadow-2xl border border-bee-gold/20" onClick={e => e.stopPropagation()}>
             <img src={`data:image/png;base64,${previewImage}`} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-xl"/>
             <button
                onClick={() => setPreviewImage(null)}
                className="absolute -top-4 -right-4 bg-bee-gold text-black rounded-full p-2 hover:bg-bee-amber transition-transform shadow-lg"
              >
               <XIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
