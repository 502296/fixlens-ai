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

    // 🔹 Helper to call one model with a strong, domain-specific prompt

    async function callModel(model, modeLabel) {

      const basePrompt = `

You are **FixLens Brain**, an AI diagnostic assistant for:



- cars & vehicles (engines, brakes, steering, suspension, dashboard warnings),

- home appliances (washers, fridges, ovens, AC),

- electronics & tools (power tools, audio gear, consumer electronics).



You ALWAYS:

- Look carefully at the photo (leaks, stains, components, colors, textures, damage).

- Combine the photo with the user description.

- Identify the most likely **system** involved (e.g., power steering, brakes, cooling, suspension, HVAC, etc.).

- Mention uncertainty clearly. Never claim 100% certainty.

- Avoid guessing the exact car make/model or exact part number unless it is extremely obvious.

- Never give medical or life-critical advice. For safety-critical mechanical issues, always recommend seeing a qualified technician.

- Answer in **clear, simple English**.



User description (verbatim):

${description || "(no description provided)"}



If this is a car or vehicle issue (common words: car, engine, brake, steering, leak, noise, vibration, wheel, tire, dashboard, check engine, etc.):

- Focus on automotive diagnosis.

- From the image, look for: leaks, fluid color, wet areas, seals, boots, hoses, metal parts, rubber parts, rust, dirt patterns, and where gravity would make fluid travel.

- If fluid leak is visible, describe: likely fluid type (engine oil, power steering, coolant, brake fluid, transmission fluid, washer fluid) based on color and location, but keep uncertainty clear.

- Evaluate **risk level** (Low / Medium / High / Critical) for driving.



If this is a home appliance or electronics issue:

- Focus the diagnosis on that device.

- Identify likely component and failure type (e.g., pump, belt, fan, compressor, control board, sensor).



MODE: ${modeLabel}

`;



      const input = [

        {

          role: "user",

          content: [{ type: "input_text", text: basePrompt }],

        },

      ];



      if (imageDataUrl) {

        // Send the photo as a data URL (data:image/jpeg;base64,...)

        input[0].content.push({

          type: "input_image",

          image_url: imageDataUrl,

        });

      }



      const response = await client.responses.create({

        model,

        input,

      });



      // unified text output from Responses API

      return response.output_text;

    }



    // 🟢 Hybrid: one fast impression + one deep structured diagnosis (in parallel)

    const [fastText, deepText] = await Promise.all([

      callModel(

        "gpt-4.1-mini",

        `

FAST PRELIMINARY IMPRESSION.



Return ONLY 2–4 short sentences:

- Name the most likely system involved (e.g., "power steering system", "front brake system", "suspension", "engine oil leak").

- Summarize what the photo + description suggest.

- Give a quick urgency level (e.g., "You should have this inspected soon" or "This is urgent, do not drive far").

`

      ),

      callModel(

        "gpt-4.1",

        `

DETAILED DIAGNOSIS.



Return your answer in this EXACT structure (headings + bullet points):



Possible system and issue:

- (Name the most likely system: e.g., "Power steering system – possible leak near the steering rack or high-pressure hose.")

- (Add 1–3 bullets describing what seems to be happening based on the image + description.)



Why this might be happening:

- (List 2–4 possible causes. Be honest about uncertainty.)



Risk level:

- Overall risk: Low / Medium / High / Critical for continued use.

- (1–2 bullets explaining why you chose this risk level.)



What the user can check or do now:

- (3–6 practical, simple steps the user can do: e.g., check fluid level, look for fresh puddles after parking, take more photos, note noises, etc.)

- (If it's not safe to drive, clearly say so.)



What to tell a professional technician:

- (2–4 bullets with key information the user should share with a mechanic or technician.)



Safety notes:

- (1–3 bullets reminding the user that this is an AI guess, and that they should consult a certified professional for safety-critical issues.)

`

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
