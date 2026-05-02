const GEMINI_API_KEY = "AIzaSyDz06KHDmMi6j8vL0gM7pXJRSrFmDdEzDc";
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

async function callGemini(prompt) {
  const fullPrompt = prompt + "\n\nCRITICAL MUST FOLLOW RULE: Respond ONLY with valid, unformatted JSON. Do NOT wrap it in ```json blocks. Just the raw JSON string.";

  // Node.js 18+ has built-in fetch
  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2000,
        responseMimeType: "application/json"
      }
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message || "API Error");

  const textOutput = data.candidates[0].content.parts[0].text;
  console.log("----- RAW OUTPUT -----");
  console.log(textOutput);
  console.log("----------------------");

  let result;
  try {
    const cleaned = textOutput.replace(/```[a-z]*\n?/g, '').replace(/```\n?/g, '').trim();
    console.log("----- CLEANED OUTPUT -----");
    console.log(cleaned);
    console.log("----------------------");
    result = JSON.parse(cleaned);
    console.log("PARSE SUCCESS!");
  } catch (e) {
    console.error("Parse failed!");
    console.error(e);
  }
}

const consti = "Varanasi";
const state = "UP";
const year = "2024";
const prompt = `Give highly realistic, simulated election results for ${consti} ${state} in the ${year} election.
    Return JSON format exactly: {
        "winner": { "name": "...", "party": "...", "votes": 125000, "percentage": 52 },
        "candidates": [ { "name": "...", "party": "...", "votes": 90000, "percentage": 35 } ],
        "totalVotes": 240000, "turnoutPercentage": 65.4, "margin": 35000
    }
    Ensure total percentage roughly adds to 100. Provide 4 candidates.`;

callGemini(prompt).catch(console.error);