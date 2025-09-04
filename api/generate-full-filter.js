export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { theme } = req.body;

    if (!theme) {
      return res.status(400).json({ error: 'theme is required' });
    }

    const { generateObject } = await import('ai');
    const { z } = await import('zod');

    const schema = z.object({
      name: z.string(),
      description: z.string(),
      prompt: z.string(),
    });

    const { object } = await generateObject({
      model: 'google/gemini-1.5-pro',
      schema,
      prompt: `You are designing an AI image filter for a community filters app. Create a cohesive filter concept for the theme: "${theme}".
Return JSON with keys name, description, prompt.
- name: a short, catchy filter name
- description: 1-2 sentence description for non-technical users
- prompt: an image editing instruction optimized for an image model (concise, specific)`,
    });

    const previewImageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

    return res.json({ ...object, previewImageUrl });
  } catch (error) {
    console.error('Error generating full filter:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate full filter' });
  }
}
