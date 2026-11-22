import React from 'react';
import {
  Bot,
  Plus,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  X,
  Sparkles,
  Info,
} from 'lucide-react';

export default function Sidebar({
  conversations,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) {
  const sidebarContent = (
    <div className="flex flex-col h-full bg-navy-900 border-r border-slate-800/80 text-slate-200 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
                AIChatbot
              </span>
              <span className="text-[10px] text-indigo-400/80 font-medium tracking-wider uppercase">
                v1.0 • React & Vite
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <PanelLeft className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          title="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          type="button"
          onClick={() => {
            onNewChat();
            if (isMobileOpen) onCloseMobile();
          }}
          className={`w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 shadow-md ${
            isCollapsed
              ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:brightness-110 p-2.5'
              : 'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white shadow-indigo-600/20'
          }`}
          title="Start a new conversation"
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Chat History Section */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
        {!isCollapsed && (
          <div className="px-3 pt-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Chat History</span>
            <span className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded-md">
              {conversations.length}
            </span>
          </div>
        )}

        {conversations.length === 0 ? (
          !isCollapsed && (
            <div className="px-3 py-6 text-center text-xs text-slate-400 space-y-1">
              <MessageSquare className="w-6 h-6 mx-auto text-slate-600 mb-1" />
              <p>No previous chats</p>
              <p className="text-[11px] text-slate-400">Start a new conversation</p>
            </div>
          )
        ) : (
          conversations.map((chat) => {
            const chatId = chat.chatId || chat.id || chat._id;
            const isActive = chatId === activeChatId;
            return (
              <div
                key={chatId}
                onClick={() => {
                  onSelectChat(chatId);
                  if (isMobileOpen) onCloseMobile();
                }}
                className={`group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm cursor-pointer transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-950/80 to-navy-800 text-white font-medium border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
                title={chat.title}
              >
                <MessageSquare
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />

                {!isCollapsed && (
                  <>
                    <span className="truncate flex-1 text-left">{chat.title}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chatId);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-all"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800/60 bg-navy-950/40 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="font-medium text-slate-300">AIChatbot UI</span>
          </div>
          <span className="text-[10px] bg-indigo-950/60 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono">
            React + Vite
          </span>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block h-screen transition-all duration-300 ease-in-out shrink-0 z-20 ${
          isCollapsed ? 'w-16' : 'w-64 xl:w-72'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 w-72 max-w-[85vw] z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
