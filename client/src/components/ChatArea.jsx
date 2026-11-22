import React, { useEffect, useRef } from 'react';
import WelcomeScreen from './WelcomeScreen.jsx';
import MessageItem from './MessageItem.jsx';
import { Sparkles, Info } from 'lucide-react';

export default function ChatArea({
  messages,
  onSelectPrompt,
  onRegenerate,
  systemNotice,
  selectedTone,
}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, systemNotice]);

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col overflow-y-auto">
        <WelcomeScreen onSelectPrompt={onSelectPrompt} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-2">
      <div className="max-w-4xl mx-auto">
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            onRegenerate={onRegenerate}
          />
        ))}

        {/* Informational Banner when message is posted before backend integration */}
        {systemNotice && (
          <div className="my-4 p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-950/30 backdrop-blur-sm text-indigo-200 text-xs flex items-center gap-2.5 max-w-lg mx-auto">
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{systemNotice}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
