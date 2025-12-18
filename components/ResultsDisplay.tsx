
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
    images.forEach((img, index) => {
        const paddedIndex = String(index + 1).padStart(3, '0');
        const filename = `${paddedIndex}_${storyName}_${seriesName}.png`;
        downloadImage(img.imageData, filename);
    });
  };
    
  return (
    <section className="w-full lg:w-2/3 xl:w-3/4 p-6 lg:max-h-screen lg:overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-bee-gold">Generated Images</h1>
        {images.length > 0 && (
          <button 
            onClick={handleDownloadAll}
            className="bg-bee-gold text-buzz-black font-bold py-2 px-4 rounded-lg flex items-center space-x-2 hover:bg-bee-amber transition-transform duration-200 hover:scale-105"
          >
            <DownloadIcon />
            <span>Download All</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {isLoading && images.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
           <svg className="animate-spin h-12 w-12 text-bee-gold mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xl">Generating your creative story...</p>
          <p>Please wait, this might take a moment.</p>
        </div>
      )}

      {!isLoading && images.length === 0 && !error && (
         <div className="flex items-center justify-center h-full text-center text-gray-500 border-2 border-dashed border-gray-700 rounded-lg p-12">
            <p className="text-xl">Your generated story images will appear here.</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {images.map((img, index) => {
            const paddedIndex = String(index + 1).padStart(3, '0');
            const filename = `${paddedIndex}_${storyName}_${seriesName}.png`;
          return (
            <div key={img.id} className="group relative aspect-square bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <img src={`data:image/png;base64,${img.imageData}`} alt={img.prompt} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"/>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center space-x-4">
                    <button onClick={() => onPreview(img.imageData)} className="opacity-0 group-hover:opacity-100 transform group-hover:scale-100 scale-75 transition-all duration-300 bg-white/20 backdrop-blur-sm p-3 rounded-full text-white hover:bg-white/40">
                        <PreviewIcon />
                    </button>
                    <button onClick={() => downloadImage(img.imageData, filename)} className="opacity-0 group-hover:opacity-100 transform group-hover:scale-100 scale-75 transition-all duration-300 delay-100 bg-white/20 backdrop-blur-sm p-3 rounded-full text-white hover:bg-white/40">
                        <DownloadIcon />
                    </button>
                </div>
            </div>
          )
        })}
      </div>
    </section>
  );
};
