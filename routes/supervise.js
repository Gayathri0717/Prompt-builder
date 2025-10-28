
const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt required" });

  // 🔹 Instruction for Ollama — force JSON-only output
  const refinerPrompt = `
You are a professional prompt refiner.
Analyze the user's input prompt and improve grammar, clarity, or completeness without changing meaning.
If already perfect, return as-is.

Respond **strictly and only** in JSON. Do not include explanations, comments, or markdown.

Format:
{
  "status": "refined" | "perfect",
  "refinedPrompt": "string",
  "feedback": "string"
}

User input: "${prompt}"
`;

  try {
    // 🔸 Call Ollama API
    const response = await axios.post("https://immigrants-cheque-clip-recorded.trycloudflare.com/api/generate", {
      model: "mistral",
      prompt: refinerPrompt,
      stream: false,
    });

    // ✅ Compatible with all Ollama API versions
    const output =
      response.data.response || response.data.output || response.data || "";

    // 🧩 Attempt to extract JSON from model output
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("⚠️ Ollama returned unexpected output:", output);
      throw new Error("No JSON found in Ollama response");
    }

    const cleanedOutput = jsonMatch[0]
      .replace(/[\r\n]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanedOutput);
    } catch (err) {
      console.error("⚠️ JSON parse error:", err.message);
      throw new Error("Invalid JSON format in Ollama response");
    }

    // 🔹 Fallback if Ollama misses refinedPrompt key
    if (!parsed.refinedPrompt) {
      parsed.refinedPrompt = prompt;
      parsed.status = "perfect";
      parsed.feedback = "Original prompt was clear and correct.";
    }

    res.json(parsed);
  } catch (error) {
    console.error("❌ Ollama API Error:", error.message);
    res.status(500).json({
      status: "error",
      feedback:
        error.message.includes("JSON")
          ? "Could not parse AI response correctly"
          : "Could not connect to Ollama or parse response",
    });
  }
});

module.exports = router;
