// api/diagnose.js

import OpenAI from "openai";



const client = new OpenAI({

  apiKey: process.env.OPENAI_API_KEY,

});



export default async function handler(req, res) {

  if (req.method !== "POST") {

    res.status(405).json({ error: "Method not allowed" });

    return;

  }



  const { imageDataUrl, description } = req.body || {};



  if (!description && !imageDataUrl) {

    res

      .status(400)

      .json({ error: "Please provide an image, a description, or both." });

    return;

  }



  if (!process.env.OPENAI_API_KEY) {

    res

      .status(500)

      .json({ error: "OPENAI_API_KEY is not set on the server." });

    return;

  }



  try {

    // 🔹 دالة مساعدة تستدعي موديل واحد

    async function callModel(model, modeLabel) {

      const prompt = `

You are FixLens Brain, an AI diagnostic assistant for cars, home appliances, and electronics.



Mode: ${modeLabel}.



User description:

${description || "(no description provided)"}



Instructions:

- Use clear, simple English.

- Never guess the exact car model or part if it's not obvious.

- Never give medical or life-critical advice.

- Do NOT say you are certain. Always mention uncertainty.

`;



      const input = [

        {

          role: "user",

          content: [

            { type: "input_text", text: prompt },

          ],

        },

      ];



      if (imageDataUrl) {

        // نرسل الصورة كـ data URL: data:image/jpeg;base64,...

        input[0].content.push({

          type: "input_image",

          image_url: imageDataUrl,

        });

      }



      const response = await client.responses.create({

        model,

        input,

      });



      // SDK يعطينا النص النهائي في output_text

      return response.output_text;

    }



    // 🟢 Hybrid: واحد سريع + واحد عميق (بالتوازي)

    const [fastText, deepText] = await Promise.all([

      callModel("gpt-4.1-mini", "FAST PRELIMINARY IMPRESSION (3–4 sentences max)"),

      callModel(

        "gpt-4.1",

        `DETAILED DIAGNOSIS.

Return in this structure:



Possible issue:

- ...



Why this might be happening:

- ...



Suggested next steps:

- ...



Safety notes:

- ...`

      ),

    ]);



    res.status(200).json({

      fast: fastText,

      deep: deepText,

    });

  } catch (err) {

    console.error("FixLens diagnose error:", err);

    res.status(500).json({

      error: "Something went wrong while talking to FixLens Brain.",

    });

  }

}
