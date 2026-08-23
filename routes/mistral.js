const express = require('express');
const axios = require('axios');
const router = express.Router();

// Config - use hosted Mistral REST directly
const MISTRAL_REST_URL = process.env.MISTRAL_REST_URL;     // e.g. https://api.mistral.ai/v1/generate
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

router.post('/agent', async (req, res) => {
  const { itinerary, messages } = req.body;
  if (!Array.isArray(itinerary) && !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Provide `itinerary` (array) or `messages` (array)' });
  }

  const prompt = Array.isArray(itinerary)
    ? `Optimize this travel itinerary for a 2-day trip: ${itinerary.join(', ')}. Provide short step-by-step suggestions.`
    : undefined;

  try {
    if (!MISTRAL_REST_URL) {
      return res.status(500).json({ error: 'No MISTRAL_REST_URL configured in environment' });
    }

    const model = process.env.MISTRAL_REST_MODEL || process.env.MISTRAL_MODEL || 'mistral-large-latest';
    const payloadMessages = messages || [{ role: 'user', content: prompt }];

    const body = { model, messages: payloadMessages };
    const headers = { 'Content-Type': 'application/json' };
    if (MISTRAL_API_KEY) headers.Authorization = `Bearer ${MISTRAL_API_KEY}`;

    const resp = await axios.post(MISTRAL_REST_URL, body, { headers, timeout: 120000 });
    const data = resp.data;

    // Normalize common provider response shapes into { suggestions: [ ... ] }
    let suggestions = [];

    // OpenAI/Chat-like: choices[].message.content
    if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
      const first = data.choices[0];
      if (first.message && first.message.content) {
        suggestions.push(first.message.content);
      } else if (first.text) {
        suggestions.push(first.text);
      }
    }

    // Mistral-style: maybe top-level 'message' or 'output' fields
    if (suggestions.length === 0) {
      if (data.message && data.message.content) suggestions.push(data.message.content);
      else if (data.output && typeof data.output === 'string') suggestions.push(data.output);
      else if (data.raw && typeof data.raw === 'string') suggestions.push(data.raw);
    }

    // Fallback: if upstream returned any text-like fields, include them
    if (suggestions.length === 0) {
      if (typeof data === 'string') suggestions.push(data);
      else if (data.result && typeof data.result === 'string') suggestions.push(data.result);
    }

    // If still empty, forward full data for debugging
    if (suggestions.length === 0) return res.status(resp.status).json({ raw: data });

    // Clean/sanitize suggestions: remove markdown artifacts, horizontal rules, backticks, and emoji
    const cleanText = (text) => {
      if (!text || typeof text !== 'string') return text;
      let t = text;
      // remove markdown headings and bold/italic markers
      t = t.replace(/\*\*/g, '');
      t = t.replace(/__\s*/g, '');
      t = t.replace(/\*\s*/g, '');
      t = t.replace(/`+/g, '');
      t = t.replace(/(^|\n)\s*[-*]{3,}\s*(\n|$)/g, '$1$2');
      // remove leading bullet markers
      t = t.replace(/(^|\n)\s*[\-*+]\s+/g, '$1');
      // remove markdown heading hashes
      t = t.replace(/(^|\n)\s*#+\s*/g, '$1');
      // remove common emoji ranges
      t = t.replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
      // collapse multiple blank lines
      t = t.replace(/\n{3,}/g, '\n\n');
      // trim whitespace
      t = t.trim();
      return t;
    };

    suggestions = suggestions.map(cleanText).filter(Boolean);

    return res.json({ suggestions });
  } catch (err) {
    console.error('Mistral proxy error:', err.response?.data || err.message || err);
    return res.status(500).json({ error: 'Mistral proxy failed', detail: err.response?.data || err.message });
  }
});

module.exports = router;
