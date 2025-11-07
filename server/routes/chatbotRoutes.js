const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
require("dotenv").config();

// POST /api/chat/gemini
router.post("/gemini", async (req, res) => {
  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Gemini API key not configured." });
  }
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }
  try {
    // Use the latest supported model name and endpoint
    const model = "gemini-2.5-pro";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] })
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Gemini API error:", data);
      return res.status(500).json({ error: data.error?.message || "Gemini API error", details: data });
    }
    // Log Gemini response for debugging
    console.log("Gemini API response:", data);
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't get a response.";
    res.json({ reply });
  } catch (err) {
    console.error("Gemini API connection error:", err);
    res.status(500).json({ error: "Failed to connect to Gemini API.", details: err.message });
  }
});

module.exports = router;
