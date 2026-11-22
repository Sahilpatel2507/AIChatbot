import React from 'react';
import { Bot, Sparkles, Code2, PenTool, Lightbulb, Compass, ArrowUpRight } from 'lucide-react';

const SUGGESTED_PROMPTS = [
  {
    icon: Code2,
    title: 'Explain React Server Components',
    description: 'Compare RSC vs standard client components with examples',
    prompt: 'Explain the difference between React Server Components and standard Client Components, highlighting their benefits and usage scenarios.',
    gradient: 'from-cyan-500/20 to-blue-500/10 hover:border-cyan-500/40',
    iconColor: 'text-cyan-400',
  },
  {
    icon: PenTool,
    title: 'Draft a Follow-up Email',
    description: 'Professional follow-up note after a client presentation',
    prompt: 'Draft a polite, professional follow-up email after a client software demo presentation, summarizing next steps and action items.',
    gradient: 'from-purple-500/20 to-indigo-500/10 hover:border-purple-500/40',
    iconColor: 'text-purple-400',
  },
  {
    icon: Lightbulb,
    title: 'Express Rate-Limiting Middleware',
    description: 'Create scalable API middleware in Node.js & Express',
    prompt: 'Show me how to build a robust Express.js rate-limiting middleware using Redis and Express rate limit best practices.',
    gradient: 'from-emerald-500/20 to-teal-500/10 hover:border-emerald-500/40',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Compass,
    title: 'Microservices Architecture',
    description: 'Key trade-offs and transition strategies from monolith',
    prompt: 'Summarize the core trade-offs of microservices architecture compared to a modular monolith, and when to adopt microservices.',
    gradient: 'from-amber-500/20 to-orange-500/10 hover:border-amber-500/40',
    iconColor: 'text-amber-400',
  },
];

export default function WelcomeScreen({ onSelectPrompt }) {
  return (
    <div className="max-w-3xl w-full mx-auto px-4 py-8 flex flex-col items-center justify-center text-center my-auto">
      {/* Decorative Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/40 text-indigo-300 text-xs font-medium mb-6 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span>Next-Generation AI Assistant</span>
      </div>

      {/* Main Welcome Heading */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300 mb-3">
        How can I help you today?
      </h1>

      {/* Short Welcome Description */}
      <p className="text-slate-400 text-sm sm:text-base max-w-lg mb-8 leading-relaxed">
        Choose a conversation tone, pick a suggested prompt below, or type your message to start chatting with AIChatbot.
      </p>

      {/* Suggested Prompt Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left">
        {SUGESTED_PROMPTS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(item.prompt)}
              className={`group p-4 rounded-2xl border border-slate-800/80 bg-navy-850/60 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-950/30 bg-gradient-to-br ${item.gradient} flex flex-col justify-between`}
            >
              <div className="flex items-start justify-between w-full mb-2">
                <div className={`p-2 rounded-xl bg-slate-900/60 ${item.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-300 transition-colors" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 text-sm mb-1 group-hover:text-indigo-200 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
const SUGESTED_PROMPTS = SUGGESTED_PROMPTS;
