export default async function handler(req, res) {
  // Only allow POST requests for this endpoint
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, description, prompt } = req.body;

    // Validate required parameters
    if (!name || !description || !prompt) {
      return res.status(400).json({ error: 'name, description, and prompt are required' });
    }

    const { generateObject } = await import('ai');
    const { z } = await import('zod');

    const schema = z.object({ category: z.enum(['Useful', 'Fun']) });

    const { object } = await generateObject({
      model: 'google/gemini-1.5-pro',
      schema,
      prompt: `Categorize the following image filter as either Useful or Fun. Respond as JSON {"category": "Useful"|"Fun"} and nothing else.\n\nName: ${name}\nDescription: ${description}\nPrompt: ${prompt}`,
    });

    return res.json(object);
  } catch (error) {
    console.error('Error categorizing filter:', error);
    return res.status(500).json({ error: error.message || 'Failed to categorize' });
  }
} 