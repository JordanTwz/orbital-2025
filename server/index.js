// server/index.js
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const sharp = require('sharp');
const { OpenAI } = require('openai');

const upload = multer({ dest: 'uploads/' });
const app = express();
app.use(cors());

console.log('OPENAI_API_KEY loaded:', !!process.env.OPENAI_API_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/*
 * Finds and returns exactly one balanced JSON object,
 * starting at the first "{" and ending when braces balance to zero.
 */

// DO NOT DELETE THIS FUNCTION!
// THE OUTPUT TENDS TO BE WEIRDLY FORMATTED
// AND IT'S NOT A PROPER JSON OBJECT, SO WE NEED TO EXTRACT IT
// FROM THE RAW TEXT RESPONSE.
function extractCompleteJson(raw) {
  // Drop any markdown fences before parsing
  let txt = raw.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
  const start = txt.indexOf('{');
  if (start < 0) return txt;

  // walk through and count braces
  let depth = 0;
  for (let i = start; i < txt.length; i++) {
    if (txt[i] === '{') depth++;
    else if (txt[i] === '}') depth--;
    // once we close the very first object...
    if (depth === 0) {
      return txt.slice(start, i + 1);
    }
  }
  // if never balanced, return entire remainder
  return txt.slice(start);
}

app.post('/analyze', upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file received' });
  }

  try {
    // 1) Resize and compress
    const resized = await sharp(req.file.path)
      .resize({ width: 320 })
      .jpeg({ quality: 40 })
      .toBuffer();
    const base64 = resized.toString('base64');

    // 2) Build prompt
    const messages = [{
      role: 'user',
      content: [
        {
          type: 'text',
          text:
            'Analyze the meal image and return ONLY valid JSON with these fields:\n' +
            '1) description: a summary (max 5 words)\n' +
            '2) totalCalories: integer\n' +
            '3) dishes: array of objects each with:\n' +
            '   - name (string)\n' +
            '   - calories (integer)\n' +
            '   - macros: { carbs: number, fats: number, proteins: number }\n' +
            'Return only the JSON - no commentary or fences.'
        },
        {
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${base64}` }
        }
      ]
    }];

    // 3) Call GPT-4o
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 500,
      temperature: 0
    });

    // 4) Extract exactly one complete JSON object
    const raw = completion.choices[0].message.content;
    const jsonText = extractCompleteJson(raw);

    // 5) Parse it
    let data;
    try {
      data = JSON.parse(jsonText);
    } catch (parseErr) {
      console.error('JSON.parse failed on:', jsonText);
      console.error(parseErr);
      return res.status(500).json({ error: 'Failed to parse JSON from AI' });
    }

    // 6) Cleanup and respond
    fs.unlink(req.file.path, () => {});
    return res.json(data);

  } catch (err) {
    console.error('Analysis error:', err);
    fs.unlink(req.file.path, () => {});
    return res.status(500).json({ error: 'OpenAI analysis failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`Server listening on port ${PORT}`)
);