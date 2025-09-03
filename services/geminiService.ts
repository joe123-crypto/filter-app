import { GoogleGenAI, Modality, Type } from "@google/genai";
import { parseDataUrl } from '../utils/fileUtils';

// The API key MUST be available in the environment variables.
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set. This is required for the application to function.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const applyImageFilter = async (base64ImageDataUrl: string, prompt: string): Promise<string> => {
  const parsedUserData = parseDataUrl(base64ImageDataUrl);
  if (!parsedUserData) {
    throw new Error("Invalid user image data format.");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          { // User's image
            inlineData: {
              data: parsedUserData.data,
              mimeType: parsedUserData.mimeType,
            },
          },
          { // Instructions
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });
    
    // Find the image part in the response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const resultMimeType = part.inlineData.mimeType;
        const resultBase64 = part.inlineData.data;
        return `data:${resultMimeType};base64,${resultBase64}`;
      }
    }
    
    // If no image is returned, but there's text, it might be a safety message or error
    const textResponse = response.text;
    if (textResponse) {
        throw new Error(`API returned a text response instead of an image: ${textResponse}`);
    }

    throw new Error("No image data found in the API response.");

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to apply filter: ${error.message}`);
    }
    throw new Error("An unknown error occurred while applying the filter.");
  }
};


export const generatePreviewImage = async (description: string): Promise<string> => {
  // Simplified prompt to be more direct and robust, reducing the chance of internal API errors.
  const prompt = `A sample photograph for a photo filter named "${description}". High quality, vibrant, clear subject, 1:1 aspect ratio.`;

  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }

    throw new Error("No image data was returned from the API.");

  } catch (error) {
    console.error("Error calling Gemini Image Generation API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate preview image: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the preview image.");
  }
};

export const improvePrompt = async (currentPrompt: string): Promise<string> => {
  const systemInstruction = `You are an expert in writing creative AI image generation prompts. 
Your task is to take a user's prompt and make it more descriptive, vivid, and detailed to produce better, more artistic image results.
Focus on adding details about style, composition, lighting, and mood.
Do not add any conversational text, preambles, or explanations like "Here is the improved prompt:". 
Only return the improved prompt text itself.`;
  
  const contents = `Here is the user's prompt to improve: "${currentPrompt}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    const improvedText = response.text?.trim();

    if (!improvedText) {
      throw new Error("The AI returned an empty response.");
    }

    return improvedText;

  } catch (error) {
    console.error("Error calling Gemini API for prompt improvement:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to improve prompt: ${error.message}`);
    }
    throw new Error("An unknown error occurred while improving the prompt.");
  }
};

export const generateFullFilter = async (theme: string): Promise<{ name: string, description: string, prompt: string, previewImageUrl: string }> => {
  const systemInstruction = `You are a creative assistant for a photo filter app. Your task is to invent a new photo filter based on a theme.
You must generate a short, catchy name for the filter, a brief one-sentence description, and a detailed image generation prompt that would be used to apply the filter.
Respond with only a JSON object.`;
  
  const contents = `The theme for the new filter is: "${theme}"`;
  
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "A short, catchy name for the filter (e.g., 'Retro VHS Glow')." },
      description: { type: Type.STRING, description: "A brief, one-sentence description of the filter's effect." },
      prompt: { type: Type.STRING, description: "A detailed prompt for an AI to apply the filter's visual style to an image." },
    },
    required: ["name", "description", "prompt"],
  };

  try {
    const textResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    const jsonText = textResponse.text.trim();
    if (!jsonText) {
      throw new Error("The AI returned an empty response for the filter details.");
    }

    const { name, description, prompt } = JSON.parse(jsonText);

    if (!name || !description || !prompt) {
      throw new Error("The AI response was missing required fields (name, description, or prompt).");
    }

    const previewImageUrl = await generatePreviewImage(description);

    return { name, description, prompt, previewImageUrl };

  } catch (error) {
    console.error("Error generating full filter with AI:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate AI filter: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the filter with AI.");
  }
};

export const categorizeFilter = async (name: string, description: string, prompt: string): Promise<'Useful' | 'Fun'> => {
  const systemInstruction = `You are an expert filter classifier for a photo app. Your task is to categorize a user-created filter as either 'Useful' or 'Fun'.
  'Useful' filters are for general photo improvements like color correction, lighting adjustments, sharpening, or subtle enhancements.
  'Fun' filters apply creative, artistic, unusual, or dramatic effects, like turning a photo into a cartoon, a painting, or applying a heavy stylistic theme.
  Respond with ONLY the word 'Useful' or 'Fun'. Do not add any other text, explanation, or punctuation.`;
  
  const contents = `Filter Name: "${name}"\nFilter Description: "${description}"\nAI Prompt: "${prompt}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0, // Make it deterministic
      },
    });

    const category = response.text?.trim();

    if (category === 'Useful' || category === 'Fun') {
      return category;
    }

    console.warn(`AI returned an unexpected category: '${category}'. Defaulting to 'Useful'.`);
    return 'Useful'; // Fallback in case of unexpected response

  } catch (error) {
    console.error("Error calling Gemini API for filter categorization:", error);
    // Fallback to a default category on error
    return 'Useful';
  }
};

export const generateTrendingFilter = async (): Promise<{ name: string, description: string, prompt: string, previewImageUrl: string }> => {
  const systemInstruction = `You are a creative director and trend analyst for a popular photo filter app. 
Your job is to design one new, exciting photo filter each day based on current visual trends seen on social media (like Instagram and TikTok) and in modern photography.
You must respond with only a JSON object.`;
  
  const contents = `Invent today's trending filter. It should have a short, catchy name, a one-sentence description of its effect, and a detailed image generation prompt that an AI can use to apply the filter's style to a photo. Make the style feel fresh, modern, and popular right now.`;
  
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "A short, catchy name for the filter (e.g., 'Cottagecore Bloom', 'Y2K Glitch')." },
      description: { type: Type.STRING, description: "A brief, one-sentence description of the filter's effect." },
      prompt: { type: Type.STRING, description: "A detailed prompt for an AI to apply the filter's visual style to an image." },
    },
    required: ["name", "description", "prompt"],
  };

  try {
    const textResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    const jsonText = textResponse.text.trim();
    if (!jsonText) {
      throw new Error("The AI returned an empty response for the filter details.");
    }

    const { name, description, prompt } = JSON.parse(jsonText);

    if (!name || !description || !prompt) {
      throw new Error("The AI response was missing required fields (name, description, or prompt).");
    }

    // Add a marker to the description
    const trendDescription = `${description} (AI Trend of the Day)`;

    const previewImageUrl = await generatePreviewImage(description);

    return { name, description: trendDescription, prompt, previewImageUrl };

  } catch (error) {
    console.error("Error generating trending filter with AI:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate trending filter: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the trending filter.");
  }
};
