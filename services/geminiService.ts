/**
 * A helper function to handle fetch requests to our backend API.
 * It simplifies error handling and JSON parsing.
 */
const fetchApi = async (endpoint: string, body: object) => {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Request to ${endpoint} failed.`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    if (error instanceof Error) {
      // Re-throw the error with a more specific message
      throw new Error(`[API Error] ${error.message}`);
    }
    throw new Error('An unknown network error occurred.');
  }
};


export const applyImageFilter = async (base64ImageDataUrl: string, prompt: string): Promise<string> => {
  const { imageUrl } = await fetchApi('/api/apply-filter', { base64ImageDataUrl, prompt });
  return imageUrl;
};

export const generatePreviewImage = async (description: string): Promise<string> => {
  const { imageUrl } = await fetchApi('/api/generate-preview', { description });
  return imageUrl;
};

export const improvePrompt = async (currentPrompt: string): Promise<string> => {
  const { improvedPrompt } = await fetchApi('/api/improve-prompt', { currentPrompt });
  return improvedPrompt;
};

export const generateFullFilter = async (theme: string): Promise<{ name: string, description: string, prompt: string, previewImageUrl: string }> => {
  const result = await fetchApi('/api/generate-full-filter', { theme });
  return result;
};

export const categorizeFilter = async (name: string, description: string, prompt: string): Promise<'Useful' | 'Fun'> => {
  const { category } = await fetchApi('/api/categorize-filter', { name, description, prompt });
  // Add a check to ensure the response is valid
  if (category === 'Useful' || category === 'Fun') {
    return category;
  }
  // Fallback for safety
  return 'Useful';
};

export const generateTrendingFilter = async (): Promise<{ name: string, description: string, prompt: string, previewImageUrl: string }> => {
    const result = await fetchApi('/api/generate-trending-filter', {});
    return result;
};
