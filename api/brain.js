// api/fixlens-brain.js

import OpenAI from "openai";



const client = new OpenAI({

  apiKey: process.env.OPENAI_API_KEY, // ضع الـ API key في Vercel (Environment Variables)

});



export default async function handler(req, res) {

  // السماح فقط بالـ POST

  if (req.method !== "POST") {

    res.setHeader("Allow", ["POST"]);

    return res.status(405).json({ error: "Method Not Allowed" });

  }



  try {

    const { message, language } = req.body || {};



    if (!message || typeof message !== "string") {

      return res.status(400).json({ error: "message is required" });

    }



    const lang = language || "en";



    const systemPrompt = `

You are FixLens Brain – an AI diagnosis assistant for real-world problems:

cars, home, appliances, devices, plumbing, electricity, etc.



Rules:

- Ask 1–3 short clarifying questions if the problem is unclear.

- Explain in simple, practical steps.

- Be very clear about SAFETY (electricity, gas, fire, tools, traffic).

- If something is dangerous or requires a certified professional, say it clearly.

- You can answer in the user's language (Arabic or English).

If language = "ar", answer in Arabic. If "en", answer in English.

`;



    const userContent =

      lang === "ar"

        ? `اللغة: عربي.\nالمشكلة:\n${message}`

        : `Language: English.\nIssue:\n${message}`;



    const completion = await client.chat.completions.create({

      model: "gpt-4.1-mini", // يمكنك تغييره إلى gpt-4.1 أو gpt-4o حسب ما تحب

      messages: [

        { role: "system", content: systemPrompt },

        { role: "user", content: userContent },

      ],

      temperature: 0.3,

    }); //  [oai_citation:0‡OpenAI Platform](https://platform.openai.com/docs/api-reference/chat?utm_source=chatgpt.com)



    const reply =

      completion.choices?.[0]?.message?.content ||

      "Sorry, FixLens Brain couldn't generate a response.";



    return res.status(200).json({ reply });

  } catch (err) {

    console.error("FixLens Brain error:", err);

    return res.status(500).json({

      error: "FixLens Brain internal error",

    });

  }

}
