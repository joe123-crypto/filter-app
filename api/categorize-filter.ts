// api/categorize-filters.ts
export const runtime = 'edge';

// Make sure you have VERCEL_AI_KEY set in your Vercel environment variables
const VEREL_API_KEY = process.env.VERCEL_AI_KEY;
if (!VEREL_API_KEY) {
  throw new Error('VERCEL_AI_KEY environment variable is missing');
}

export async function POST(req: Request) {
  try {
    const { name, description, prompt } = await req.json();

    if (!name || !description || !prompt) {
      return Response.json(
        { error: 'name, description, and prompt are required' },
        { status: 400 }
      );
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
          'Authorization': `Bearer ${VEREL_API_KEY}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json(
        { error: `Vercel AI Gateway error: ${errorText}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const categoryText = data?.output?.[0]?.text?.trim();

    if (categoryText === 'Useful' || categoryText === 'Fun') {
      return Response.json({ category: categoryText });
    }

    // fallback if unexpected response
    return Response.json({ category: 'Useful' });
  } catch (error: any) {
    console.error('Error in categorize-filters:', error);
    return Response.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
