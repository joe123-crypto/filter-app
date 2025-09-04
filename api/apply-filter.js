export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, image } = req.body;

    if (!prompt || !image) {
      return res.status(400).json({ error: 'Missing prompt or image' });
    }

    const { streamText } = await import('ai');

    // Auto-detect and normalize input image
    const { bytes: inputBytes, mimeType } = (() => {
      // Handle data URL format
      const dataUrlMatch = /^data:(.*?);base64,(.*)$/i.exec(image);
      if (dataUrlMatch) {
        const inferredType = dataUrlMatch[1] || 'application/octet-stream';
        const b64 = dataUrlMatch[2];
        return { bytes: Buffer.from(b64, 'base64'), mimeType: inferredType };
      }
      // Otherwise assume raw base64 string
      const raw = Buffer.from(image, 'base64');
      const detected = detectMimeFromMagicBytes(raw);
      return { bytes: raw, mimeType: detected };
    })();

    const result = streamText({
      model: 'google/gemini-2.5-pro-preview',
      providerOptions: {
        google: { responseModalities: ['IMAGE'] },
      },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'file', data: new Uint8Array(inputBytes), mimeType },
          ],
        },
      ],
    });

    let output;
    for await (const delta of (await result).fullStream) {
      if (delta.type === 'file' && delta.file.mediaType.startsWith('image/')) {
        const base64Out = Buffer.from(delta.file.uint8Array).toString('base64');
        output = `data:${delta.file.mediaType};base64,${base64Out}`;
      }
    }

    if (!output) {
      return res.status(502).json({ error: 'Image generation failed' });
    }

    return res.json({ imageUrl: output });
  } catch (err) {
    console.error('apply-filter error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

function detectMimeFromMagicBytes(buf) {
  if (buf.length >= 12) {
    // PNG
    if (
      buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
      buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
    ) return 'image/png';
    // JPEG
    if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
    // GIF
    if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return 'image/gif';
    // WebP: RIFF....WEBP
    if (
      buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
    ) return 'image/webp';
    // BMP
    if (buf[0] === 0x42 && buf[1] === 0x4d) return 'image/bmp';
  }
  return 'application/octet-stream';
}
