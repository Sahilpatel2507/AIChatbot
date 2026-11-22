import React, { useState } from 'react';
import { Bot, User, Copy, Check, RotateCcw, Sparkles } from 'lucide-react';

export default function MessageItem({ message, onRegenerate }) {
  const [copied, setCopied] = useState(false);
  const isAI = message.role === 'assistant';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  if (!isAI) {
    // User Message (Right Side)
    return (
      <div className="flex justify-end items-end gap-2.5 mb-6 pl-10">
        <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%]">
          <div className="px-4 py-3 rounded-2xl rounded-br-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-950/30 text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap">
            {message.content}
          </div>
          <div className="flex items-center gap-2 mt-1.5 px-1 text-[11px] text-slate-400">
            {message.tone && (
              <span className="px-2 py-0.5 rounded-full bg-slate-800/80 text-indigo-300 border border-indigo-500/20 font-medium">
                Tone: {message.tone}
              </span>
            )}
            <span>{message.timestamp || 'Just now'}</span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm">
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
    );
  }

  // AI Response (Left Side)
  return (
    <div className="flex justify-start items-start gap-3 mb-6 pr-10">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-600 to-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20 mt-1">
        <Bot className="w-4 h-4 text-white" />
      </div>

      <div className="flex flex-col items-start max-w-[90%] sm:max-w-[80%]">
        <div className="relative group p-4 sm:p-5 rounded-2xl rounded-tl-sm bg-navy-850/90 border border-slate-700/60 shadow-lg shadow-black/30 text-slate-100 text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap">
          {message.content}

          {/* Action toolbar inside AI card */}
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-800/80">
            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                copied
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
              title="Copy response to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* Regenerate Button */}
            <button
              type="button"
              onClick={() => onRegenerate && onRegenerate(message.id)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all border border-transparent"
              title="Regenerate this response"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>

            {message.tone && (
              <span className="ml-auto px-2 py-0.5 rounded-full bg-slate-900/80 text-[10px] text-slate-400 border border-slate-800 font-medium">
                {message.tone}
              </span>
            )}
          </div>
        </div>

        <span className="mt-1.5 px-1 text-[11px] text-slate-400">
          AIChatbot • {message.timestamp || 'Just now'}
        </span>
      </div>
    </div>
  );
}
