import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON with large body size limit (needed for referenceImages)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Helper to map UI Aspect Ratio to Gemini Image Configuration Aspect Ratio
  const mapAspectRatio = (ratio: string | undefined): "1:1" | "3:4" | "4:3" | "9:16" | "16:9" => {
    if (ratio === "16:9" || ratio === "9:16" || ratio === "1:1" || ratio === "4:3" || ratio === "3:4") {
      return ratio;
    }
    return "1:1";
  };

  // Human-oriented context error responder
  const handleErrorResponse = (res: any, error: any, contextDescription: string) => {
    const errorMessage = error?.message || error?.toString() || "Unknown error";
    console.error(`Error during ${contextDescription}:`, error);

    let solution = "Please check your input parameters, reduce scene complexity, or try simplifying your prompt descriptor, and submit again.";
    const lowerMsg = errorMessage.toLowerCase();

    if (lowerMsg.includes("api_key") || lowerMsg.includes("key not found") || lowerMsg.includes("unauthorized") || lowerMsg.includes("invalid api key")) {
      solution = "Your Gemini API key appears to be missing or invalid. Please open the Settings > Secrets configuration panel in Google AI Studio and verify GEMINI_API_KEY.";
    } else if (lowerMsg.includes("quota") || lowerMsg.includes("billing") || lowerMsg.includes("payment") || lowerMsg.includes("blocked") || lowerMsg.includes("limit") || lowerMsg.includes("403")) {
      solution = "This model (gemini-2.5-flash-image) requires paid billing tier access. Please check your Google AI Studio account settings to ensure billing is enabled or upgrade the API key.";
    } else if (lowerMsg.includes("modality") || lowerMsg.includes("content") || lowerMsg.includes("part") || lowerMsg.includes("bad request") || lowerMsg.includes("400")) {
      solution = "The generated prompt structure or base64 resource was invalid. Ensure any uploaded character files are small, standard images (PNG/JPEG) and try again.";
    } else if (lowerMsg.includes("network") || lowerMsg.includes("fetch") || lowerMsg.includes("timeout")) {
      solution = "A network timeout occurred. Please check your connectivity and try clicking render again.";
    }

    res.status(500).json({
      error: {
        message: `${contextDescription} failed: ${errorMessage}`,
        solution
      }
    });
  };

  // Helper for lazy loading Gemini API key
  const getAI = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not defined on the server.");
    }
    return new GoogleGenAI({ 
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  };

  // API Route: generateImage
  app.post("/api/generateImage", async (req, res) => {
    try {
      const { prompt, referenceImages, styleReference, aspectRatio } = req.body;
      const ai = getAI();
      const parts: any[] = [];
      
      if (styleReference) {
        parts.push({
            inlineData: {
              data: styleReference.data,
              mimeType: styleReference.mimeType,
            },
        });
        parts.push({ text: "Use the artistic style of the image above strictly as a visual reference for the generated output." });
      }

      parts.push(...(referenceImages || []).map((img: any) => ({
          inlineData: {
            data: img.data,
            mimeType: img.mimeType,
          },
      })));
      
      parts.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: mapAspectRatio(aspectRatio),
          },
        },
      });

      let base64Data: string | null = null;
      for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData) {
          base64Data = part.inlineData.data;
          break;
        }
      }

      res.json({ imageData: base64Data });
    } catch (error: any) {
      handleErrorResponse(res, error, "Image Generation");
    }
  });

  // API Route: suggestCreativePrompt
  app.post("/api/suggestCreativePrompt", async (req, res) => {
    try {
      const { context } = req.body;
      const ai = getAI();
      const charsInContext = (context.activeCharacters?.length ? context.activeCharacters : context.characters).join(", ");
      
      const prompt = `You are a creative story boarding assistant for the series "${context.seriesName}".
      Synopsis: ${context.synopsis || "No synopsis provided."}
      Story: ${context.storyName}
      Characters Available: ${context.characters.join(", ")}
      Current Active Scene Characters: ${charsInContext}
      Previous plot beats: ${context.existingPrompts.filter((p: string) => p.trim()).join(" | ")}
      
      Suggest ONE creative, visually interesting image prompt for the NEXT scene. 
      Focus on lighting, action, and cinematic placement. Keep it under 40 words. 
      Output ONLY the prompt text.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      res.json({ prompt: response.text?.trim() || "A cinematic scene featuring the characters." });
    } catch (error: any) {
      handleErrorResponse(res, error, "Scene Prompt suggestion");
    }
  });

  // API Route: suggestBulkScenes
  app.post("/api/suggestBulkScenes", async (req, res) => {
    try {
      const { context } = req.body;
      const ai = getAI();

      const prompt = `Generate ${context.count} unique, sequential story scene prompts for the series "${context.seriesName}".
      Synopsis: ${context.synopsis}
      Active Characters: ${context.activeCharacters.join(", ")}
      Already established scenes: ${context.existingScenes.filter((s: string) => s.trim()).join(" | ")}
      
      Each scene should be a brief visual description for an image generator. 
      Maintain a coherent narrative flow.
      Return the result as a JSON array of strings.`;

      const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
              }
          }
      });

      const scenes = JSON.parse(response.text || "[]");
      res.json({ scenes: Array.isArray(scenes) ? scenes : [] });
    } catch (error: any) {
      handleErrorResponse(res, error, "Bulk Scenes suggestion");
    }
  });

  // API Route: generateSynopsis
  app.post("/api/generateSynopsis", async (req, res) => {
    try {
      const { characters } = req.body;
      const ai = getAI();
      const prompt = `Generate a riveting short storyline synopsis involving these characters: ${characters.join(", ")}. 
      If some are unnamed, give them interesting archetypes. Focus on drama and visual potential. Max 250 words.`;
      
      const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt
      });
      res.json({ synopsis: response.text?.trim() || "A mysterious adventure begins..." });
    } catch (error: any) {
      handleErrorResponse(res, error, "Storyline Synopsis generation");
    }
  });

  // API Route: enhanceSynopsis
  app.post("/api/enhanceSynopsis", async (req, res) => {
    try {
      const { synopsis, characters } = req.body;
      const ai = getAI();
      const prompt = `Rewrite and enhance the following synopsis to be more engaging, cinematic, and professional, providing more opportunity for story diversion and character development. 
      Characters: ${characters.join(", ")}
      Original: ${synopsis}
      Max 300 words.`;
      
      const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt
      });
      res.json({ synopsis: response.text?.trim() || synopsis });
    } catch (error: any) {
      handleErrorResponse(res, error, "Storyline Synopsis enhancement");
    }
  });

  // Vite development vs production config
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
