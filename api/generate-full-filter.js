export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { theme } = req.body;

    if (!theme) {
      return res.status(400).json({ error: 'theme is required' });
    }

    // For now, just return a test response
    return res.json({ 
      name: `Test Filter for ${theme}`,
      description: `A test filter based on ${theme}`,
      prompt: `Apply ${theme} style to the image`,
      previewImageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    });
  } catch (error) {
    console.error('Error generating full filter:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate full filter' });
  }
}
