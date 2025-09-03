// app/api/apply-filter/route.ts  (Next.js App Router style)
// Or /api/apply-filter.ts for a plain Vercel function

export const runtime = "edge"; // use "nodejs" if you need Node features

export async function POST(req: Request) {
  try {
    const { prompt, image } = await req.json(); // image: base64 string

    if (!prompt || !image) {
      return Response.json(
        { error: "Missing prompt or image" },
        { status: 400 }
      );
    }

    const gatewayUrl = process.env.VERCEL_AI_GATEWAY_URL;
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!gatewayUrl || !apiKey) {
      return Response.json(
        { error: "Missing environment variables" },
        { status: 500 }
      );
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
      return Response.json({ error: text }, { status: response.status });
    }

    const data = await response.json();

    // The Gateway should return the image as base64 in data.candidates[0].content.parts
    const imagePart = data.candidates?.[0]?.content?.parts?.find(
      (p: any) => p.inlineData
    );

    if (!imagePart) {
      return Response.json(
        { error: "No image returned from AI Gateway" },
        { status: 500 }
      );
    }

    const base64Image = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType || "image/png";

    return Response.json({ imageUrl: `data:${mimeType};base64,${base64Image}` });
  } catch (err: any) {
    console.error("apply-filter error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
