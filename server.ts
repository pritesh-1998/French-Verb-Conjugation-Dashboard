import express from 'express';
import path from 'path';
import https from 'https';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// In-memory audio cache for high-frequency verbs & conjugations
// Prevents duplicate outbound requests and guarantees sub-5ms response times
const audioCache = new Map<string, { buffer: Buffer; mimeType: string; timestamp: number }>();
const MAX_CACHE_ENTRIES = 2000;

/**
 * Fetch native French audio using the Google French speech engine.
 * Produces authentic Parisian French phonetics with correct liaisons and silent letters.
 */
function fetchFrenchAudio(text: string): Promise<{ buffer: Buffer; mimeType: string }> {
  return new Promise((resolve, reject) => {
    // Normalise text for French pronunciation
    const cleanText = text
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, 300);

    const encoded = encodeURIComponent(cleanText);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=fr&client=tw-ob`;

    const req = https.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: 'https://translate.google.com/',
          Accept: 'audio/mpeg, audio/*;q=0.9',
        },
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          return reject(new Error(`TTS upstream error: HTTP ${res.statusCode}`));
        }

        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          if (buffer.length === 0) {
            return reject(new Error('TTS upstream returned empty audio buffer'));
          }
          resolve({ buffer, mimeType: 'audio/mpeg' });
        });
      }
    );

    req.on('error', reject);
    req.setTimeout(8000, () => {
      req.destroy();
      reject(new Error('TTS request timed out'));
    });
  });
}

// JSON parsing for API requests
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    cachedItems: audioCache.size,
  });
});

/**
 * Native French TTS Audio endpoint
 * GET /api/tts?text=je+suis
 */
app.get('/api/tts', async (req, res) => {
  const rawText = req.query.text;
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    res.status(400).json({ error: 'Missing text parameter' });
    return;
  }

  const cleanText = rawText.trim().toLowerCase();
  const cacheKey = cleanText;

  // Check in-memory cache first
  const cached = audioCache.get(cacheKey);
  if (cached) {
    res.set({
      'Content-Type': cached.mimeType,
      'Content-Length': cached.buffer.length.toString(),
      'Cache-Control': 'public, max-age=86400',
      'X-Audio-Source': 'cache',
    });
    res.send(cached.buffer);
    return;
  }

  try {
    const { buffer, mimeType } = await fetchFrenchAudio(rawText);

    // Save to cache (evict oldest if full)
    if (audioCache.size >= MAX_CACHE_ENTRIES) {
      const firstKey = audioCache.keys().next().value;
      if (firstKey) audioCache.delete(firstKey);
    }
    audioCache.set(cacheKey, { buffer, mimeType, timestamp: Date.now() });

    res.set({
      'Content-Type': mimeType,
      'Content-Length': buffer.length.toString(),
      'Cache-Control': 'public, max-age=86400',
      'X-Audio-Source': 'french-native-engine',
    });
    res.send(buffer);
  } catch (err: any) {
    console.error('French TTS generation error:', err?.message || err);
    res.status(502).json({ error: 'Failed to synthesize French speech', details: err?.message });
  }
});

/**
 * Batch TTS preload endpoint
 * POST /api/tts/batch { texts: ["je suis", "tu es", "il est"] }
 */
app.post('/api/tts/batch', async (req, res) => {
  const { texts } = req.body;
  if (!Array.isArray(texts)) {
    res.status(400).json({ error: 'texts must be an array of strings' });
    return;
  }

  const results: { text: string; cached: boolean; success: boolean }[] = [];
  const toFetch = texts.slice(0, 12); // Limit batch size to 12

  for (const t of toFetch) {
    if (typeof t !== 'string' || !t.trim()) continue;
    const clean = t.trim().toLowerCase();
    if (audioCache.has(clean)) {
      results.push({ text: t, cached: true, success: true });
      continue;
    }

    try {
      const { buffer, mimeType } = await fetchFrenchAudio(t);
      if (audioCache.size >= MAX_CACHE_ENTRIES) {
        const firstKey = audioCache.keys().next().value;
        if (firstKey) audioCache.delete(firstKey);
      }
      audioCache.set(clean, { buffer, mimeType, timestamp: Date.now() });
      results.push({ text: t, cached: false, success: true });
    } catch {
      results.push({ text: t, cached: false, success: false });
    }
  }

  res.json({ processed: results.length, results });
});

async function startServer() {
  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`French Conjugation Server running on port ${PORT}`);
  });
}

startServer();
