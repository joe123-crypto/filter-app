export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { currentPrompt } = req.body;

    if (!currentPrompt) {
      return res.status(400).json({ error: 'currentPrompt is required' });
    }

    // For now, just return a test response
    return res.json({ 
      improvedPrompt: `Enhanced: ${currentPrompt}`
    });
  } catch (error) {
    console.error('Error improving prompt:', error);
    return res.status(500).json({ error: error.message || 'Failed to improve prompt' });
  }
}
