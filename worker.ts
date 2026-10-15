interface Env {
  ASSETS: Fetcher;
  AI: Ai;
  OMNI_API_KEY?: string;
}

interface PromptRequest {
  userInput: string;
  framework?: string;
  tone?: string;
  audience?: string;
  constraints?: string;
  refinementFeedback?: string;
  previousPrompt?: string;
}

const MODEL = '@cf/meta/llama-3.1-8b-instruct-fp8';
const OMNI_BASE_URL = 'https://omni.aihub.ovh/v1';
const OMNI_MODEL = 'agy/gemini-3.8-flash-high';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

function parseModelResponse(raw: string): Record<string, unknown> {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      // Some hosted models still emit almost-valid JSON despite JSON mode.
    }
  }

  // Keep the UI usable when a provider ignores structured-output instructions.
  // The next request can still be retried, and the raw answer remains visible.
  return {
    full: cleaned,
    compact: cleaned.slice(0, 2000),
    role: 'Prompt Engineering Assistant',
    objective: 'Transform the supplied idea into a production-ready prompt.',
    frameworkUsed: 'STANDARD',
    tips: ['Review the generated structure and refine it if needed.'],
  };
}

async function runOmni(system: string, user: string, apiKey: string) {
  const response = await fetch(`${OMNI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: OMNI_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: 3000,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error(`Omni API request failed (${response.status}).`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: unknown } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('Omni API returned an empty response.');
  }
  return content;
}

async function generatePrompt(request: Request, env: Env) {
  const body = (await request.json()) as PromptRequest;
  if (!body.userInput?.trim()) {
    return json({ error: 'Please provide a prompt idea to structure.' }, 400);
  }

  const system = `You are a world-class Prompt Engineering specialist. Transform the user's idea into a production-grade structured prompt. Return ONLY valid JSON with keys full, compact, role, objective, frameworkUsed, and tips. The full prompt must use Markdown headings (# Role, # Objective, # Context, # Instructions, # Constraints & Edge Cases, # Output Format). The compact prompt must be under 2,000 characters. Include 2-3 actionable tips.`;
  const user = `User's Core Idea:\n"""\n${body.userInput.trim()}\n"""\n\nSelected Framework: ${(body.framework || 'standard').toUpperCase()}\nDesired Tone: ${body.tone || 'Professional & Authoritative'}\n${body.audience ? `Target Audience: ${body.audience}\n` : ''}${body.constraints ? `Explicit User Constraints: ${body.constraints}\n` : ''}${body.refinementFeedback && body.previousPrompt ? `Previous Prompt:\n"""\n${body.previousPrompt}\n"""\nRefinement Request:\n"""\n${body.refinementFeedback}\n"""\n` : ''}`;

  const raw = env.OMNI_API_KEY
    ? await runOmni(system, user, env.OMNI_API_KEY)
    : await (async () => {
      const result = await env.AI.run(MODEL, {
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        max_tokens: 3000,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });
      return typeof result === 'object' && result !== null && 'response' in result
        ? String((result as { response: unknown }).response)
        : String(result);
    })();
  return json(parseModelResponse(raw));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/health') return json({ status: 'ok', service: 'prompt-pro' });
    if (url.pathname === '/api/generate-prompt' && request.method === 'POST') {
      try {
        return await generatePrompt(request, env);
      } catch (error) {
        console.error('Error generating prompt:', error);
        return json({ error: error instanceof Error ? error.message : 'Failed to generate prompt.' }, 500);
      }
    }
    return env.ASSETS.fetch(request);
  },
};
