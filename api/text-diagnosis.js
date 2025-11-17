// api/text-diagnosis.js

import OpenAI from "openai";



const openai = new OpenAI({

  apiKey: process.env.OPENAI_API_KEY,

});



export default async function handler(req, res) {

  if (req.method !== "POST") {

    res.setHeader("Allow", ["POST"]);

    return res.status(405).json({ error: "Method not allowed" });

  }



  const { description } = req.body || {};



  if (!description || !description.trim()) {

    return res.status(400).json({ error: "Description is required." });

  }



  try {

    const completion = await openai.chat.completions.create({

      model: "gpt-4.1-mini",

      messages: [

        {

          role: "system",

          content:

            "You are FixLens, an AI that diagnoses real-world problems (cars, home appliances, electronics, plumbing, etc.) and gives clear, step-by-step guidance. Be practical and concise.",

        },

        {

          role: "user",

          content: `Here is the user's problem description:\n\n${description}\n\nIdentify likely causes, what to check, and step-by-step actions to fix it safely.`,

        },

      ],

    });



    const answer = completion.choices[0]?.message?.content || "";

    return res.status(200).json({ answer });

  } catch (err) {

    console.error("FixLens text error:", err);

    return res.status(500).json({

      error: "Failed to get diagnosis.",

    });

  }

}
