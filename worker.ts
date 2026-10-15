interface Env {
  ASSETS: Fetcher;
  AI: Ai;
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

const MODEL = '@cf/meta/llama-3.1-8b-instruct';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

function parseModelResponse(raw: string): Record<string, unknown> {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('Workers AI returned invalid JSON.');
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function generatePrompt(request: Request, env: Env) {
  const body = (await request.json()) as PromptRequest;
  if (!body.userInput?.trim()) {
    return json({ error: 'Please provide a prompt idea to structure.' }, 400);
  }

  const system = `You are a world-class Prompt Engineering specialist. Transform the user's idea into a production-grade structured prompt. Return ONLY valid JSON with keys full, compact, role, objective, frameworkUsed, and tips. The full prompt must use Markdown headings (# Role, # Objective, # Context, # Instructions, # Constraints & Edge Cases, # Output Format). The compact prompt must be under 2,000 characters. Include 2-3 actionable tips.`;
  const user = `User's Core Idea:\n"""\n${body.userInput.trim()}\n"""\n\nSelected Framework: ${(body.framework || 'standard').toUpperCase()}\nDesired Tone: ${body.tone || 'Professional & Authoritative'}\n${body.audience ? `Target Audience: ${body.audience}\n` : ''}${body.constraints ? `Explicit User Constraints: ${body.constraints}\n` : ''}${body.refinementFeedback && body.previousPrompt ? `Previous Prompt:\n"""\n${body.previousPrompt}\n"""\nRefinement Request:\n"""\n${body.refinementFeedback}\n"""\n` : ''}`;

  const result = await env.AI.run(MODEL, {
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    max_tokens: 3000,
    temperature: 0.3,
  });

  const raw = typeof result === 'object' && result !== null && 'response' in result
    ? String((result as { response: unknown }).response)
    : String(result);
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
