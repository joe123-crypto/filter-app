// api/improve-prompt.ts
export const runtime = 'edge';

const VEREL_AI_KEY = process.env.VERCEL_AI_KEY;
if (!VEREL_AI_KEY) {
  throw new Error('VERCEL_AI_KEY environment variable is missing');
}

export async function POST(req: Request) {
  try {
    const { currentPrompt } = await req.json();

    if (!currentPrompt) {
      return Response.json({ error: 'currentPrompt is required' }, { status: 400 });
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

    const res = await fetch('https://gateway.vercel.ai/v1beta/models/gemini-2.5-flash/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VEREL_AI_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return Response.json({ error: `Text generation failed: ${errorText}` }, { status: 500 });
    }

    const data = await res.json();
    const improvedPrompt = data?.output?.[0]?.text?.trim();

    if (!improvedPrompt) {
      return Response.json({ error: 'No improved prompt returned from AI' }, { status: 500 });
    }

    return Response.json({ improvedPrompt });
  } catch (error: any) {
    console.error('Error improving prompt:', error);
    return Response.json({ error: error.message || 'Failed to improve prompt' }, { status: 500 });
  }
}
