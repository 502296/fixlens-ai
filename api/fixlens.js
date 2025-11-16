import OpenAI from "openai";



const client = new OpenAI({

  apiKey: process.env.OPENAI_API_KEY

});



export default async function handler(req, res) {

  if (req.method !== "POST") {

    return res.status(405).json({ error: "Method not allowed" });

  }



  const { description } = req.body;



  if (!description) {

    return res.status(400).json({ error: "Description is required" });

  }



  // Detect if the text contains Arabic characters

  const isArabic = /[\u0600-\u06FF]/.test(description);



  const languagePrompt = isArabic

    ? "The user is writing in Arabic. Reply ONLY in clear modern Arabic."

    : "The user is writing in English. Reply ONLY in English.";



  try {

    const completion = await client.chat.completions.create({

      model: "gpt-4.1",

      messages: [

        {

          role: "system",

          content: `

You are FixLens Brain — an advanced AI assistant for diagnosing real-world problems from text and images.

${languagePrompt}

Always:

- Provide a clear possible issue.

- Explain risk level.

- Give step-by-step next actions.

- Be concise but helpful.

          `.trim()

        },

        {

          role: "user",

          content: description

        }

      ]

    });



    const reply = completion.choices[0].message.content;

    return res.status(200).json({ reply });



  } catch (error) {

    return res.status(500).json({ error: error.message });

  }

}
