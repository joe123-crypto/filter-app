import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, description, prompt } = req.body;

    if (!name || !description || !prompt) {
      return res.status(400).json({ error: 'name, description, and prompt are required' });
    }

    const VERCEL_API_KEY = process.env.VERCEL_AI_KEY;
    if (!VERCEL_API_KEY) {
      return res.status(500).json({ error: 'VERCEL_AI_KEY environment variable is missing' });
    }

    const payload = {
      model: 'gemini-2.5-flash',
      input: [
        {
          type: 'text',
          text: `Categorize the following image filter. "Useful" filters are for practical adjustments like color correction, sharpening, or specific styles like 'black and white'. "Fun" filters are more artistic, creative, or whimsical, like turning a photo into a cartoon or a painting.

Filter Name: "${name}"
Description: "${description}"
Prompt: "${prompt}"

Based on this, is the filter primarily 'Useful' or 'Fun'?`
        },
      ],
      config: {
        responseFormat: 'text', // return plain text
      },
    };

    const response = await fetch(
      'https://gateway.vercel.ai/v1beta/models/gemini-2.5-flash/generate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${VERCEL_API_KEY}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ error: `Vercel AI Gateway error: ${errorText}` });
    }

    const data = await response.json();
    const categoryText = data?.output?.[0]?.text?.trim();

    if (categoryText === 'Useful' || categoryText === 'Fun') {
      return res.json({ category: categoryText });
    }

    // fallback if unexpected response
    return res.json({ category: 'Useful' });
  } catch (error: any) {
    console.error('Error in categorize-filters:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}
