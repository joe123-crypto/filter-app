import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { generateImage } from 'ai/experimental';
import { z } from 'zod';

export const runtime = 'edge';

const google = createGoogleGenerativeAI({
  apiKey: process.env.API_KEY,
});

export async function POST(req: Request) {
  try {
    // 1. Generate the text components of the filter
    const { object: filterDetails } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: z.object({
        name: z.string().describe('A short, catchy name for the filter (e.g., "Vaporwave Sunset", "Glimmer Core").'),
        description: z.string().describe('A one-sentence, exciting description of what the filter does.'),
        prompt: z.string().describe('A detailed, artistic prompt for an AI image model to apply the filter effect. This should be a command.'),
      }),
      prompt: `Generate a new, creative, and "trending" image filter concept. Think about current social media trends, aesthetics (like cottagecore, cyberpunk, Y2K), or pop culture.`,
    });

    // 2. Generate a preview image based on the generated description
    const imagePrompt = `A stunning, high-quality sample photograph that perfectly demonstrates a trending photo filter named "${filterDetails.name}". The style is: ${filterDetails.description}.`;
    
    const { image } = await generateImage({
        model: google.image('imagen-4.0-generate-001'),
        prompt: imagePrompt,
        aspectRatio: '1:1',
    });

    const base64Image = Buffer.from(await image.arrayBuffer()).toString('base64');
    const previewImageUrl = `data:image/jpeg;base64,${base64Image}`;

    // 3. Combine and return the full filter object
    const fullFilter = {
      ...filterDetails,
      previewImageUrl,
    };

    return Response.json(fullFilter);
  } catch (error: any) {
    console.error('Error generating trending filter:', error);
    return Response.json({ error: error.message || 'Failed to generate trending filter' }, { status: 500 });
  }
}
