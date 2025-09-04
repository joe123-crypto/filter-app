export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { generateObject } = await import('ai');
    const { z } = await import('zod');

    const schema = z.object({
      name: z.string(),
      description: z.string(),
      prompt: z.string(),
    });

    const today = new Date().toISOString().split('T')[0];

    const { object } = await generateObject({
      model: 'google/gemini-1.5-pro',
      schema,
      prompt: `Propose one fresh, time-relevant filter concept for the date ${today} based on pop culture, seasons, or visual trends. Return JSON {name, description, prompt}. Keep name catchy, description 1-2 sentences, and prompt concise for image editing.`,
    });

    const previewImageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

    return res.json({ ...object, previewImageUrl });
  } catch (error) {
    console.error('Error generating trending filter:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate trending filter' });
  }
} 