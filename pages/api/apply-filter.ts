import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, image } = req.body; // image: base64 string

    if (!prompt || !image) {
      return res.status(400).json({ error: "Missing prompt or image" });
    }

    const gatewayUrl = process.env.VERCEL_AI_GATEWAY_URL;
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!gatewayUrl || !apiKey) {
      return res.status(500).json({ error: "Missing environment variables" });
    }

    // Call Vercel AI Gateway (Gemini 2.5 Pro)
    const response = await fetch(`${gatewayUrl}/gemini-2.5-pro-preview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: prompt }] },
          { role: "user", parts: [{ image: image }] }, // depends on Gateway format
        ],
        config: {
          responseModalities: ["image"],
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();

    // The Gateway should return the image as base64 in data.candidates[0].content.parts
    const imagePart = data.candidates?.[0]?.content?.parts?.find(
      (p: any) => p.inlineData
    );

    if (!imagePart) {
      return res.status(500).json({ error: "No image returned from AI Gateway" });
    }

    const base64Image = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType || "image/png";

    return res.json({ imageUrl: `data:${mimeType};base64,${base64Image}` });
  } catch (err: any) {
    console.error("apply-filter error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
