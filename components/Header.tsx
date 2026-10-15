import React from 'react';
import { HistoryIcon } from './icons/HistoryIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { SparkleIcon } from './icons/SparkleIcon';
import { Theme } from '../App';

interface HeaderProps {
  onToggleHistory: () => void;
  isHistoryVisible: boolean;
  onToggleTheme: () => void;
  currentTheme: Theme;
  historyCount?: number;
  onNewPrompt?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleHistory,
  isHistoryVisible,
  onToggleTheme,
  currentTheme,
  historyCount = 0,
  onNewPrompt,
}) => {
  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center gap-4">
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-lime-500 to-emerald-600 flex items-center justify-center text-gray-950 shadow-sm shadow-lime-500/20">
            <SparkleIcon />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              Remix Professional Prompt
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-lime-500/10 text-lime-700 dark:bg-lime-500/20 dark:text-lime-400 border border-lime-500/30">
                Studio
              </span>
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">
              Turn simple concepts into production-ready, structured LLM prompts
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {onNewPrompt && (
            <button
              onClick={onNewPrompt}
              className="text-xs font-medium px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden sm:inline-flex items-center gap-1.5"
              title="Clear form and create a fresh prompt"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Prompt
            </button>
          )}

          <button
            onClick={onToggleHistory}
            className={`relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
              isHistoryVisible ? 'bg-gray-100 dark:bg-gray-800 text-lime-600 dark:text-lime-400' : ''
            }`}
            title={isHistoryVisible ? 'Hide history panel' : 'Show history panel'}
            aria-label="Toggle History Panel"
          >
            <HistoryIcon />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 text-[10px] font-bold w-4 h-4 rounded-full bg-lime-500 text-gray-950 flex items-center justify-center">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </button>

          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Color Theme"
          >
            {currentTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </header>
  );
};