export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'description is required' });
    }

    const { streamText } = await import('ai');

    const result = streamText({
      model: 'google/gemini-2.5-flash-image-preview',
      providerOptions: {
        google: { responseModalities: ['TEXT', 'IMAGE'] },
      },
      messages: [
        {
          role: 'user',
          content: [{ type: 'text', text: `Generate a high-quality preview image: ${description}` }],
        },
      ],
    });

    let output;
    for await (const delta of (await result).fullStream) {
      if (delta.type === 'file' && delta.file.mediaType.startsWith('image/')) {
        const base64Out = Buffer.from(delta.file.uint8Array).toString('base64');
        output = `data:${delta.file.mediaType};base64,${base64Out}`;
      }
    }

    if (!output) {
      return res.status(502).json({ error: 'Image generation failed' });
    }

    return res.json({ imageUrl: output });
  } catch (error) {
    console.error('Error generating preview:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate preview' });
  }
}
