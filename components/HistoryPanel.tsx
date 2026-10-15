import React, { useState } from 'react';
import { HistoryItem } from '../App';
import { TrashIcon } from './icons/TrashIcon';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete?: (id: string) => void;
  onClear: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onSelect,
  onDelete,
  onClear,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = history.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.userInput.toLowerCase().includes(query) ||
      (item.structuredPrompt.role && item.structuredPrompt.role.toLowerCase().includes(query)) ||
      (item.framework && item.framework.toLowerCase().includes(query))
    );
  });

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col h-full max-h-[calc(100vh-140px)] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            History
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono">
              {history.length}
            </span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Past generated prompts</p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear your prompt history?')) {
                onClear();
              }
            }}
            className="text-xs text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-1"
            title="Clear all history"
            aria-label="Clear all history"
          >
            <TrashIcon />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* Search Filter */}
      {history.length > 3 && (
        <div className="p-2.5 border-b border-gray-100 dark:border-gray-800/80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompts..."
            className="w-full text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-lime-500"
          />
        </div>
      )}

      {/* List */}
      <div className="flex-grow overflow-y-auto p-3 space-y-2">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400 dark:text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 mb-2 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-xs">Your generation history will be recorded here automatically.</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <p className="text-xs text-center text-gray-400 p-4">No matching prompts found.</p>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-lg border border-gray-200 dark:border-gray-800 hover:border-lime-500/40 bg-gray-50/50 dark:bg-gray-950/40 hover:bg-lime-50/30 dark:hover:bg-lime-950/20 p-3 transition-all"
            >
              <div
                onClick={() => onSelect(item)}
                className="cursor-pointer"
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-lime-500/10 text-lime-700 dark:text-lime-400 border border-lime-500/20">
                    {item.framework || 'Standard'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {new Date(item.timestamp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-2">
                  {item.userInput}
                </p>

                {item.structuredPrompt?.role && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-1 italic">
                    Role: {item.structuredPrompt.role}
                  </p>
                )}
              </div>

              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                  title="Delete from history"
                >
                  <TrashIcon />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
