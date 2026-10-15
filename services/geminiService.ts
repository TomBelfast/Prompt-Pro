export interface GeneratePromptOptions {
  userInput: string;
  framework?: string;
  tone?: string;
  audience?: string;
  constraints?: string;
  refinementFeedback?: string;
  previousPrompt?: string;
}

export interface StructuredPromptResult {
  full: string;
  compact: string;
  role?: string;
  objective?: string;
  frameworkUsed?: string;
  tips?: string[];
}

export const generateStructuredPrompt = async (
  options: string | GeneratePromptOptions
): Promise<StructuredPromptResult> => {
  const payload: GeneratePromptOptions = typeof options === 'string' ? { userInput: options } : options;

  const response = await fetch('/api/generate-prompt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMessage = `Server responded with status ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData?.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Non-json response
    }
    throw new Error(errorMessage);
  }

  const data: StructuredPromptResult = await response.json();
  return data;
};
