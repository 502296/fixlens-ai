// api/fixlens.js

import OpenAI from "openai";



const client = new OpenAI({

  apiKey: process.env.OPENAI_API_KEY,

});



export default async function handler(req, res) {

  if (req.method !== "POST") {

    res.setHeader("Allow", ["POST"]);

    return res.status(405).json({ error: "Method not allowed" });

  }



  try {

    const { description, hasPhoto } = req.body || {};



    if (!description && !hasPhoto) {

      return res

        .status(400)

        .json({ error: "Please provide a description or a photo." });

    }



    // نبقيه نصي حالياً، لاحقاً نربط الصور فعلياً

    const userText =

      (description || "").toString().trim() ||

      "The user only uploaded a photo and did not add any text.";



    const messages = [

      {

        role: "system",

        content: `

You are FixLens Brain, an AI assistant that helps diagnose real-world problems: cars and vehicles, home appliances, and everyday electronics.



The user may write in ANY language (English, Arabic, Spanish, etc.).

Always:

- Reply in the SAME language the user used.

- If the user writes in Arabic, respond in clear Modern Standard Arabic.

- Provide a short, clear explanation of the most likely issue.

- Provide 3–5 concrete next steps, including safety warnings if needed.

- Remind the user that this is not a replacement for a certified technician.



If hasPhoto is true, assume the user also uploaded a photo of the issue and factor that into your reasoning, even though you cannot actually see it yet.

        `.trim(),

      },

      {

        role: "user",

        content:

          userText +

          (hasPhoto

            ? "\n\nThe user also uploaded a photo of the problem."

            : ""),

      },

    ];



    const completion = await client.chat.completions.create({

      model: "gpt-5.1-mini",

      messages,

      temperature: 0.4,

    });



    const answer = completion.choices[0]?.message?.content?.trim();



    return res.status(200).json({

      ok: true,

      answer:

        answer ||

        "I analyzed your description and prepared likely causes and next steps, but something went wrong formatting the answer. Please try again.",

    });

  } catch (error) {

    console.error("FixLens API error:", error);

    return res.status(500).json({

      ok: false,

      error: "Internal error while analyzing the issue.",

    });

  }

}
