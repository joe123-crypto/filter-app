
import { GoogleGenAI, Type, Modality } from "@google/genai";

// Initialize the Google AI client with the API key from the environment variable.
// All Gemini API calls will now be made directly from the browser.
const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY,
});

/**
 * Checks a Gemini API response for a safety block reason.
 * @param response - The response from a `generateContent` call.
 * Throws a specific error if the request was blocked.
 */
function handleSafetyBlock(response: any): void {
    if (response && !response.candidates?.length && response.promptFeedback?.blockReason) {
         throw new Error(`Your request was blocked for safety reasons (${response.promptFeedback.blockReason}). Please revise your input to comply with our terms of service and avoid generating harmful content.`);
    }
}

/**
 * Applies a filter to one or more images using a prompt.
 * @param base64ImageDataUrls - An array of base64 encoded images.
 * @param prompt - The prompt describing the filter or merge effect.
 * @returns A promise that resolves to the new base64 image URL.
 */
export const applyImageFilter = async (base64ImageDataUrls: string[], prompt: string): Promise<string> => {
  const imageParts = base64ImageDataUrls.map(dataUrl => {
    const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
      throw new Error('Invalid image data URL format');
    }
    return { inlineData: { mimeType: match[1], data: match[2] } };
  });

  if (imageParts.length === 0) {
      throw new Error('At least one image is required to apply a filter.');
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: { 
        parts: [
          ...imageParts,
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    handleSafetyBlock(response);

    if (!response.candidates?.length || !response.candidates[0].content?.parts?.length) {
      throw new Error('The AI returned an invalid response. Please try again.');
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    
    const textResponse = response.text;
    const errorMessage = textResponse 
        ? `The AI did not return an image. Response: "${textResponse}"` 
        : 'The AI did not return an image. Try a different prompt or image.';
    throw new Error(errorMessage);

  } catch (error) {
    console.error("Error applying image filter:", error);
    if (error instanceof Error) throw new Error(`${error.message}`);
    throw new Error('An unknown error occurred while applying the filter.');
  }
};

/**
 * Generates an image from a text description.
 * @param prompt - A description of the desired image.
 * @returns A promise that resolves to the generated base64 image URL.
 */
export const generateImageFromPrompt = async (prompt: string): Promise<string> => {
  try {
    const imageResponse = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    if (!imageResponse.generatedImages || imageResponse.generatedImages.length === 0) {
      throw new Error('Image generation failed to produce an image. Please try a different description.');
    }
    const base64Image = imageResponse.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64Image}`;
  } catch (error) {
    console.error("Error generating preview image:", error);
    if (error instanceof Error) {
        if (error.message.toUpperCase().includes('SAFETY')) {
             throw new Error(`Your request was blocked for safety reasons. Please revise your description to comply with our terms of service and avoid generating harmful content.`);
        }
        throw new Error(`[AI Error] ${error.message}`);
    }
    throw new Error('An unknown error occurred during image generation.');
  }
};

/**
 * Improves a user's prompt using AI.
 * @param currentPrompt - The user's current prompt text.
 * @returns A promise that resolves to the improved prompt string.
 */
export const improvePrompt = async (currentPrompt: string): Promise<string> => {
   try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: currentPrompt,
      config: {
        systemInstruction: `You are a prompt engineering expert specializing in visual AI. 
        Your task is to refine and enhance user-provided prompts for an image filter generator.
        Make the prompt more descriptive, artistic, and detailed to produce a more dramatic and visually appealing effect.
        Return ONLY the improved prompt text, without any introductory phrases like "Here's the improved prompt:".`,
      }
    });
    handleSafetyBlock(response);
    return response.text;
  } catch (error) {
    console.error("Error improving prompt:", error);
    if (error instanceof Error) throw new Error(`${error.message}`);
    throw new Error('An unknown error occurred while improving the prompt.');
  }
};

/**
 * Generates a random, visually descriptive prompt.
 * @returns A promise that resolves to the random prompt string.
 */
export const generateRandomPrompt = async (): Promise<string> => {
   try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate a random, creative, and visually descriptive prompt for an AI image generator. The prompt should be a single sentence and not enclosed in quotes.",
      config: {
        systemInstruction: `You are a creative assistant for an AI image generator. Your task is to generate imaginative and visually rich prompts. Be concise.`,
      }
    });
    handleSafetyBlock(response);
    // Clean up response, removing potential quotes
    return response.text.trim().replace(/^"(.*)"$/, '$1');
  } catch (error) {
    console.error("Error generating random prompt:", error);
    if (error instanceof Error) throw new Error(`${error.message}`);
    throw new Error('An unknown error occurred while generating a prompt.');
  }
};


/**
 * Generates a complete filter (name, description, prompt, image) based on a theme.
 * @param theme - The theme for the filter.
 * @returns A promise that resolves to the full filter object.
 */
export const generateFullFilter = async (theme: string): Promise<{ name: string, description: string, prompt: string, previewImageUrl: string }> => {
  try {
    const textResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a creative and unique image filter concept based on the theme: "${theme}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'A short, catchy name for the filter (e.g., "Cosmic Dream", "Retro Arcade").' },
            description: { type: Type.STRING, description: 'A one-sentence, exciting description of what the filter does.' },
            prompt: { type: Type.STRING, description: 'A detailed, artistic prompt for an AI image model to apply the filter effect. This should be a command.' },
          },
          required: ["name", "description", "prompt"]
        },
      },
    });
    handleSafetyBlock(textResponse);
    const filterDetails = JSON.parse(textResponse.text);
    const previewImageUrl = await generateImageFromPrompt(`A photo filter named "${filterDetails.name}". The style is: ${filterDetails.description}.`);

    return { ...filterDetails, previewImageUrl };
  } catch (error) {
    console.error("Error generating full filter:", error);
    if (error instanceof Error) throw new Error(`${error.message}`);
    throw new Error('An unknown error occurred while generating the filter.');
  }
};

/**
 * Categorizes a filter as 'Useful' or 'Fun' using AI.
 * @param name - The filter's name.
 * @param description - The filter's description.
 * @param prompt - The filter's AI prompt.
 * @returns A promise that resolves to the category string.
 */
export const categorizeFilter = async (name: string, description: string, prompt: string): Promise<'Useful' | 'Fun'> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Categorize the following image filter. "Useful" filters are for practical adjustments like color correction, sharpening, or specific styles like 'black and white'. "Fun" filters are more artistic, creative, or whimsical, like turning a photo into a cartoon or a painting.
        Filter Name: "${name}"
        Description: "${description}"
        Prompt: "${prompt}"
        Based on this, is the filter primarily 'Useful' or 'Fun'?`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { category: { type: Type.STRING, enum: ['Useful', 'Fun'] } },
          required: ["category"]
        },
      },
    });
    handleSafetyBlock(response);
    const result = JSON.parse(response.text);
    return result.category;
  } catch (error) {
    console.error("Error categorizing filter:", error);
    // Fallback to a default category in case of AI error
    return 'Useful';
  }
};

