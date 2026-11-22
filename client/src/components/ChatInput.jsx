import React, { useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import ToneSelector from './ToneSelector.jsx';

export default function ChatInput({
  input,
  setInput,
  onSend,
  isLoading,
  selectedTone,
  onSelectTone,
}) {
  const textareaRef = useRef(null);

  // Auto-resize textarea height as content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSend();
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4 pt-2">
      <div className="relative rounded-2xl bg-navy-850/95 border border-slate-700/80 shadow-2xl shadow-black/50 focus-within:border-indigo-500/70 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
        {/* Multiline Input Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AIChatbot anything... (Press Enter to send, Shift + Enter for new line)"
          rows={1}
          className="w-full bg-transparent text-slate-100 placeholder-slate-400 px-4 pt-3.5 pb-2 text-sm sm:text-base outline-none resize-none max-h-44"
          disabled={isLoading}
        />

        {/* Input Footer Controls */}
        <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-slate-800/60 bg-navy-900/40 rounded-b-2xl">
          <div className="flex items-center gap-2">
            <ToneSelector
              selectedTone={selectedTone}
              onSelectTone={onSelectTone}
              compact={true}
            />
            <span className="hidden sm:inline-block text-[11px] text-slate-400">
              Shift + Enter for new line
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Character count when typing */}
            {input.length > 0 && (
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                {input.length} chars
              </span>
            )}

            {/* Send Button */}
            <button
              type="button"
              onClick={onSend}
              disabled={!input.trim() || isLoading}
              className={`flex items-center justify-center p-2.5 rounded-xl transition-all duration-200 ${
                input.trim() && !isLoading
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/30 hover:brightness-110 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              title="Send message"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Subtle Bottom Disclaimer */}
      <p className="text-center text-[11px] text-slate-400 mt-2">
        AIChatbot UI preview. Responses are generated based on the selected tone.
      </p>
    </div>
  );
}
