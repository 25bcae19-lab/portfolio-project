/**
 * Express server: serves the SPA frontend and handles contact form submissions (MongoDB Atlas).
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const path = require('path');
const express = require('express');
const cors = require('cors');
const { connectDB, mongoose } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Contact message schema
const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    email: { type: String, required: true, trim: true, maxlength: 320 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
  },
  { timestamps: true }
);

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
);
app.use(express.json({ limit: '100kb' }));

// Health check for platforms like Render
app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true, uptime: process.uptime() });
});

// POST /contact — store contact form in MongoDB Atlas
app.post('/contact', async (req, res) => {
  try {
    await connectDB();
    const { name, email, message } = req.body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Name is required.' });
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Email is required.' });
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!emailOk) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const doc = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    });

    res.status(201).json({
      success: true,
      id: doc._id,
      message: 'Thank you — your message was received.',
    });
  } catch (err) {
    console.error('POST /contact error:', err.message);
    if (err.name === 'MongoServerError' || err.name === 'MongoNetworkError') {
      return res.status(503).json({ error: 'Database temporarily unavailable. Please try again later.' });
    }
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// Static frontend (index.html, CSS, JS)
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

async function start() {
  try {
    await connectDB();
  } catch (e) {
    console.warn('Startup: MongoDB not connected yet —', e.message);
    console.warn('Contact form will fail until MONGODB_URI is valid.');
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

start();
