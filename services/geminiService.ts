/**
 * Centralized fetch helper with robust error handling.
 */
const fetchApi = async (endpoint: string, body: object) => {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text(); // fallback for non-JSON
      let errorMessage: string;
      try {
        const errorData = JSON.parse(text);
        errorMessage = errorData.error || `Request to ${endpoint} failed`;
      } catch {
        errorMessage = text || `Request to ${endpoint} failed`;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    if (error instanceof Error) throw new Error(`[API Error] ${error.message}`);
    throw new Error('Unknown network error occurred');
  }
};

/**
 * Apply a filter to a base64 image with a text prompt.
 */
export const applyImageFilter = async (base64ImageDataUrl: string, prompt: string): Promise<string> => {
  const base64Image = base64ImageDataUrl.replace(/^data:image\/\w+;base64,/, '');
  const { imageUrl } = await fetchApi('https://filter-app-teal.vercel.app/api/apply-filter', { prompt, image: base64Image });
  return imageUrl;
};

/**
 * Generate a preview image for a description.
 */
export const generatePreviewImage = async (description: string): Promise<string> => {
  const { imageUrl } = await fetchApi('https://filter-app-teal.vercel.app/api/generate-preview', { description });
  return imageUrl;
};

/**
 * Improve a user's text prompt.
 */
export const improvePrompt = async (currentPrompt: string): Promise<string> => {
  const { improvedPrompt } = await fetchApi('https://filter-app-teal.vercel.app/api/improve-prompt', { currentPrompt });
  return improvedPrompt;
};

/**
 * Generate a full filter object including preview image.
 */
export const generateFullFilter = async (theme: string): Promise<{ name: string, description: string, prompt: string, previewImageUrl: string }> => {
  const result = await fetchApi('https://filter-app-teal.vercel.app/api/generate-full-filter', { theme });
  return result;
};

/**
 * Categorize a filter as 'Useful' or 'Fun'.
 */
export const categorizeFilter = async (name: string, description: string, prompt: string): Promise<'Useful' | 'Fun'> => {
  const { category } = await fetchApi('https://filter-app-teal.vercel.app/api/categorize-filters', { name, description, prompt });
  return category === 'Useful' || category === 'Fun' ? category : 'Useful';
};

/**
 * Generate a trending filter object including preview image.
 */
export const generateTrendingFilter = async (): Promise<{ name: string, description: string, prompt: string, previewImageUrl: string }> => {
  const result = await fetchApi('https://filter-app-teal.vercel.app/api/generate-trending-filters', {});
  return result;
};
