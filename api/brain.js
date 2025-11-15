// api/brain.js

// Serverless function for FixLens Brain



import OpenAI from "openai";



const client = new OpenAI({

  apiKey: process.env.OPENAI_API_KEY,

});



// شخصية FixLens Brain

const SYSTEM_PROMPT = `

You are **FixLens Brain**, an AI technician for car and home problems.



Goals:

1. Understand the problem from the user's description.

2. Classify it into one of these categories:

   - Auto Electric

   - Auto Mechanic

   - Home Appliance / Home Fix

3. Before giving any solution, you MUST ask 2–4 short, clear questions to clarify the situation.

4. After each user answer, decide:

   - Either ask 1–2 follow-up questions if information is still not enough.

   - Or give a clear, step-by-step plan.



Style:

- Use simple language.

- Prefer short questions with (Yes/No) or simple options.

- Always mention safety. Never suggest dangerous repairs.

- If the user writes in Arabic, answer in friendly Arabic (Iraqi/standard mix).

- Always be calm, kind, and practical.



When information is enough, clearly mark the red line:

- Explain what the user can safely do at home.

- Explain when they MUST go to a professional technician.

`;



export default async function handler(req, res) {

  if (req.method !== "POST") {

    return res.status(405).json({ ok: false, error: "Method not allowed" });

  }



  try {

    const body = req.body || {};

    const messages = body.messages || [];

    const category = body.category || "general";



    const completion = await client.chat.completions.create({

      model: "gpt-4.1-mini",

      messages: [

        {

          role: "system",

          content: SYSTEM_PROMPT + `\n\nCategory: ${category}`,

        },

        ...messages,

      ],

    });



    const reply = completion.choices?.[0]?.message?.content || "";



    res.status(200).json({

      ok: true,

      reply,

    });

  } catch (error) {

    console.error("FixLens Brain error:", error);

    res.status(500).json({

      ok: false,

      error: "Server error",

    });

  }

}
