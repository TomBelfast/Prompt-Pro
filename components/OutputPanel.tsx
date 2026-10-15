import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CopyIcon } from './icons/CopyIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { CheckIcon } from './icons/CheckIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { StructuredPromptResult } from '../services/geminiService';

interface OutputPanelProps {
  prompt: StructuredPromptResult | null;
  isLoading: boolean;
  isRefining?: boolean;
  error: string | null;
  onRetry?: () => void;
  onRefine?: (feedback: string) => void;
}

type ActiveTab = 'full' | 'compact' | 'tips';

export const OutputPanel: React.FC<OutputPanelProps> = ({
  prompt,
  isLoading,
  isRefining = false,
  error,
  onRetry,
  onRefine,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('full');
  const [refinementInput, setRefinementInput] = useState('');
  const [showRefineBar, setShowRefineBar] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  useEffect(() => {
    setActiveTab('full');
    setShowRefineBar(false);
    setRefinementInput('');
  }, [prompt]);

  const getCurrentText = () => {
    if (!prompt) return '';
    if (activeTab === 'compact') return prompt.compact;
    if (activeTab === 'tips') {
      return (prompt.tips || []).map((t, i) => `${i + 1}. ${t}`).join('\n\n');
    }
    return prompt.full;
  };

  const handleCopy = () => {
    const text = getCurrentText();
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
    }
  };

  const handleExport = () => {
    const text = getCurrentText();
    if (!text) return;

    const filename =
      activeTab === 'compact'
        ? 'compact-prompt.md'
        : activeTab === 'tips'
        ? 'prompt-tips.md'
        : 'structured-prompt.md';

    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRefineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (refinementInput.trim() && onRefine) {
      onRefine(refinementInput.trim());
      setRefinementInput('');
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="relative mb-4">
            <div className="w-12 h-12 rounded-full border-4 border-lime-500/20 border-t-lime-500 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-lime-600 dark:text-lime-400">
              <span className="text-xs font-bold">AI</span>
            </div>
          </div>
          <p className="text-base font-semibold text-gray-900 dark:text-white">
            Structuring Professional Prompt
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
            Applying prompt engineering principles: persona definition, contextual framing, objective alignment, and edge-case guardrails...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-base font-semibold text-gray-900 dark:text-white">Generation Failed</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md break-words">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 px-4 py-2 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center gap-1.5"
            >
              <RefreshIcon className="w-3.5 h-3.5" />
              Try Again
            </button>
          )}
        </div>
      );
    }

    if (!prompt) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-400 dark:text-gray-500">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            No Prompt Generated Yet
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs">
            Enter an idea on the left and select your preferred framework to generate a production-ready prompt.
          </p>
        </div>
      );
    }

    if (activeTab === 'tips') {
      const tips = prompt.tips || [];
      return (
        <div className="p-5 space-y-4 overflow-y-auto h-full">
          <div className="bg-lime-50 dark:bg-lime-950/30 border border-lime-200 dark:border-lime-900/50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-lime-900 dark:text-lime-300 mb-1">
              Architecture & Strategy
            </h3>
            <p className="text-xs text-lime-800 dark:text-lime-400">
              Framework applied: <strong className="font-bold">{prompt.frameworkUsed || 'Standard Structured'}</strong>
            </p>
            {prompt.role && (
              <div className="mt-2 text-xs text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Synthesized Role:</span> {prompt.role}
              </div>
            )}
            {prompt.objective && (
              <div className="mt-1 text-xs text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Primary Objective:</span> {prompt.objective}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
              Recommendations for Testing this Prompt:
            </h4>
            {tips.length > 0 ? (
              <ul className="space-y-2.5">
                {tips.map((tip, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-lg border border-gray-200 dark:border-gray-800"
                  >
                    <span className="w-5 h-5 rounded-full bg-lime-500/20 text-lime-700 dark:text-lime-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500">
                Test this prompt against standard test cases and refine edge cases if the model hallucinates.
              </p>
            )}
          </div>
        </div>
      );
    }

    const contentToDisplay = activeTab === 'compact' ? prompt.compact : prompt.full;

    return (
      <div className="w-full h-full overflow-y-auto p-5 text-gray-800 dark:text-gray-200 text-sm">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ ...props }) => (
              <h1
                className="text-lg font-bold text-gray-900 dark:text-white mt-4 mb-2 pb-1.5 border-b border-gray-200 dark:border-gray-800 first:mt-0 flex items-center gap-2"
                {...props}
              />
            ),
            h2: ({ ...props }) => (
              <h2
                className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-3 mb-1.5 text-lime-700 dark:text-lime-400"
                {...props}
              />
            ),
            h3: ({ ...props }) => (
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-2 mb-1" {...props} />
            ),
            ul: ({ ...props }) => <ul className="list-disc list-outside space-y-1.5 pl-5 mb-3" {...props} />,
            ol: ({ ...props }) => <ol className="list-decimal list-outside space-y-1.5 pl-5 mb-3" {...props} />,
            li: ({ ...props }) => <li className="leading-relaxed" {...props} />,
            p: ({ ...props }) => <p className="mb-2.5 leading-relaxed" {...props} />,
            code: ({ inline, className, children, ...props }: any) => {
              if (inline) {
                return (
                  <code
                    className="font-mono text-xs bg-gray-100 dark:bg-gray-800 text-lime-700 dark:text-lime-300 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              return (
                <div className="my-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                  <pre className="p-3 bg-gray-900 text-gray-100 font-mono text-xs overflow-x-auto leading-normal">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              );
            },
            strong: ({ ...props }) => (
              <strong className="font-semibold text-gray-950 dark:text-white" {...props} />
            ),
            blockquote: ({ ...props }) => (
              <blockquote
                className="border-l-4 border-lime-500 pl-3 italic text-gray-600 dark:text-gray-400 my-2"
                {...props}
              />
            ),
          }}
        >
          {contentToDisplay}
        </ReactMarkdown>
      </div>
    );
  };

  const currentText = getCurrentText();
  const wordCount = currentText ? currentText.trim().split(/\s+/).length : 0;
  const charCount = currentText ? currentText.length : 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col h-full overflow-hidden">
      {/* Top Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            2. Structured Output
            {prompt && (
              <span className="text-[11px] font-mono font-normal text-gray-400">
                ({wordCount} words &bull; {charCount} chars)
              </span>
            )}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Copy or export your engineered prompt ready for LLM consumption.
          </p>
        </div>

        {prompt && !isLoading && (
          <div className="flex items-center gap-1.5">
            {onRefine && (
              <button
                onClick={() => setShowRefineBar(!showRefineBar)}
                className={`text-xs px-2.5 py-1.5 rounded-md border flex items-center gap-1.5 transition-colors ${
                  showRefineBar
                    ? 'bg-lime-500/10 border-lime-500/40 text-lime-700 dark:text-lime-300'
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title="Iterate or adjust this prompt with quick feedback"
              >
                <RefreshIcon className="w-3.5 h-3.5" />
                Refine
              </button>
            )}

            <button
              onClick={handleCopy}
              className="text-xs px-3 py-1.5 rounded-md bg-lime-500 hover:bg-lime-400 text-gray-950 font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              title="Copy to clipboard"
            >
              {copied ? <CheckIcon className="w-3.5 h-3.5" /> : <CopyIcon />}
              {copied ? 'Copied!' : 'Copy'}
            </button>

            <button
              onClick={handleExport}
              className="text-xs p-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Export as Markdown (.md)"
            >
              <DownloadIcon />
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      {prompt && !isLoading && !error && (
        <div className="px-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/30 flex items-center gap-1">
          <button
            onClick={() => setActiveTab('full')}
            className={`py-2 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'full'
                ? 'border-lime-500 text-lime-700 dark:text-lime-400 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            Full Prompt (Markdown)
          </button>
          <button
            onClick={() => setActiveTab('compact')}
            className={`py-2 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'compact'
                ? 'border-lime-500 text-lime-700 dark:text-lime-400 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            Compact Version (&lt;2k)
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`py-2 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'tips'
                ? 'border-lime-500 text-lime-700 dark:text-lime-400 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            Strategy & Tips
          </button>
        </div>
      )}

      {/* Refinement input bar */}
      {showRefineBar && prompt && (
        <form
          onSubmit={handleRefineSubmit}
          className="p-3 bg-lime-500/5 border-b border-lime-500/20 flex items-center gap-2"
        >
          <input
            type="text"
            value={refinementInput}
            onChange={(e) => setRefinementInput(e.target.value)}
            placeholder="e.g. Add strict TypeScript type definitions, or add unit testing instructions..."
            className="flex-grow text-xs p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-lime-500"
            disabled={isRefining}
          />
          <button
            type="submit"
            disabled={isRefining || !refinementInput.trim()}
            className="text-xs px-3 py-2 bg-gray-900 dark:bg-lime-400 text-white dark:text-gray-950 font-semibold rounded-md hover:bg-gray-800 dark:hover:bg-lime-300 disabled:opacity-50 transition-colors"
          >
            {isRefining ? 'Refining...' : 'Apply Refinement'}
          </button>
        </form>
      )}

      {/* Main Content Area */}
      <div className="flex-grow min-h-[300px] relative overflow-hidden bg-white dark:bg-gray-900">
        {renderContent()}
      </div>
    </div>
  );
};
