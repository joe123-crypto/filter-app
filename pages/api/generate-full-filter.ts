import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { theme } = req.body;

    if (!theme) {
      return res.status(400).json({ error: 'theme is required' });
    }

    const VERCEL_API_KEY = process.env.VERCEL_AI_KEY;
    if (!VERCEL_API_KEY) {
      return res.status(500).json({ error: 'VERCEL_AI_KEY environment variable is missing' });
    }

    // 1. Generate text details (name, description, prompt) via Vercel AI Gateway
    const textPayload = {
      model: 'gemini-2.5-flash',
      input: [
        {
          type: 'text',
          text: `Generate a creative and unique image filter concept based on the theme: "${theme}". 
Respond with a JSON object containing: 
{
  "name": "short catchy name",
  "description": "one-sentence exciting description",
  "prompt": "detailed artistic prompt for an AI image model"
}`
        },
      ],
      config: {
        responseFormat: 'text',
      },
    };

    const textRes = await fetch(
      'https://gateway.vercel.ai/v1beta/models/gemini-2.5-flash/generate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${VERCEL_API_KEY}`,
        },
        body: JSON.stringify(textPayload),
      }
    );

    if (!textRes.ok) {
      const errorText = await textRes.text();
      return res.status(500).json({ error: `Text generation failed: ${errorText}` });
    }

    const textData = await textRes.json();
    let filterDetails;
    try {
      filterDetails = JSON.parse(textData?.output?.[0]?.text);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to parse AI response as JSON' });
    }

    // 2. Generate a preview image via Vercel AI Gateway
    const imagePrompt = `A stunning, high-quality sample photograph that perfectly demonstrates a photo filter named "${filterDetails.name}". Style: ${filterDetails.description}.`;

    const imagePayload = {
      model: 'imagen-4.0-generate-001',
      input: [
        { type: 'text', text: imagePrompt }
      ],
      config: {
        responseFormat: 'b64_json',
        aspectRatio: '1:1'
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
    const previewImageUrl = `data:image/jpeg;base64,${base64Image}`;

    // 3. Return combined full filter
    const fullFilter = {
      ...filterDetails,
      previewImageUrl,
    };

    return res.json(fullFilter);

  } catch (error: any) {
    console.error('Error generating full filter:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate full filter' });
  }
}
