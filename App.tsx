
import React, { useState, useCallback } from 'react';
import { Analytics } from '@vercel/analytics/react';
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
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleResetAll = useCallback(() => {
    setCharacters(
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
    setStyle(ImageStyle.ANIME);
    setAspectRatio(AspectRatio.ONE_ONE);
    setStyleLocked(false);
    setAspectRatioLocked(false);
    setPrompts(Array(6).fill(''));
    setPromptActiveCharacterIds([]);
    setGeneratedImages([]);
    setError(null);
    setLoadingSlots({});
    setStoryName('NewStory');
    setSeriesName('NewSeries');
    setSynopsis('');
    setPreviewImage(null);
    setIsResetConfirmOpen(false);
  }, []);

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
        const imageData = await generateImageWithRetry(fullPrompt, referenceImages, styleRef, aspectRatio);
        if (imageData) {
          results.push({ id: crypto.randomUUID(), prompt: text, imageData, sceneIndex: originalIndex });
          setGeneratedImages([...results]);
        }
      } catch (e: any) {
        const errorDetail = e?.message || String(e);
        try {
          if (errorDetail.startsWith('{')) {
            const parsed = JSON.parse(errorDetail);
            parsed.message = `Failed at Scene ${originalIndex}: ${parsed.message}`;
            setError(JSON.stringify(parsed));
          } else {
            setError(JSON.stringify({
              message: `Failed at Scene ${originalIndex}: ${errorDetail}`,
              solution: "Verify your connection is active and that your model prompt descriptions are short and clear."
            }));
          }
        } catch {
          setError(errorDetail);
        }
        break;
      }
    }
    setIsLoading(false);
  }, [characters, prompts, style, synopsis, aspectRatio]);
  
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
        const imageData = await generateImageWithRetry(prompt, [], styleRef, aspectRatio);
        if (imageData) {
            handleUpdateCharacter({
                ...character,
                image: imageData,
                mimeType: 'image/png'
            });
        }
      } catch (e: any) {
        const errorDetail = e?.message || String(e);
        try {
          if (errorDetail.startsWith('{')) {
            const parsed = JSON.parse(errorDetail);
            parsed.message = `Failed to generate portrait for ${character.name}: ${parsed.message}`;
            setError(JSON.stringify(parsed));
          } else {
            setError(JSON.stringify({
              message: `Failed to generate portrait for ${character.name}: ${errorDetail}`,
              solution: "Double-check that you have specified a clear description prompt in Settings and submit again."
            }));
          }
        } catch {
          setError(errorDetail);
        }
      }
      setLoadingSlots(prev => ({ ...prev, [characterId]: false }));
  }, [characters, style, aspectRatio]);

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
    } catch (e: any) {
        const errorDetail = e?.message || String(e);
        try {
          if (errorDetail.startsWith('{')) {
            setError(errorDetail);
          } else {
            setError(JSON.stringify({
              message: `Failed to suggest scene: ${errorDetail}`,
              solution: "To resolve, enter a brief synopsis or series name to supply more contextual clues for Gemini."
            }));
          }
        } catch {
          setError(`Failed to suggest scene: ${errorDetail}`);
        }
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
    } catch (e: any) {
        const errorDetail = e?.message || String(e);
        try {
          if (errorDetail.startsWith('{')) {
            setError(errorDetail);
          } else {
            setError(JSON.stringify({
              message: `Failed to populate scenes: ${errorDetail}`,
              solution: "Verify that your storyline synopsis contains clear narrative descriptions for prompt extraction."
            }));
          }
        } catch {
          setError(`Failed to populate scenes: ${errorDetail}`);
        }
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
      <Header onResetTrigger={() => setIsResetConfirmOpen(true)} />
      
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

      {isResetConfirmOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-900 border border-red-500/30 w-full max-w-md rounded-2xl p-6 shadow-2xl transform transition-transform duration-300 scale-100 flex flex-col space-y-4">
            <div className="flex items-center space-x-3 text-red-500">
              <div className="bg-red-950 p-2 rounded-lg border border-red-800/40">
                <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-red-400">Confirm Global Reset</h3>
            </div>

            <p className="text-gray-300 text-xs leading-relaxed font-medium">
              Are you sure you want to clear your entire storyline? This resets:
            </p>
            
            <ul className="text-gray-400 text-[11px] space-y-1 list-disc list-inside">
              <li>All 10 customized Cast characters and portraits</li>
              <li>Story Name, Series Name, and text Synopsis</li>
              <li>Style configurations and lock states</li>
              <li>All scene prompts and successfully rendered result images</li>
            </ul>

            <p className="text-gray-400 text-[11px] italic font-semibold border-l-2 border-red-500/40 pl-2 py-0.5">
              Warning: This action is destructive and cannot be undone.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2.5 px-4 bg-gray-800 hover:bg-gray-750 text-gray-300 font-bold text-[10px] tracking-widest uppercase rounded-xl transition-all"
              >
                No, Keep My Progress
              </button>
              <button
                onClick={handleResetAll}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-black text-[10px] tracking-widest uppercase rounded-xl shadow-lg shadow-red-950/20 hover:shadow-red-500/10 transition-all border border-red-500/20"
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
      <Analytics />
    </div>
  );
};

export default App;
