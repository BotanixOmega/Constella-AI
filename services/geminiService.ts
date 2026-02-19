
import { GoogleGenAI, Modality, Type } from "@google/genai";

const MAX_RETRIES = 3;

export const generateImageWithRetry = async (prompt: string, referenceImages: { data: string, mimeType: string }[], styleReference?: { data: string, mimeType: string }): Promise<string | null> => {
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            return await generateImage(prompt, referenceImages, styleReference);
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

const generateImage = async (prompt: string, referenceImages: { data: string, mimeType: string }[], styleReference?: { data: string, mimeType: string }): Promise<string | null> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const parts = [];
  
  if (styleReference) {
    parts.push({
        inlineData: {
          data: styleReference.data,
          mimeType: styleReference.mimeType,
        },
    });
    parts.push({ text: "Use the artistic style of the image above strictly as a visual reference for the generated output." });
  }

  parts.push(...referenceImages.map(img => ({
      inlineData: {
        data: img.data,
        mimeType: img.mimeType,
      },
  })));
  
  parts.push({ text: prompt });

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
  synopsis?: string;
  activeCharacters?: string[];
}): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const charsInContext = (context.activeCharacters?.length ? context.activeCharacters : context.characters).join(', ');
  
  const prompt = `You are a creative story boarding assistant for the series "${context.seriesName}".
  Synopsis: ${context.synopsis || "No synopsis provided."}
  Story: ${context.storyName}
  Characters Available: ${context.characters.join(', ')}
  Current Active Scene Characters: ${charsInContext}
  Previous plot beats: ${context.existingPrompts.filter(p => p.trim()).join(' | ')}
  
  Suggest ONE creative, visually interesting image prompt for the NEXT scene. 
  Focus on lighting, action, and cinematic placement. Keep it under 40 words. 
  Output ONLY the prompt text.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  return response.text?.trim() || "A cinematic scene featuring the characters.";
};

export const suggestBulkScenes = async (context: {
    storyName: string;
    seriesName: string;
    activeCharacters: string[];
    synopsis: string;
    count: number;
    existingScenes: string[];
}): Promise<string[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `Generate ${context.count} unique, sequential story scene prompts for the series "${context.seriesName}".
    Synopsis: ${context.synopsis}
    Active Characters: ${context.activeCharacters.join(', ')}
    Already established scenes: ${context.existingScenes.filter(s => s.trim()).join(' | ')}
    
    Each scene should be a brief visual description for an image generator. 
    Maintain a coherent narrative flow.
    Return the result as a JSON array of strings.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        }
    });

    try {
        const scenes = JSON.parse(response.text || "[]");
        return Array.isArray(scenes) ? scenes : [];
    } catch (e) {
        console.error("Failed to parse bulk scenes", e);
        return [];
    }
}

export const generateSynopsis = async (characters: string[]): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Generate a riveting short storyline synopsis involving these characters: ${characters.join(', ')}. 
    If some are unnamed, give them interesting archetypes. Focus on drama and visual potential. Max 250 words.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
    });
    return response.text?.trim() || "A mysterious adventure begins...";
};

export const enhanceSynopsis = async (existing: string, characters: string[]): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Rewrite and enhance the following synopsis to be more engaging, cinematic, and professional, providing more opportunity for story diversion and character development. 
    Characters: ${characters.join(', ')}
    Original: ${existing}
    Max 300 words.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
    });
    return response.text?.trim() || existing;
};
