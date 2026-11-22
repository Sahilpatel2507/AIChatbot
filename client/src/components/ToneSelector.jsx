import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Briefcase, Smile, Zap, Check } from 'lucide-react';

const TONE_OPTIONS = [
  {
    id: 'Professional',
    label: 'Professional',
    description: 'Clear, formal, and objective',
    icon: Briefcase,
    color: 'text-indigo-400',
    bg: 'bg-indigo-950/40',
  },
  {
    id: 'Casual',
    label: 'Casual',
    description: 'Friendly, relaxed, and conversational',
    icon: Smile,
    color: 'text-sky-400',
    bg: 'bg-sky-950/40',
  },
  {
    id: 'Concise',
    label: 'Concise',
    description: 'Direct, bulleted, minimal fluff',
    icon: Zap,
    color: 'text-amber-400',
    bg: 'bg-amber-950/40',
  },
];

export default function ToneSelector({ selectedTone, onSelectTone, compact = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentTone = TONE_OPTIONS.find((t) => t.id === selectedTone) || TONE_OPTIONS[0];
  const CurrentIcon = currentTone.icon;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-xl transition-all duration-200 border border-slate-700/60 hover:border-indigo-500/50 bg-navy-850/90 hover:bg-navy-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
          compact ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-xs sm:text-sm shadow-sm'
        }`}
        title="Select AI response tone"
      >
        <span className={`p-1 rounded-md ${currentTone.bg}`}>
          <CurrentIcon className={`w-3.5 h-3.5 ${currentTone.color}`} />
        </span>
        <span className="font-medium text-slate-200">{currentTone.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 sm:bottom-auto sm:top-full sm:mt-2 w-60 rounded-xl bg-navy-850 border border-slate-700/80 shadow-2xl shadow-black/60 py-1.5 z-50 backdrop-blur-md">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
            Response Tone
          </div>
          {TONE_OPTIONS.map((tone) => {
            const Icon = tone.icon;
            const isSelected = tone.id === selectedTone;
            return (
              <button
                key={tone.id}
                type="button"
                onClick={() => {
                  onSelectTone(tone.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-slate-800/60 ${
                  isSelected ? 'bg-indigo-950/40 text-indigo-200' : 'text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`p-1 rounded-md ${tone.bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${tone.color}`} />
                  </span>
                  <div>
                    <div className="font-medium text-slate-200">{tone.label}</div>
                    <div className="text-[10px] text-slate-400">{tone.description}</div>
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