/**
 * Generates a new "trending" filter concept using AI.
 * @returns A promise that resolves to the full filter object.
 */
export const generateTrendingFilter = async (): Promise<{ name: string, description: string, prompt: string, previewImageUrl: string }> => {
  try {
    const textResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a new, creative, and "trending" image filter concept. Think about current social media trends, aesthetics (like cottagecore, cyberpunk, Y2K), or pop culture.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'A short, catchy name for the filter (e.g., "Vaporwave Sunset", "Glimmer Core").' },
            description: { type: Type.STRING, description: 'A one-sentence, exciting description of what the filter does.' },
            prompt: { type: Type.STRING, description: 'A detailed, artistic prompt for an AI image model to apply the filter effect. This should be a command.' },
          },
          required: ["name", "description", "prompt"]
        },
      },
    });
    handleSafetyBlock(textResponse);
    const filterDetails = JSON.parse(textResponse.text);
    const previewImageUrl = await generateImageFromPrompt(`A trending photo filter named "${filterDetails.name}". The style is: ${filterDetails.description}.`);

    return { ...filterDetails, previewImageUrl };
  } catch (error) {
    console.error("Error generating trending filter:", error);
    if (error instanceof Error) throw new Error(`${error.message}`);
    throw new Error('An unknown error occurred while generating the trending filter.');
  }
};