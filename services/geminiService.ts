import { GoogleGenAI, Modality } from "@google/genai";
import { parseDataUrl } from '../utils/fileUtils';

// The API key MUST be available in the environment variables.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set. This is required for the application to function.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const applyImageFilter = async (base64ImageDataUrl: string, prompt: string): Promise<string> => {
  const parsedData = parseDataUrl(base64ImageDataUrl);
  if (!parsedData) {
    throw new Error("Invalid image data format.");
  }

  const { mimeType, data } = parsedData;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: data,
              mimeType: mimeType,
            },
          },
          {
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
  const prompt = `A high-quality, visually appealing, vibrant photograph that could be used as a sample image for a photo filter called "${description}". The image should be interesting and showcase a clear subject. Aspect ratio 1:1.`;

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