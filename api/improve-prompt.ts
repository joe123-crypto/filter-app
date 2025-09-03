import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export const runtime = 'edge';

const google = createGoogleGenerativeAI({
  apiKey: process.env.API_KEY,
});

export async function POST(req: Request) {
  try {
    const { currentPrompt } = await req.json();

    if (!currentPrompt) {
        return Response.json({ error: 'currentPrompt is required' }, { status: 400 });
    }

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      system: `You are a prompt engineering expert specializing in visual AI. 
        Your task is to refine and enhance user-provided prompts for an image filter generator.
        Make the prompt more descriptive, artistic, and detailed to produce a more dramatic and visually appealing effect.
        Return ONLY the improved prompt text, without any introductory phrases like "Here's the improved prompt:".`,
      prompt: currentPrompt,
    });

    return Response.json({ improvedPrompt: text });
  } catch (error: any) {
    console.error('Error improving prompt:', error);
    return Response.json({ error: error.message || 'Failed to improve prompt' }, { status: 500 });
  }
}
