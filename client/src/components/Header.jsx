import React from 'react';
import { Menu, Bot, Sparkles } from 'lucide-react';
import ToneSelector from './ToneSelector.jsx';

export default function Header({
  activeChatTitle,
  selectedTone,
  onSelectTone,
  onOpenMobileSidebar,
}) {
  return (
    <header className="h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between border-b border-slate-800/70 bg-navy-900/60 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-3 overflow-hidden">
        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 truncate">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse hidden sm:block"></div>
          <h2 className="text-sm sm:text-base font-semibold text-slate-200 truncate">
            {activeChatTitle || 'New Conversation'}
          </h2>
        </div>
      </div>

      {/* Tone Selector in Top Bar */}
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden md:inline-block text-xs font-medium text-slate-400">
          Tone:
        </span>
        <ToneSelector selectedTone={selectedTone} onSelectTone={onSelectTone} />
      </div>
    </header>
  );
}
