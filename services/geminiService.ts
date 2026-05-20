const MAX_RETRIES = 3;

// Structured error helper
const handleNetworkError = async (response: Response) => {
  try {
    const errorData = await response.json();
    if (errorData?.error) {
      if (typeof errorData.error === "object") {
        throw new Error(JSON.stringify(errorData.error));
      }
      throw new Error(JSON.stringify({
        message: errorData.error,
        solution: "Analyze original prompt structure, check your Gemini API key, or contact support."
      }));
    }
  } catch (e: any) {
    if (e.message?.startsWith("{")) throw e;
  }
  throw new Error(JSON.stringify({
    message: `HTTP error ${response.status}: ${response.statusText}`,
    solution: "A connection or server-side error occurred. Please wait a moment and try again."
  }));
};

export const generateImageWithRetry = async (
  prompt: string,
  referenceImages: { data: string; mimeType: string }[],
  styleReference?: { data: string; mimeType: string },
  aspectRatio?: string
): Promise<string | null> => {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await fetch("/api/generateImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, referenceImages, styleReference, aspectRatio }),
      });

      if (!response.ok) {
        await handleNetworkError(response);
      }

      const data = await response.json();
      return data.imageData;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === MAX_RETRIES - 1) {
        throw error;
      }
      await new Promise((res) => setTimeout(res, 1000 * (i + 1))); // Exponential backoff
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
  const response = await fetch("/api/suggestCreativePrompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context }),
  });
  if (!response.ok) {
    await handleNetworkError(response);
  }
  const data = await response.json();
  return data.prompt || "A cinematic scene featuring the characters.";
};

export const suggestBulkScenes = async (context: {
  storyName: string;
  seriesName: string;
  activeCharacters: string[];
  synopsis: string;
  count: number;
  existingScenes: string[];
}): Promise<string[]> => {
  const response = await fetch("/api/suggestBulkScenes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context }),
  });
  if (!response.ok) {
    await handleNetworkError(response);
  }
  const data = await response.json();
  return data.scenes || [];
};

export const generateSynopsis = async (characters: string[]): Promise<string> => {
  const response = await fetch("/api/generateSynopsis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ characters }),
  });
  if (!response.ok) {
    await handleNetworkError(response);
  }
  const data = await response.json();
  return data.synopsis || "A mysterious adventure begins...";
};

export const enhanceSynopsis = async (existing: string, characters: string[]): Promise<string> => {
  const response = await fetch("/api/enhanceSynopsis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ synopsis: existing, characters }),
  });
  if (!response.ok) {
    await handleNetworkError(response);
  }
  const data = await response.json();
  return data.synopsis || existing;
};
