// api/photo-diagnosis.js

import OpenAI from "openai";



const openai = new OpenAI({

  apiKey: process.env.OPENAI_API_KEY,

});



export default async function handler(req, res) {

  if (req.method !== "POST") {

    res.setHeader("Allow", ["POST"]);

    return res.status(405).json({ error: "Method not allowed" });

  }



  const { image } = req.body || {};



  if (!image || typeof image !== "string") {

    return res.status(400).json({ error: "Image data URL is required." });

  }



  try {

    const match = image.match(/^data:(image\/[a-zA-Z0-9+.+-]+);base64,(.*)$/);

    if (!match) {

      return res.status(400).json({ error: "Invalid image data URL." });

    }



    const mimeType = match[1];

    const base64Data = match[2];



    const dataUrlForOpenAI = `data:${mimeType};base64,${base64Data}`;



    const completion = await openai.chat.completions.create({

      model: "gpt-4.1-mini",

      messages: [

        {

          role: "system",

          content:

            "You are FixLens, an AI that visually inspects real-world problems (engines, car parts, appliances, electronics, tools, leaks, etc.) and gives step-by-step repair guidance. Be practical and safety-focused.",

        },

        {

          role: "user",

          content: [

            {

              type: "text",

              text: "Analyze this image. What problem do you see, what might be wrong, and what should the user do step by step to inspect and fix it safely?",

            },

            {

              type: "image_url",

              image_url: {

                url: dataUrlForOpenAI,

              },

            },

          ],

        },

      ],

    });



    const answer = completion.choices[0]?.message?.content || "";

    return res.status(200).json({ answer });

  } catch (err) {

    console.error("FixLens photo error:", err);

    return res.status(500).json({ error: "Failed to analyze image." });

  }

}
