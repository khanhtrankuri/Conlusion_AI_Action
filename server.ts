import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '2mb' }));

  // Single-speaker AI Instructor TTS using gemini-3.8-flash-lite-tts
  app.post('/api/tts', async (req, res) => {
    try {
      const { text, voiceName = 'Kore' } = req.body as {
        text?: string;
        voiceName?: string;
      };

      if (!text || !text.trim()) {
        res.status(400).json({ error: 'Missing text for speech generation.' });
        return;
      }

      const ai = getGenAIClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text.slice(0, 3800),
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'].includes(
                  voiceName
                )
                  ? voiceName
                  : 'Kore',
              },
            },
          },
        },
      });

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      const mimeType =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType ||
        'audio/wav';

      if (!base64Audio) {
        res.status(502).json({ error: 'No audio returned from Gemini TTS.' });
        return;
      }

      res.json({
        audioBase64: base64Audio,
        mimeType,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate TTS audio.';
      console.error('[/api/tts] Error:', message);
      res.status(500).json({ error: message });
    }
  });

  // Dual-speaker AI Podcast Teaching Dialogue using gemini-3.8-flash-tts
  app.post('/api/tts-podcast', async (req, res) => {
    try {
      const { turns } = req.body as {
        turns?: Array<{ speaker: 'GiangVien' | 'KySu'; text: string }>;
      };

      if (!turns || !Array.isArray(turns) || turns.length === 0) {
        res.status(400).json({ error: 'Missing dialogue turns.' });
        return;
      }

      const ai = getGenAIClient();
      const parts = turns.map((t) => ({
        text: `${t.speaker}: ${t.text}`,
        speechMetadata: {
          speaker: t.speaker,
          style:
            t.speaker === 'GiangVien'
              ? 'Clear, articulate AI Professor explaining deep mathematical and architectural concepts'
              : 'Practical, insightful Principal Autonomous Driving & ML Systems Engineer sharing production war stories',
        },
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts,
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                {
                  speaker: 'GiangVien',
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                  },
                },
                {
                  speaker: 'KySu',
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Charon' },
                  },
                },
              ],
            },
          },
        },
      });

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      const mimeType =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType ||
        'audio/wav';

      if (!base64Audio) {
        res.status(502).json({ error: 'No audio returned from Podcast TTS.' });
        return;
      }

      res.json({
        audioBase64: base64Audio,
        mimeType,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to generate Podcast TTS audio.';
      console.error('[/api/tts-podcast] Error:', message);
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
