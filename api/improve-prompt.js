export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { currentPrompt } = req.body;

    if (!currentPrompt) {
      return res.status(400).json({ error: 'currentPrompt is required' });
    }

    const { generateText } = await import('ai');

    const { text } = await generateText({
      model: 'google/gemini-1.5-pro',
      prompt: `Improve the following image editing prompt to be concise, actionable, and maintain the same intent. Return only the improved prompt.\n\n"""${currentPrompt}"""`,
    });

    return res.json({ improvedPrompt: text.trim() });
  } catch (error) {
    console.error('Error improving prompt:', error);
    return res.status(500).json({ error: error.message || 'Failed to improve prompt' });
  }
}
