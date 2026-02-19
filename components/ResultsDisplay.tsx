
import React from 'react';
import { GeneratedImageResult } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { PreviewIcon } from './icons/PreviewIcon';

interface ResultsDisplayProps {
  images: GeneratedImageResult[];
  isLoading: boolean;
  error: string | null;
  storyName: string;
  seriesName: string;
  onPreview: (imageData: string) => void;
}

const downloadImage = (imageData: string, filename: string) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${imageData}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ images, isLoading, error, storyName, seriesName, onPreview }) => {

  const handleDownloadAll = () => {
    images.forEach((img) => {
        const filename = `Scene${img.sceneIndex}_${storyName}_${seriesName}.png`;
        downloadImage(img.imageData, filename);
    });
  };
    
  return (
    <section className="p-6 h-full">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-black/80 backdrop-blur-md z-10 py-2">
        <div className="flex items-center space-x-4">
            <h1 className="text-xl font-black uppercase tracking-tighter text-bee-gold">Render Output</h1>
            {isLoading && (
                <div className="flex items-center space-x-2 text-[10px] font-bold text-bee-gold animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-bee-gold"></div>
                    <span>PROCESSING SEQUENCE...</span>
                </div>
            )}
        </div>
        {images.length > 0 && (
          <button 
            onClick={handleDownloadAll}
            className="text-[10px] font-black uppercase tracking-widest border border-bee-gold text-bee-gold px-4 py-1.5 rounded-full hover:bg-bee-gold hover:text-black transition-all flex items-center space-x-2"
          >
            <DownloadIcon className="w-3 h-3" />
            <span>Export Batch</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-950/30 border border-red-900/50 text-red-500 text-[10px] font-bold uppercase tracking-widest px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      {images.length === 0 && !isLoading && (
         <div className="flex items-center justify-center h-48 text-center text-gray-700 border-2 border-dashed border-gray-900 rounded-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em]">Ready for Narrative Input</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {images.map((img) => {
            const filename = `Scene${img.sceneIndex}_${storyName}_${seriesName}.png`;
          return (
            <div key={img.id} className="group relative aspect-square bg-gray-950 rounded-xl overflow-hidden shadow-2xl border border-gray-900 hover:border-bee-gold/40 transition-all">
                <img src={`data:image/png;base64,${img.imageData}`} alt={img.prompt} className="w-full h-full object-cover"/>
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black text-white/70">
                    S-{img.sceneIndex}
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center space-x-3">
                    <button onClick={() => onPreview(img.imageData)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                        <PreviewIcon className="w-4 h-4 text-white" />
                    </button>
                    <button onClick={() => downloadImage(img.imageData, filename)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                        <DownloadIcon className="w-4 h-4 text-white" />
                    </button>
                </div>
            </div>
          )
        })}
        {isLoading && (
            <div className="aspect-square bg-gray-900 rounded-xl animate-pulse flex items-center justify-center border border-gray-800">
                <svg className="animate-spin h-5 w-5 text-bee-gold" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
            </div>
        )}
      </div>
    </section>
  );
};
