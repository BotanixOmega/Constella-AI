
import { GoogleGenAI, Modality } from "@google/genai";

const MAX_RETRIES = 3;

export const generateImageWithRetry = async (prompt: string, referenceImages: { data: string, mimeType: string }[]): Promise<string | null> => {
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            return await generateImage(prompt, referenceImages);
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error);
            if (i === MAX_RETRIES - 1) {
                throw error;
            }
            await new Promise(res => setTimeout(res, 1000 * (i + 1))); // Exponential backoff
        }
    }
    return null;
};

const generateImage = async (prompt: string, referenceImages: { data: string, mimeType: string }[]): Promise<string | null> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const parts = [
    ...referenceImages.map(img => ({
        inlineData: {
          data: img.data,
          mimeType: img.mimeType,
        },
    })),
    { text: prompt },
  ];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts ?? []) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  return null;
};

export const suggestCreativePrompt = async (context: {
  storyName: string;
  seriesName: string;
  characters: string[];
  existingPrompts: string[];
}): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `You are a creative story boarding assistant. 
  Given the following context:
  - Series: ${context.seriesName}
  - Story: ${context.storyName}
  - Characters: ${context.characters.join(', ')}
  - Previous plot beats: ${context.existingPrompts.filter(p => p.trim()).join(' | ')}
  
  Suggest ONE creative, highly descriptive, and visually interesting image prompt for the next scene in this sequence. 
  The prompt should be written for an AI image generator. 
  Focus on lighting, action, and character placement.
  Keep it under 40 words. 
  Output ONLY the prompt text, no extra commentary or quotes.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  return response.text?.trim() || "A cinematic scene featuring the characters.";
};
