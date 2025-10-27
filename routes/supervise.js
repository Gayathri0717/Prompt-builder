// const express = require("express");
// const { spawn } = require("child_process");

// const router = express.Router();

// router.post("/", (req, res) => {
//   const { prompt } = req.body;
//   if (!prompt) return res.status(400).json({ error: "Prompt required" });

//   // 🔹 Refiner prompt — instructs Ollama to act as a prompt improver
//   const refinerPrompt = `
// You are a professional prompt refiner.
// Your task: analyze the user’s input prompt.
// If it contains grammar mistakes, unclear phrasing, or missing details, rewrite it into a clean, professional, and AI-understandable version without changing the user’s meaning.
// If the user’s input is already clear and grammatically correct, return it exactly as it is.
// After outputting the refined prompt, briefly explain how well the original prompt was written (for example: “Perfectly clear”, “Minor grammar fixes applied”, or “Refined for clarity”).

// Respond strictly in JSON format:
// {
//   "status": "refined" | "perfect",
//   "refinedPrompt": "string",
//   "feedback": "string"
// }

// User input: "${prompt}"
// `;

//   const child = spawn("ollama", ["run", "mistral"], { shell: true });

//   let output = "";
//   let responded = false;

//   child.stdin.write(refinerPrompt);
//   child.stdin.end();

//   child.stdout.on("data", (data) => {
//     output += data.toString();
//   });

//   child.stderr.on("data", (err) => {
//     console.error("Ollama stderr:", err.toString());
//   });
// child.on("close", () => {
//   if (responded) return;
//   responded = true;

//   try {
//     // 🧩 Extract clean JSON (ignore other text)
//     const jsonMatch = output.match(/\{[\s\S]*\}/);
//     if (!jsonMatch) throw new Error("No JSON found");

//     const cleanedOutput = jsonMatch[0]
//       .replace(/[\r\n]+/g, " ")   // remove line breaks
//       .replace(/\s+/g, " ")       // clean spaces
//       .trim();

//     const parsed = JSON.parse(cleanedOutput);

//     // Ensure refinedPrompt always exists
//     if (!parsed.refinedPrompt) {
//       parsed.refinedPrompt = req.body.prompt; // fallback if missing
//       parsed.status = "perfect";
//     }

//     res.json(parsed);
//   } catch (err) {
//     console.error("Parsing failed:", output);
//     res.status(500).json({
//       status: "error",
//       feedback: "Could not parse AI response correctly",
//     });
//   }
// });

//   // ⏱ Timeout for stability
//   setTimeout(() => {
//     if (!responded) {
//       responded = true;
//       child.kill("SIGTERM");
//       res.status(500).json({
//         status: "error",
//         feedback: "AI refiner timed out",
//       });
//     }
//   }, 30000);
// });

// module.exports = router;
const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt required" });

  // 🔹 Refiner prompt — instructs Ollama to act as a prompt improver
  const refinerPrompt = `
You are a professional prompt refiner.
Your task: analyze the user’s input prompt.
If it contains grammar mistakes, unclear phrasing, or missing details, rewrite it into a clean, professional, and AI-understandable version without changing the user’s meaning.
If the user’s input is already clear and grammatically correct, return it exactly as it is.
After outputting the refined prompt, briefly explain how well the original prompt was written (for example: “Perfectly clear”, “Minor grammar fixes applied”, or “Refined for clarity”).

Respond strictly in JSON format:
{
  "status": "refined" | "perfect",
  "refinedPrompt": "string",
  "feedback": "string"
}

User input: "${prompt}"
`;

  try {
    // 🔸 Call Ollama API instead of spawning CLI
    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "mistral",
      prompt: refinerPrompt,
      stream: false, // we want the full response, not streamed chunks
    });

    const output = response.data.response;

    // 🧩 Extract JSON safely
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");

    const cleanedOutput = jsonMatch[0]
      .replace(/[\r\n]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const parsed = JSON.parse(cleanedOutput);

    // Ensure refinedPrompt always exists
    if (!parsed.refinedPrompt) {
      parsed.refinedPrompt = prompt;
      parsed.status = "perfect";
    }

    res.json(parsed);
  } catch (error) {
    console.error("Ollama API Error:", error.message);
    res.status(500).json({
      status: "error",
      feedback: "Could not connect to Ollama or parse response",
    });
  }
});

module.exports = router;
