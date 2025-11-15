// api/upload-image.js

import { put } from "@vercel/blob";



export default async function handler(req, res) {

  if (req.method !== "POST") {

    res.status(405).json({ error: "Method not allowed" });

    return;

  }



  const { imageDataUrl } = req.body || {};



  if (!imageDataUrl || !imageDataUrl.startsWith("data:")) {

    res.status(400).json({ error: "imageDataUrl (data URL) is required." });

    return;

  }



  try {

    // مثال: data:image/jpeg;base64,AAAA...

    const [meta, base64Data] = imageDataUrl.split(",");

    const mimeMatch = meta.match(/^data:(.+);base64$/);

    const contentType = mimeMatch ? mimeMatch[1] : "image/jpeg";



    const buffer = Buffer.from(base64Data, "base64");



    // نخزن الصورة في Vercel Blob

    const blob = await put(`fixlens-${Date.now()}.jpg`, buffer, {

      access: "public", // حتى يكون عندنا URL عام نرسله لـ OpenAI

      contentType,

      addRandomSuffix: true,

    });



    // blob.url = رابط الصورة العام

    res.status(200).json({ imageUrl: blob.url });

  } catch (err) {

    console.error("Upload image error:", err);

    res

      .status(500)

      .json({ error: "Failed to upload image to FixLens storage." });

  }

}
