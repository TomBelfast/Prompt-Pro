import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '5mb' }));

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

interface PromptRequest {
  userInput: string;
  framework?: string; // 'standard' | 'crispe' | 'rtf' | 'cot'
  tone?: string;
  audience?: string;
  constraints?: string;
  refinementFeedback?: string;
  previousPrompt?: string;
}

app.post('/api/generate-prompt', async (req: Request, res: Response) => {
  try {
    const {
      userInput,
      framework = 'standard',
      tone = 'Professional & Authoritative',
      audience,
      constraints,
      refinementFeedback,
      previousPrompt,
    }: PromptRequest = req.body;

    if (!userInput || !userInput.trim()) {
      res.status(400).json({ error: 'Please provide a prompt idea to structure.' });
      return;
    }

    const ai = getGeminiClient();

    let systemInstruction = `You are a world-class Prompt Engineering specialist. Your mission is to transform simple or unpolished user ideas into production-grade, highly effective, structured prompts for Large Language Models (LLMs).

When crafting prompts:
1. Always eliminate vagueness and ambiguous terminology.
2. Provide explicit roles, contextual boundaries, step-by-step instructions, concrete input/output specs, edge-case handling, and quality metrics.
3. Include both a comprehensive Full Markdown version and a high-density Compact version (under 2,000 characters) ideal for character-constrained systems.
4. The Full version should use clean, readable Markdown with standard headings (# Role, # Objective, # Context, # Instructions, # Constraints & Edge Cases, # Output Format).
5. Always provide 2-3 actionable pro-tips on how the user can test or iterate with the prompt.`;

    let userInstruction = `User's Core Idea:
"""
${userInput.trim()}
"""

Selected Framework: ${framework.toUpperCase()}
Desired Tone: ${tone}
${audience ? `Target Audience: ${audience}\n` : ''}
${constraints ? `Explicit User Constraints: ${constraints}\n` : ''}
${refinementFeedback && previousPrompt ? `Previous Prompt Iteration:\n"""\n${previousPrompt}\n"""\nRefinement Request:\n"""\n${refinementFeedback}\n"""\nPlease incorporate these refinements strictly.\n` : ''}

Generate the complete structured prompt and compact version according to the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userInstruction,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            full: {
              type: Type.STRING,
              description: 'The complete, comprehensive structured prompt in Markdown format with clear sections (# Role, # Objective, # Context, # Instructions, # Constraints, # Expected Output).',
            },
            compact: {
              type: Type.STRING,
              description: 'A condensed single-paragraph or tightly formatted prompt containing the critical role, task, and rules under 2,000 characters.',
            },
            role: {
              type: Type.STRING,
              description: 'The synthesized expert role for the AI.',
            },
            objective: {
              type: Type.STRING,
              description: 'The single most important goal or outcome.',
            },
            frameworkUsed: {
              type: Type.STRING,
              description: 'Name of the framework applied (e.g. Standard Structured, CRISPE, RTF, Chain of Thought).',
            },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2 to 3 practical tips for getting optimal results with this prompt.',
            },
          },
          required: ['full', 'compact'],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Received empty response from Gemini model.');
    }

    const data = JSON.parse(responseText);
    res.json(data);
  } catch (error: any) {
    console.error('Error generating prompt:', error);
    const message = error?.message || 'Failed to generate prompt. Please try again.';
    res.status(500).json({ error: message });
  }
});

// Vite Middleware for Development / Static file serving for Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Professional Prompt Structurizer server listening on port ${PORT}`);
  });
}

startServer();
