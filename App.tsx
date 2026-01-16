
import React, { useState, useCallback } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { XIcon } from './components/icons/XIcon';
import { Character, GeneratedImageResult, ImageStyle, AspectRatio } from './types';
import { generateImageWithRetry, suggestCreativePrompt } from './services/geminiService';

const App: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([
    { id: 1, name: 'Character 1', image: null, mimeType: null, rotation: 0, isSelected: true },
    { id: 2, name: 'Character 2', image: null, mimeType: null, rotation: 0, isSelected: false },
    { id: 3, name: 'Character 3', image: null, mimeType: null, rotation: 0, isSelected: false },
    { id: 4, name: 'Character 4', image: null, mimeType: null, rotation: 0, isSelected: false },
  ]);
  const [style, setStyle] = useState<ImageStyle>(ImageStyle.ANIME);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.ONE_ONE);
  const [prompts, setPrompts] = useState<string[]>(['Character 1 running in the park']);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [storyName, setStoryName] = useState('MyFirstStory');
  const [seriesName, setSeriesName] = useState('MyFirstSeries');
  
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

    const results: GeneratedImageResult[] = [];
    for (const prompt of prompts) {
      if (!prompt.trim()) continue;
      try {
        const fullPrompt = `In a ${style} style, generate an image for the following scene: "${prompt}". Use the provided reference images to maintain character consistency. The characters are described as follows: ${selectedCharacters.map(c => c.name).join(', ')}.`;
        const imageData = await generateImageWithRetry(fullPrompt, referenceImages);
        if (imageData) {
          results.push({ id: crypto.randomUUID(), prompt, imageData });
          setGeneratedImages([...results]); // Update incrementally
        } else {
           setError(`Failed to generate image for prompt: "${prompt}"`);
        }
      } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        setError(`An error occurred while generating images: ${errorMessage}`);
        break;
      }
    }

    setIsLoading(false);
  }, [characters, prompts, style]);
  
  const handleGenerateCharacter = useCallback(async (characterId: number) => {
      const character = characters.find(c => c.id === characterId);
      if (!character) return;

      setIsLoading(true);
      setError(null);
      try {
        const prompt = `Generate a character portrait of ${character.name}. Style: ${style}.`;
        const imageData = await generateImageWithRetry(prompt, []);
        if (imageData) {
            handleUpdateCharacter({
                ...character,
                image: imageData,
                mimeType: 'image/png'
            });
        } else {
            setError(`Failed to generate character ${character.name}`);
        }
      } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        setError(`An error occurred while generating character: ${errorMessage}`);
      }
      setIsLoading(false);

  }, [characters, style]);

  const handleSuggestPrompt = useCallback(async () => {
    setIsSuggesting(true);
    try {
      const characterNames = characters.filter(c => c.isSelected).map(c => c.name);
      const newPrompt = await suggestCreativePrompt({
        storyName,
        seriesName,
        characters: characterNames,
        existingPrompts: prompts
      });
      setPrompts(prev => [...prev, newPrompt]);
    } catch (e) {
      console.error(e);
      setError("Failed to suggest a creative prompt.");
    } finally {
      setIsSuggesting(false);
    }
  }, [characters, storyName, seriesName, prompts]);


  return (
    <div className="min-h-screen bg-buzz-black font-sans flex flex-col">
      <Header />
      
      <main className="flex-grow flex flex-col lg:flex-row relative">
        <ControlPanel
          characters={characters}
          onUpdateCharacter={handleUpdateCharacter}
          onGenerateCharacter={handleGenerateCharacter}
          style={style}
          setStyle={setStyle}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
          prompts={prompts}
          setPrompts={setPrompts}
          onGenerateAll={handleGenerateAll}
          onSuggestPrompt={handleSuggestPrompt}
          isLoading={isLoading}
          isSuggesting={isSuggesting}
          storyName={storyName}
          setStoryName={setStoryName}
          seriesName={seriesName}
          setSeriesName={setSeriesName}
        />
        <ResultsDisplay 
            images={generatedImages} 
            isLoading={isLoading} 
            error={error} 
            storyName={storyName}
            seriesName={seriesName}
            onPreview={setPreviewImage}
        />
      </main>

      <Footer />
      
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-gray-900 p-2 rounded-2xl shadow-2xl border border-bee-gold/20" onClick={e => e.stopPropagation()}>
             <img src={`data:image/png;base64,${previewImage}`} alt="Generated Preview" className="max-w-full max-h-[85vh] object-contain rounded-xl"/>
             <button
                onClick={() => setPreviewImage(null)}
                className="absolute -top-4 -right-4 bg-bee-gold text-buzz-black rounded-full p-2 hover:bg-bee-amber transition-transform duration-200 hover:scale-110 shadow-lg"
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
