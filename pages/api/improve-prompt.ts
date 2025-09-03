import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { currentPrompt } = req.body;

    if (!currentPrompt) {
      return res.status(400).json({ error: 'currentPrompt is required' });
    }

    const VERCEL_AI_KEY = process.env.VERCEL_AI_KEY;
    if (!VERCEL_AI_KEY) {
      return res.status(500).json({ error: 'VERCEL_AI_KEY environment variable is missing' });
    }

    // Prepare the payload for Vercel AI Gateway
    const payload = {
      model: 'gemini-2.5-flash',
      input: [
        {
          type: 'text',
          text: currentPrompt,
        },
      ],
      config: {
        system: `You are a prompt engineering expert specializing in visual AI. 
          Your task is to refine and enhance user-provided prompts for an image filter generator.
          Make the prompt more descriptive, artistic, and detailed to produce a more dramatic and visually appealing effect.
          Return ONLY the improved prompt text, without any introductory phrases like "Here's the improved prompt:".`,
        responseFormat: 'text',
      },
    };

    const response = await fetch('https://gateway.vercel.ai/v1beta/models/gemini-2.5-flash/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VERCEL_AI_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ error: `Text generation failed: ${errorText}` });
    }

    const data = await response.json();
    const improvedPrompt = data?.output?.[0]?.text?.trim();

    if (!improvedPrompt) {
      return res.status(500).json({ error: 'No improved prompt returned from AI' });
    }

    return res.json({ improvedPrompt });
  } catch (error: any) {
    console.error('Error improving prompt:', error);
    return res.status(500).json({ error: error.message || 'Failed to improve prompt' });
  }
}
