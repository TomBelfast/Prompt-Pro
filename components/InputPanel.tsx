import React, { useState } from 'react';
import { SparkleIcon } from './icons/SparkleIcon';

interface InputPanelProps {
  value: string;
  onValueChange: (value: string) => void;
  framework: string;
  onFrameworkChange: (framework: string) => void;
  tone: string;
  onToneChange: (tone: string) => void;
  audience: string;
  onAudienceChange: (audience: string) => void;
  constraints: string;
  onConstraintsChange: (constraints: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const FRAMEWORKS = [
  { id: 'standard', name: 'Standard', desc: 'Role, Goal, Context, Steps & Notes' },
  { id: 'crispe', name: 'CRISPE', desc: 'Capacity, Insight, Statement, Personality, Experiment' },
  { id: 'rtf', name: 'RTF', desc: 'Role, Task, Strict Format' },
  { id: 'cot', name: 'Chain of Thought', desc: 'Step-by-step reasoning protocol & checks' },
];

const TONES = [
  'Professional & Technical',
  'Executive & Strategic',
  'Creative & Persuasive',
  'Concise & Minimalist',
];

const EXAMPLES = [
  {
    category: 'Engineering',
    prompt: 'A Python script to scrape market stock data with rate-limiting, retries, and SQLite storage',
  },
  {
    category: 'Marketing',
    prompt: 'A 5-part email nurture sequence for converting trial users to annual B2B subscribers',
  },
  {
    category: 'Analytics',
    prompt: 'A PostgreSQL query calculating 30-day cohort retention rates and revenue retention',
  },
  {
    category: 'Product',
    prompt: 'A Product Requirements Document (PRD) for real-time document co-editing with offline sync',
  },
  {
    category: 'Architecture',
    prompt: 'Cloud architecture review checklist for migrating a monolithic app to event-driven microservices',
  },
];

export const InputPanel: React.FC<InputPanelProps> = ({
  value,
  onValueChange,
  framework,
  onFrameworkChange,
  tone,
  onToneChange,
  audience,
  onAudienceChange,
  constraints,
  onConstraintsChange,
  onGenerate,
  isLoading,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [touched, setTouched] = useState(false);

  const isInvalid = touched && !value.trim();
  const isDisabled = isLoading || !value.trim();

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            1. Describe Your Concept
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Provide a basic idea, objective, or rough requirement.
          </p>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
          {value.length} chars
        </span>
      </div>

      <div className="p-4 flex-grow flex flex-col gap-4 overflow-y-auto">
        {/* Inspiration Examples */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Quick Inspiration:
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onValueChange(ex.prompt);
                  setTouched(false);
                }}
                className="text-xs text-left bg-gray-100 dark:bg-gray-800/80 hover:bg-lime-50 dark:hover:bg-lime-950/40 text-gray-700 dark:text-gray-300 hover:text-lime-700 dark:hover:text-lime-300 border border-gray-200 dark:border-gray-700/60 rounded-md px-2.5 py-1 transition-all duration-150 flex items-center gap-1"
                title={ex.prompt}
              >
                <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">
                  {ex.category}:
                </span>
                <span className="truncate max-w-[200px] sm:max-w-[240px]">{ex.prompt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Idea Textarea */}
        <div className="flex-grow flex flex-col min-h-[160px]">
          <textarea
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="e.g. Write an API that processes customer invoices, calculates tax per country, and handles refund edge cases..."
            className={`w-full flex-grow p-3 text-sm rounded-lg border bg-gray-50/70 dark:bg-gray-950/60 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-all resize-none leading-relaxed ${
              isInvalid
                ? 'border-red-500 ring-2 ring-red-500/20'
                : 'border-gray-300 dark:border-gray-700 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20'
            }`}
          />
          {isInvalid && (
            <p className="text-red-500 text-xs mt-1">Please enter an idea to structure.</p>
          )}
        </div>

        {/* Framework Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
            Structuring Framework
          </label>
          <div className="grid grid-cols-2 gap-2">
            {FRAMEWORKS.map((fw) => {
              const active = framework === fw.id;
              return (
                <button
                  key={fw.id}
                  type="button"
                  onClick={() => onFrameworkChange(fw.id)}
                  className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                    active
                      ? 'border-lime-500 bg-lime-500/10 text-lime-900 dark:text-lime-300 font-medium'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="font-semibold">{fw.name}</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                    {fw.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tone Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
            Target Tone
          </label>
          <div className="flex flex-wrap gap-1.5">
            {TONES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onToneChange(t)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                  tone === t
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <div className="border-t border-gray-100 dark:border-gray-800/80 pt-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1 font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                showAdvanced ? 'rotate-90' : ''
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            {showAdvanced ? 'Hide Custom Details' : 'Add Target Audience & Constraints'}
          </button>

          {showAdvanced && (
            <div className="mt-3 space-y-3 bg-gray-50/80 dark:bg-gray-950/40 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Audience / End User (Optional)
                </label>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => onAudienceChange(e.target.value)}
                  placeholder="e.g. Senior Backend Engineers, Non-technical stakeholders"
                  className="w-full text-xs p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-lime-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Strict Constraints & Forbidden Elements (Optional)
                </label>
                <input
                  type="text"
                  value={constraints}
                  onChange={(e) => onConstraintsChange(e.target.value)}
                  placeholder="e.g. Must not use external libraries, output purely valid JSON"
                  className="w-full text-xs p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-lime-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Submit Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <button
          onClick={onGenerate}
          disabled={isDisabled}
          className="w-full bg-gradient-to-r from-lime-400 via-lime-500 to-emerald-500 text-gray-950 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:from-lime-300 hover:to-emerald-400 shadow-md shadow-lime-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-gray-950"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Generating Structured Prompt...</span>
            </>
          ) : (
            <>
              <SparkleIcon />
              <span>Generate Structured Prompt</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};