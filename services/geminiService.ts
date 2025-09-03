import { parseDataUrl } from '../utils/fileUtils';

// The API key MUST be available in the environment variables.
const API_KEY = "vck_2gM9BKyUYcXulwnXE9mmn0PcPseDUu9bkl6a0fUaWogOrqvl1l2WHN0q"//process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set. This is required for the application to function.");
}

// Vercel AI Gateway endpoints
const VERCEL_GOOGLE_PROXY_URL = 'https://gateway.vercel.ai/v1beta/models';
const VERCEL_IMAGE_GEN_URL = 'https://gateway.vercel.ai/v1/images/generations';

const commonHeaders = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

/**
 * A helper function to make API calls to the Vercel Gateway for Google models.
 */
const postToVercelGoogleProxy = async (model: string, method: string, body: object) => {
    const url = `${VERCEL_GOOGLE_PROXY_URL}/${model}:${method}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: commonHeaders,
        body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
        const errorMsg = data.error?.message || `API Error: ${response.statusText}`;
        console.error("Vercel AI Gateway Error:", data);
        throw new Error(errorMsg);
    }
    return data;
};


export const applyImageFilter = async (base64ImageDataUrl: string, prompt: string): Promise<string> => {
  const parsedUserData = parseDataUrl(base64ImageDataUrl);
  if (!parsedUserData) {
    throw new Error("Invalid user image data format.");
  }

  try {
    const body = {
        contents: [
            {
                parts: [
                  { inline_data: { mime_type: parsedUserData.mimeType, data: parsedUserData.data } },
                  { text: prompt },
                ],
            },
        ],
    };
    
    // Note: The model name in the URL is the one Vercel needs to see.
    const data = await postToVercelGoogleProxy('gemini-2.5-flash-image-preview', 'generateContent', body);
    
    const imagePart = data.candidates?.[0]?.content?.parts?.find(p => p.inline_data);

    if (imagePart?.inline_data) {
        const resultMimeType = imagePart.inline_data.mimeType;
        const resultBase64 = imagePart.inline_data.data;
        return `data:${resultMimeType};base64,${resultBase64}`;
    }
    
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (textResponse) {
        throw new Error(`API returned a text response instead of an image: ${textResponse}`);
    }

    throw new Error("No image data found in the API response.");

  } catch (error) {
    console.error("Error calling Vercel AI Gateway for image editing:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to apply filter: ${error.message}`);
    }
    throw new Error("An unknown error occurred while applying the filter.");
  }
};


export const generatePreviewImage = async (description: string): Promise<string> => {
  const prompt = `A sample photograph for a photo filter named "${description}". High quality, vibrant, clear subject, 1:1 aspect ratio.`;

  try {
    const response = await fetch(VERCEL_IMAGE_GEN_URL, {
        method: 'POST',
        headers: commonHeaders,
        body: JSON.stringify({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            n: 1,
            size: '1024x1024', // Corresponds to 1:1 aspect ratio
            response_format: 'b64_json',
        }),
    });
    
    const data = await response.json();

    if (!response.ok) {
        const errorMsg = data.error?.message || 'Failed to generate preview image.';
        throw new Error(errorMsg);
    }

    if (data.data && data.data[0] && data.data[0].b64_json) {
      return `data:image/jpeg;base64,${data.data[0].b64_json}`;
    }

    throw new Error("No image data was returned from the API.");

  } catch (error) {
    console.error("Error calling Vercel AI Gateway for image generation:", error);
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
    const body = {
        contents: [{ role: "user", parts: [{ text: contents }] }],
        system_instruction: { parts: [{ text: systemInstruction }] },
    };

    const data = await postToVercelGoogleProxy('gemini-2.5-flash', 'generateContent', body);
    const improvedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!improvedText) {
      throw new Error("The AI returned an empty response.");
    }

    return improvedText;

  } catch (error) {
    console.error("Error calling Vercel AI Gateway for prompt improvement:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to improve prompt: ${error.message}`);
    }
    throw new Error("An unknown error occurred while improving the prompt.");
  }
};

export const generateFullFilter = async (theme: string): Promise<{ name: string, description: string, prompt: string, previewImageUrl: string }> => {
  const systemInstruction = `You are a creative assistant for a photo filter app. Your task is to invent a new photo filter based on a theme.
You must generate a short, catchy name for the filter, a brief one-sentence description, and a detailed image generation prompt that would be used to apply the filter.
Respond with only a valid JSON object in the format: {"name": "...", "description": "...", "prompt": "..."}.`;
  
  const contents = `The theme for the new filter is: "${theme}"`;
  
  try {
    const body = {
        contents: [{ parts: [{ text: contents }] }],
        system_instruction: { parts: [{ text: systemInstruction }] },
        generation_config: {
            response_mime_type: "application/json",
        },
    };
    
    const data = await postToVercelGoogleProxy('gemini-2.5-flash', 'generateContent', body);
    const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

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
    console.error("Error generating full filter with AI via Vercel:", error);
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
    const body = {
        contents: [{ parts: [{ text: contents }] }],
        system_instruction: { parts: [{ text: systemInstruction }] },
        generation_config: {
            temperature: 0, // Make it deterministic
        }
    };
    const data = await postToVercelGoogleProxy('gemini-2.5-flash', 'generateContent', body);
    const category = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (category === 'Useful' || category === 'Fun') {
      return category;
    }

    console.warn(`AI returned an unexpected category: '${category}'. Defaulting to 'Useful'.`);
    return 'Useful'; // Fallback in case of unexpected response

  } catch (error) {
    console.error("Error calling Vercel Gateway for filter categorization:", error);
    return 'Useful'; // Fallback to a default category on error
  }
};

export const generateTrendingFilter = async (): Promise<{ name: string, description: string, prompt: string, previewImageUrl: string }> => {
  const systemInstruction = `You are a creative director and trend analyst for a popular photo filter app. 
Your job is to design one new, exciting photo filter each day based on current visual trends seen on social media (like Instagram and TikTok) and in modern photography.
You must respond with only a valid JSON object in the format: {"name": "...", "description": "...", "prompt": "..."}.`;
  
  const contents = `Invent today's trending filter. It should have a short, catchy name, a one-sentence description of its effect, and a detailed image generation prompt that an AI can use to apply the filter's style to a photo. Make the style feel fresh, modern, and popular right now.`;

  try {
    const body = {
        contents: [{ parts: [{ text: contents }] }],
        system_instruction: { parts: [{ text: systemInstruction }] },
        generation_config: {
            response_mime_type: "application/json",
        },
    };
    
    const data = await postToVercelGoogleProxy('gemini-2.5-flash', 'generateContent', body);
    const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!jsonText) {
      throw new Error("The AI returned an empty response for the filter details.");
    }

    const { name, description, prompt } = JSON.parse(jsonText);

    if (!name || !description || !prompt) {
      throw new Error("The AI response was missing required fields (name, description, or prompt).");
    }

    const trendDescription = `${description} (AI Trend of the Day)`;
    const previewImageUrl = await generatePreviewImage(description);
    return { name, description: trendDescription, prompt, previewImageUrl };

  } catch (error) {
    console.error("Error generating trending filter with AI via Vercel:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate trending filter: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the trending filter.");
  }
};
