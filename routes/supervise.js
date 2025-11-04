
const express = require("express");
const axios = require("axios");

const router = express.Router();
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434' ;
router.post("/", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt required" });


  const refinerPrompt = `
You are a professional prompt refiner.
Your task: analyze the user’s input prompt.
If it contains grammar mistakes, unclear phrasing, or missing details, rewrite it into a clean, professional, and AI-understandable version without changing the meaning.
If it's already clear, return it as is.

Respond strictly in JSON format:
{
  "status": "refined" | "perfect",
  "refinedPrompt": "string",
  "feedback": "string"
}

User input: "${prompt}"
`;

  try {
    // 🔸 Call Ollama API
    console.log("🟢 OLLAMA_URL =", OLLAMA_URL);

      const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: "mistral",
      prompt: refinerPrompt,
      stream: false,
    });

    // ✅ Compatible with all Ollama API versions
    const output =
      response.data.response || response.data.output || response.data || "";

console.log("🟡 Raw Ollama Output:\n", output)
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

