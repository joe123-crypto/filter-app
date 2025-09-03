import { createGateway } from 'ai';

export const runtime = 'edge';

// Initialize Vercel AI Gateway
const gateway = createGateway();

export async function POST(req: Request) {
  try {
    const { base64ImageDataUrl, prompt } = await req.json();

    if (!base64ImageDataUrl || !prompt) {
      return Response.json(
        { error: 'Both base64ImageDataUrl and prompt are required' },
        { status: 400 }
      );
    }

    // Call Vercel AI Gateway with Gemini image model
    const response = await gateway.generate({
      model: 'gemini-2.5-flash-image-preview',
      input: [
        { type: 'image', data: base64ImageDataUrl },
        { type: 'text', text: prompt },
      ],
    });

    // Return the filtered image in base64
    const filteredImage = response.output[0].image;

    return Response.json({ filteredImage });
  } catch (err: any) {
    console.error('Error applying filter:', err);
    return Response.json(
      { error: err.message || 'Failed to apply filter' },
      { status: 500 }
    );
  }
}
