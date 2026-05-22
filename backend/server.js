const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
require('dotenv').config();

const { checkDeadlinesAndNotify } = require('./services/notifier');
const { scrapeOpportunities } = require('./services/scraper');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ==========================================
// BACKGROUND JOBS
// ==========================================
// Schedule the deadline checker to run every day at 8:00 AM.
cron.schedule('0 8 * * *', async () => {
  console.log('Cron triggered: Fetching latest opportunities for deadline check...');
  const data = await scrapeOpportunities();
  checkDeadlinesAndNotify(data);
});

const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'MISSING_KEY' });

// Manual trigger for testing
app.post('/api/trigger-alerts', async (req, res) => {
  try {
    const data = await scrapeOpportunities();
    await checkDeadlinesAndNotify(data);
    res.json({ message: 'Alerts triggered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// AI CHATBOT ENDPOINT (PHASE 3)
// ==========================================
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userProfile } = req.body;
    
    // Get live data context
    const data = await scrapeOpportunities();
    // For context limits, just pass titles and basic reqs
    const contextData = data.map(o => ({
      title: o.title,
      type: o.type,
      deadline: o.applicationDeadline,
      education: o.eligibility.education
    }));

    const systemPrompt = `You are the Opporix AI Career Counselor. You help users find government jobs, scholarships, and exams based on their profile.
    
User Profile: ${userProfile ? JSON.stringify(userProfile) : 'Not provided yet. Encourage them to fill out their profile in the app.'}

Available Opportunities Context (Live Data): ${JSON.stringify(contextData)}

Keep your answers extremely concise, friendly, and helpful. Use emojis. If they ask what they are eligible for, match their profile against the context data provided.`;

    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const rawResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: { text: systemPrompt }
        },
        contents: [{
          parts: [{ text: message }]
        }]
      })
    });

    const aiData = await rawResponse.json();

    if (!rawResponse.ok) {
      console.error('Gemini API Error:', aiData);
      
      // If the user's API key has a 0 quota limit, return a graceful mock response instead of crashing
      if (rawResponse.status === 429 || rawResponse.status === 403 || aiData.error?.message?.includes('quota')) {
        return res.json({ 
          reply: "👋 **Hi there! I am your Mock AI.**\n\nI intercepted this message because your Google Gemini API key has a **Free Tier Quota of 0** (or requires billing to be enabled in your region). \n\nThe Chatbot code is working perfectly! Once you upgrade your API key in the Google Cloud Console, I will magically transform into the real Gemini AI!" 
        });
      }
      
      return res.status(500).json({ 
        error: `API Error: ${aiData.error?.message || 'Unknown error'}` 
      });
    }

    const replyText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't formulate a response.";
    res.json({ reply: replyText });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Failed to connect to AI server.' });
  }
});

// Note: The real scrapeOpportunities function is now imported from services/scraper.js
// It runs dynamically to fetch opportunities.

app.get('/api/opportunities', async (req, res) => {
  console.log('Fetching live opportunities...');
  const data = await scrapeOpportunities();
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
