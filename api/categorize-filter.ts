import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export const runtime = 'edge';

const google = createGoogleGenerativeAI({
  apiKey: process.env.API_KEY,
});

export async function POST(req: Request) {
  try {
    const { name, description, prompt } = await req.json();

    if (!name || !description || !prompt) {
      return Response.json({ error: 'name, description, and prompt are required' }, { status: 400 });
    }

    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: z.object({
        category: z.enum(['Useful', 'Fun']),
      }),
      prompt: `Categorize the following image filter. "Useful" filters are for practical adjustments like color correction, sharpening, or specific styles like 'black and white'. "Fun" filters are more artistic, creative, or whimsical, like turning a photo into a cartoon or a painting.

        Filter Name: "${name}"
        Description: "${description}"
        Prompt: "${prompt}"

        Based on this, is the filter primarily 'Useful' or 'Fun'?`,
    });

    return Response.json({ category: object.category });
  } catch (error: any) {
    console.error('Error categorizing filter:', error);
    return Response.json({ error: error.message || 'Failed to categorize filter' }, { status: 500 });
  }
}
