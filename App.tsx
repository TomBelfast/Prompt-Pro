import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { MainLayout } from './components/MainLayout';
import {
  generateStructuredPrompt,
  StructuredPromptResult,
  GeneratePromptOptions,
} from './services/geminiService';

export interface HistoryItem {
  id: string;
  userInput: string;
  structuredPrompt: StructuredPromptResult;
  timestamp: number;
  framework?: string;
  tone?: string;
}

export type Theme = 'light' | 'dark';

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  const savedTheme = localStorage.getItem('theme') as Theme | null;
  if (savedTheme) {
    return savedTheme;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>('');
  const [framework, setFramework] = useState<string>('standard');
  const [tone, setTone] = useState<string>('Professional & Technical');
  const [audience, setAudience] = useState<string>('');
  const [constraints, setConstraints] = useState<string>('');
  const [structuredPrompt, setStructuredPrompt] = useState<StructuredPromptResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState<boolean>(true);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Load history from localStorage
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('prompt-history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (err) {
      console.error('Failed to load history from localStorage', err);
    }
  }, []);

  const saveHistory = (items: HistoryItem[]) => {
    setHistory(items);
    try {
      localStorage.setItem('prompt-history', JSON.stringify(items));
    } catch (err) {
      console.error('Failed to save history to localStorage', err);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!userInput.trim()) {
      setError('Please enter a prompt idea to get started.');
      return;
    }
    setIsLoading(true);
    setError(null);

    const options: GeneratePromptOptions = {
      userInput: userInput.trim(),
      framework,
      tone,
      audience: audience.trim() || undefined,
      constraints: constraints.trim() || undefined,
    };

    try {
      const result = await generateStructuredPrompt(options);
      setStructuredPrompt(result);

      const newHistoryItem: HistoryItem = {
        id: new Date().toISOString() + '-' + Math.random().toString(36).substring(2, 6),
        userInput: userInput.trim(),
        structuredPrompt: result,
        timestamp: Date.now(),
        framework,
        tone,
      };

      saveHistory([newHistoryItem, ...history.slice(0, 49)]); // keep latest 50
    } catch (err: any) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while communicating with the server.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, framework, tone, audience, constraints, history]);

  const handleRefine = useCallback(
    async (refinementFeedback: string) => {
      if (!structuredPrompt || !refinementFeedback.trim()) return;

      setIsRefining(true);
      setError(null);

      const options: GeneratePromptOptions = {
        userInput: userInput.trim(),
        framework,
        tone,
        audience: audience.trim() || undefined,
        constraints: constraints.trim() || undefined,
        previousPrompt: structuredPrompt.full,
        refinementFeedback: refinementFeedback.trim(),
      };

      try {
        const result = await generateStructuredPrompt(options);
        setStructuredPrompt(result);

        const newHistoryItem: HistoryItem = {
          id: new Date().toISOString() + '-' + Math.random().toString(36).substring(2, 6),
          userInput: `${userInput} [Refined: ${refinementFeedback.slice(0, 30)}]`,
          structuredPrompt: result,
          timestamp: Date.now(),
          framework,
          tone,
        };

        saveHistory([newHistoryItem, ...history.slice(0, 49)]);
      } catch (err: any) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to refine prompt. Please try again.';
        setError(errorMessage);
      } finally {
        setIsRefining(false);
      }
    },
    [structuredPrompt, userInput, framework, tone, audience, constraints, history]
  );

  const handleSelectHistory = useCallback((item: HistoryItem) => {
    setUserInput(item.userInput);
    setStructuredPrompt(item.structuredPrompt);
    if (item.framework) setFramework(item.framework);
    if (item.tone) setTone(item.tone);
    setError(null);
  }, []);

  const handleDeleteHistoryItem = useCallback(
    (id: string) => {
      saveHistory(history.filter((item) => item.id !== id));
    },
    [history]
  );

  const handleClearHistory = useCallback(() => {
    saveHistory([]);
  }, []);

  const handleToggleHistory = () => {
    setIsHistoryVisible((prev) => !prev);
  };

  const handleNewPrompt = () => {
    setUserInput('');
    setStructuredPrompt(null);
    setError(null);
  };

  const handleToggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    try {
      localStorage.setItem('theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (err) {
      console.error('Failed to save theme to localStorage', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-sans flex flex-col transition-colors duration-200">
      <Header
        onToggleHistory={handleToggleHistory}
        isHistoryVisible={isHistoryVisible}
        onToggleTheme={handleToggleTheme}
        currentTheme={theme}
        historyCount={history.length}
        onNewPrompt={handleNewPrompt}
      />
      <MainLayout
        isHistoryVisible={isHistoryVisible}
        historyPanel={
          <HistoryPanel
            history={history}
            onSelect={handleSelectHistory}
            onDelete={handleDeleteHistoryItem}
            onClear={handleClearHistory}
          />
        }
        inputPanel={
          <InputPanel
            value={userInput}
            onValueChange={setUserInput}
            framework={framework}
            onFrameworkChange={setFramework}
            tone={tone}
            onToneChange={setTone}
            audience={audience}
            onAudienceChange={setAudience}
            constraints={constraints}
            onConstraintsChange={setConstraints}
            onGenerate={handleGenerate}
            isLoading={isLoading || isRefining}
          />
        }
        outputPanel={
          <OutputPanel
            prompt={structuredPrompt}
            isLoading={isLoading}
            isRefining={isRefining}
            error={error}
            onRetry={handleGenerate}
            onRefine={handleRefine}
          />
        }
      />
      <footer className="mt-auto border-t border-gray-200 dark:border-gray-800/80 py-4 px-6 text-center text-xs text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row items-center justify-between container mx-auto gap-2">
        <span>Remix Professional Prompt &bull; Structured Prompt Engineering</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          Powered by Cloudflare Workers AI
        </span>
      </footer>
    </div>
  );
};

export default App;
