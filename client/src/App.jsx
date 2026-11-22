import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import ChatArea from './components/ChatArea.jsx';
import ChatInput from './components/ChatInput.jsx';
import { chatApi } from './services/api.js';

export default function App() {
  const [conversations, setConversations] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [selectedTone, setSelectedTone] = useState('Professional');
  const [inputMessage, setInputMessage] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [systemNotice, setSystemNotice] = useState(null);

  // Load chat history from backend/MongoDB on mount
  const loadConversations = useCallback(async (selectFirst = true) => {
    try {
      const data = await chatApi.getAllChats();
      const chats = data.chats || [];
      setConversations(chats);

      if (selectFirst && chats.length > 0) {
        const firstChatId = chats[0].chatId || chats[0]._id;
        setActiveChatId(firstChatId);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err.message);
      setSystemNotice('Unable to load chat history. Ensure the backend server is running.');
    }
  }, []);

  useEffect(() => {
    loadConversations(true);
  }, [loadConversations]);

  // Find currently active conversation
  const activeConversation = conversations.find(
    (c) => (c.chatId || c.id || c._id) === activeChatId
  ) || null;

  const messages = activeConversation ? activeConversation.messages || [] : [];

  // 1. New Chat: Clears current active chat & returns to WelcomeScreen
  const handleNewChat = () => {
    setActiveChatId(null);
    setInputMessage('');
    setSystemNotice(null);
  };

  // 2. Select Chat from History
  const handleSelectChat = (id) => {
    setActiveChatId(id);
    setSystemNotice(null);
  };

  // 3. Delete Chat: Calls DELETE /api/chats/:id
  const handleDeleteChat = async (id) => {
    try {
      await chatApi.deleteChat(id);
      const remaining = conversations.filter(
        (c) => (c.chatId || c.id || c._id) !== id
      );
      setConversations(remaining);

      if (activeChatId === id) {
        if (remaining.length > 0) {
          const nextId = remaining[0].chatId || remaining[0]._id;
          setActiveChatId(nextId);
        } else {
          setActiveChatId(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete chat:', err.message);
      setSystemNotice(`Delete failed: ${err.message}`);
    }
  };

  // 4. Suggested Prompts populate the message input
  const handleSelectPrompt = (promptText) => {
    setInputMessage(promptText);
  };

  // 5. Send Message with Real-Time Server-Sent Events (SSE) Streaming
  const handleSendMessage = async () => {
    const trimmed = inputMessage.trim();
    if (!trimmed || isLoading) return;

    setInputMessage('');
    setIsLoading(true);
    setSystemNotice(null);

    const now = new Date();
    const tempUserMsgId = `temp_usr_${Date.now()}`;
    const tempAstMsgId = `temp_ast_${Date.now() + 1}`;

    const tempUserMsg = {
      id: tempUserMsgId,
      role: 'user',
      content: trimmed,
      tone: selectedTone,
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const tempAssistantMsg = {
      id: tempAstMsgId,
      role: 'assistant',
      content: '',
      tone: selectedTone,
      timestamp: 'Typing...',
    };

    try {
      let targetChatId = activeChatId;

      // If in New Chat mode, create conversation first
      if (!targetChatId) {
        const titleSnippet = trimmed.length > 35 ? `${trimmed.substring(0, 35)}...` : trimmed;
        const newChatRes = await chatApi.createChat(titleSnippet);
        const newChat = newChatRes.chat;
        targetChatId = newChat.chatId || newChat._id;

        // Initialize state with optimistic messages
        const initialChat = {
          ...newChat,
          messages: [tempUserMsg, tempAssistantMsg],
        };
        setConversations((prev) => [initialChat, ...prev]);
        setActiveChatId(targetChatId);
      } else {
        // Append user and placeholder assistant message
        setConversations((prev) =>
          prev.map((c) => {
            const currentId = c.chatId || c.id || c._id;
            if (currentId === targetChatId) {
              return {
                ...c,
                messages: [...(c.messages || []), tempUserMsg, tempAssistantMsg],
              };
            }
            return c;
          })
        );
      }

      // Read real-time SSE stream
      await chatApi.streamMessage(
        targetChatId,
        { content: trimmed, tone: selectedTone },
        {
          onToken: (token) => {
            setConversations((prev) =>
              prev.map((c) => {
                const currentId = c.chatId || c.id || c._id;
                if (currentId === targetChatId) {
                  const msgs = [...(c.messages || [])];
                  const astIdx = msgs.findIndex((m) => m.id === tempAstMsgId);
                  if (astIdx !== -1) {
                    msgs[astIdx] = {
                      ...msgs[astIdx],
                      content: (msgs[astIdx].content || '') + token,
                    };
                  }
                  return { ...c, messages: msgs };
                }
                return c;
              })
            );
          },
          onDone: (payload) => {
            if (payload.chat) {
              setConversations((prev) =>
                prev.map((c) =>
                  (c.chatId || c.id || c._id) === targetChatId ? payload.chat : c
                )
              );
            }
            setIsLoading(false);
          },
          onError: (err) => {
            console.error('Streaming error:', err.message);
            setSystemNotice(`Error: ${err.message}`);
            setIsLoading(false);
          },
        }
      );
    } catch (err) {
      console.error('Send message failed:', err.message);
      setSystemNotice(`Failed to send message: ${err.message}`);
      setIsLoading(false);
    }
  };

  // 6. Regenerate Response with Streaming
  const handleRegenerate = async (messageId) => {
    if (!activeChatId || isLoading) return;

    const currentMsgs = activeConversation?.messages || [];
    const lastUserMsg = [...currentMsgs].reverse().find((m) => m.role === 'user');

    if (!lastUserMsg) {
      setSystemNotice('No prior user message found to regenerate.');
      return;
    }

    setIsLoading(true);
    setSystemNotice(null);

    // Clear the last assistant response content in local state to prepare for stream
    setConversations((prev) =>
      prev.map((c) => {
        if ((c.chatId || c.id || c._id) === activeChatId) {
          const msgs = [...(c.messages || [])];
          const lastAstIdx = [...msgs].reverse().findIndex((m) => m.role === 'assistant');
          if (lastAstIdx !== -1) {
            const actualIdx = msgs.length - 1 - lastAstIdx;
            msgs[actualIdx] = {
              ...msgs[actualIdx],
              content: '',
              tone: selectedTone,
              timestamp: 'Regenerating...',
            };
          }
          return { ...c, messages: msgs };
        }
        return c;
      })
    );

    try {
      await chatApi.streamRegenerate(
        activeChatId,
        { tone: selectedTone },
        {
          onToken: (token) => {
            setConversations((prev) =>
              prev.map((c) => {
                if ((c.chatId || c.id || c._id) === activeChatId) {
                  const msgs = [...(c.messages || [])];
                  const lastAstIdx = [...msgs].reverse().findIndex((m) => m.role === 'assistant');
                  if (lastAstIdx !== -1) {
                    const actualIdx = msgs.length - 1 - lastAstIdx;
                    msgs[actualIdx] = {
                      ...msgs[actualIdx],
                      content: (msgs[actualIdx].content || '') + token,
                    };
                  }
                  return { ...c, messages: msgs };
                }
                return c;
              })
            );
          },
          onDone: (payload) => {
            if (payload.chat) {
              setConversations((prev) =>
                prev.map((c) =>
                  (c.chatId || c.id || c._id) === activeChatId ? payload.chat : c
                )
              );
            }
            setIsLoading(false);
          },
          onError: (err) => {
            console.error('Regenerate stream error:', err.message);
            setSystemNotice(`Regenerate failed: ${err.message}`);
            setIsLoading(false);
          },
        }
      );
    } catch (err) {
      console.error('Regenerate failed:', err.message);
      setSystemNotice(`Regenerate failed: ${err.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-navy-950 text-slate-100 overflow-hidden font-sans">
      {/* Background subtle purple/blue radial gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-purple-600/10 blur-[140px] rounded-full" />
        <div className="absolute top-1/2 right-10 w-[350px] h-[350px] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      {/* 1. Left Sidebar */}
      <Sidebar
        conversations={conversations}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10 bg-gradient-to-b from-navy-900/50 via-navy-950/80 to-navy-950">
        {/* Top Header with Tone Selector */}
        <Header
          activeChatTitle={activeConversation ? activeConversation.title : 'New Chat'}
          selectedTone={selectedTone}
          onSelectTone={setSelectedTone}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* 2. Main Chat Area & Welcome Screen */}
        <ChatArea
          messages={messages}
          onSelectPrompt={handleSelectPrompt}
          onRegenerate={handleRegenerate}
          systemNotice={systemNotice}
          selectedTone={selectedTone}
        />

        {/* 3. Message Input Area */}
        <ChatInput
          input={inputMessage}
          setInput={setInputMessage}
          onSend={handleSendMessage}
          isLoading={isLoading}
          selectedTone={selectedTone}
          onSelectTone={setSelectedTone}
        />
      </div>
    </div>
  );
}
