// api/generate-trending-filters.ts
export const runtime = 'edge';

const VEREL_API_KEY = process.env.VERCEL_AI_KEY;
if (!VEREL_API_KEY) {
  throw new Error('VERCEL_AI_KEY environment variable is missing');
}

export async function POST(req: Request) {
  try {
    // 1. Generate trending filter text details
    const textPayload = {
      model: 'gemini-2.5-flash',
      input: [
        {
          type: 'text',
          text: `Generate a new, creative, and "trending" image filter concept. 
Think about current social media trends, aesthetics (like cottagecore, cyberpunk, Y2K), or pop culture. 
Respond with a JSON object containing:
{
  "name": "short catchy name",
  "description": "one-sentence exciting description",
  "prompt": "detailed artistic prompt for AI image generation"
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
          'Authorization': `Bearer ${VEREL_API_KEY}`,
        },
        body: JSON.stringify(textPayload),
      }
    );

    if (!textRes.ok) {
      const errorText = await textRes.text();
      return Response.json({ error: `Text generation failed: ${errorText}` }, { status: 500 });
    }

    const textData = await textRes.json();
    let filterDetails;
    try {
      filterDetails = JSON.parse(textData?.output?.[0]?.text);
    } catch (err) {
      return Response.json({ error: 'Failed to parse AI response as JSON' }, { status: 500 });
    }

    // 2. Generate preview image via Vercel AI Gateway
    const imagePrompt = `A stunning, high-quality sample photograph that perfectly demonstrates a trending photo filter named "${filterDetails.name}". Style: ${filterDetails.description}.`;

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
          'Authorization': `Bearer ${VEREL_API_KEY}`,
        },
        body: JSON.stringify(imagePayload),
      }
    );

    if (!imageRes.ok) {
      const errorText = await imageRes.text();
      return Response.json({ error: `Image generation failed: ${errorText}` }, { status: 500 });
    }

    const imageData = await imageRes.json();
    const base64Image = imageData?.output?.[0]?.image?.b64_json;
    const previewImageUrl = `data:image/jpeg;base64,${base64Image}`;

    // 3. Combine and return the full filter
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
