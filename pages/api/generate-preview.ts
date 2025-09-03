import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'description is required' });
    }

    const VERCEL_API_KEY = process.env.VERCEL_AI_KEY;
    if (!VERCEL_API_KEY) {
      return res.status(500).json({ error: 'VERCEL_AI_KEY environment variable is missing' });
    }

    // Generate preview image via Vercel AI Gateway
    const imagePrompt = `A stunning, high-quality sample photograph that perfectly demonstrates a photo filter. Style: ${description}.`;

    const imagePayload = {
      model: 'imagen-4.0-generate-001',
      input: [
        { type: 'text', text: imagePrompt }
      ],
      config: {
        responseFormat: 'b64_json',
        aspectRatio: '1:1',
      },
    };

    const imageRes = await fetch(
      'https://gateway.vercel.ai/v1beta/models/imagen-4.0-generate-001/generate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${VERCEL_API_KEY}`,
        },
        body: JSON.stringify(imagePayload),
      }
    );

    if (!imageRes.ok) {
      const errorText = await imageRes.text();
      return res.status(500).json({ error: `Image generation failed: ${errorText}` });
    }

    const imageData = await imageRes.json();
    const base64Image = imageData?.output?.[0]?.image?.b64_json;
    const imageUrl = `data:image/jpeg;base64,${base64Image}`;

    return res.json({ imageUrl });

  } catch (error: any) {
    console.error('Error generating preview image:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate preview image' });
  }
}
