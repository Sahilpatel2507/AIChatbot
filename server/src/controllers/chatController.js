import { storage } from '../services/storageService.js';
import { generateAIResponse, streamOpenAIResponse } from '../services/aiService.js';

// POST /api/chats - Create a new conversation
export async function createChat(req, res, next) {
  try {
    const { title, chatId } = req.body || {};

    if (chatId && typeof chatId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'chatId must be a valid string',
      });
    }

    if (chatId) {
      const existing = await storage.getChatById(chatId);
      if (existing) {
        return res.status(409).json({
          success: false,
          error: `A conversation with chatId "${chatId}" already exists`,
        });
      }
    }

    const newChat = await storage.createChat({ chatId, title });
    return res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      chat: newChat,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/chats - Retrieve all conversations
export async function getAllChats(req, res, next) {
  try {
    const chats = await storage.getAllChats();
    return res.status(200).json({
      success: true,
      count: chats.length,
      chats,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/chats/:id - Retrieve a particular conversation
export async function getChatById(req, res, next) {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || !id.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Valid chat ID parameter is required',
      });
    }

    const chat = await storage.getChatById(id.trim());
    if (!chat) {
      return res.status(404).json({
        success: false,
        error: `Conversation with ID "${id}" was not found`,
      });
    }

    return res.status(200).json({
      success: true,
      chat,
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/chats/:id - Delete a conversation
export async function deleteChat(req, res, next) {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || !id.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Valid chat ID parameter is required',
      });
    }

    const success = await storage.deleteChat(id.trim());
    if (!success) {
      return res.status(404).json({
        success: false,
        error: `Conversation with ID "${id}" was not found or already deleted`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully',
      chatId: id.trim(),
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/chats/:id/messages - Save a user message and AI response (Non-streaming)
export async function addMessage(req, res, next) {
  try {
    const { id } = req.params;
    const { content, tone = 'Professional', assistantContent } = req.body || {};

    if (!id || typeof id !== 'string' || !id.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Valid chat ID parameter is required',
      });
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required and cannot be empty',
      });
    }

    const validTones = ['Professional', 'Casual', 'Concise'];
    const activeTone = validTones.includes(tone) ? tone : 'Professional';

    const chat = await storage.getChatById(id.trim());
    if (!chat) {
      return res.status(404).json({
        success: false,
        error: `Conversation with ID "${id}" was not found`,
      });
    }

    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage = {
      id: `msg_usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      role: 'user',
      content: content.trim(),
      tone: activeTone,
      timestamp,
      createdAt: now.toISOString(),
    };

    let aiResponseText = assistantContent;
    if (!aiResponseText || typeof aiResponseText !== 'string' || !aiResponseText.trim()) {
      aiResponseText = await generateAIResponse(content.trim(), activeTone, chat.messages || []);
    }

    const assistantMessage = {
      id: `msg_ast_${Date.now() + 1}_${Math.random().toString(36).substring(2, 7)}`,
      role: 'assistant',
      content: aiResponseText.trim(),
      tone: activeTone,
      timestamp,
      createdAt: new Date(Date.now() + 10).toISOString(),
    };

    let updatedTitle = null;
    if (chat.title === 'New Conversation' || chat.messages.length === 0) {
      const trimmed = content.trim();
      updatedTitle = trimmed.length > 35 ? `${trimmed.substring(0, 35)}...` : trimmed;
    }

    const updatedChat = await storage.addMessages(
      id.trim(),
      [userMessage, assistantMessage],
      updatedTitle
    );

    return res.status(201).json({
      success: true,
      message: 'User message and AI response saved successfully',
      userMessage,
      assistantMessage,
      chat: updatedChat,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/chats/:id/messages/stream - Server-Sent Events (SSE) Streaming
export async function streamMessage(req, res, next) {
  try {
    const { id } = req.params;
    const { content, tone = 'Professional' } = req.body || {};

    if (!id || typeof id !== 'string' || !id.trim()) {
      return res.status(400).json({ success: false, error: 'Valid chat ID is required' });
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Message content cannot be empty' });
    }

    const validTones = ['Professional', 'Casual', 'Concise'];
    const activeTone = validTones.includes(tone) ? tone : 'Professional';

    const chat = await storage.getChatById(id.trim());
    if (!chat) {
      return res.status(404).json({ success: false, error: `Conversation with ID "${id}" was not found` });
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. User message
    const userMessage = {
      id: `msg_usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      role: 'user',
      content: content.trim(),
      tone: activeTone,
      timestamp,
      createdAt: now.toISOString(),
    };

    res.write(`data: ${JSON.stringify({ type: 'user_message', userMessage })}\n\n`);

    // 2. Stream tokens from OpenAI / tone-aware service
    let accumulatedText = '';
    try {
      accumulatedText = await streamOpenAIResponse({
        content: content.trim(),
        tone: activeTone,
        chatHistory: chat.messages || [],
        onToken: (token) => {
          res.write(`data: ${JSON.stringify({ type: 'token', token })}\n\n`);
        },
      });
    } catch (streamErr) {
      console.error('[Stream Error]:', streamErr.message);
      const errMsg = `[Error generating response: ${streamErr.message}]`;
      accumulatedText = errMsg;
      res.write(`data: ${JSON.stringify({ type: 'token', token: errMsg })}\n\n`);
    }

    // 3. Assistant message
    const assistantMessage = {
      id: `msg_ast_${Date.now() + 1}_${Math.random().toString(36).substring(2, 7)}`,
      role: 'assistant',
      content: accumulatedText,
      tone: activeTone,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
    };

    // 4. Update title if needed
    let updatedTitle = null;
    if (chat.title === 'New Conversation' || chat.messages.length === 0) {
      const trimmed = content.trim();
      updatedTitle = trimmed.length > 35 ? `${trimmed.substring(0, 35)}...` : trimmed;
    }

    // 5. Save both messages to MongoDB
    const updatedChat = await storage.addMessages(
      id.trim(),
      [userMessage, assistantMessage],
      updatedTitle
    );

    // 6. Signal completion
    res.write(
      `data: ${JSON.stringify({
        type: 'done',
        done: true,
        userMessage,
        assistantMessage,
        chat: updatedChat,
      })}\n\n`
    );
    res.end();
  } catch (error) {
    if (!res.headersSent) {
      next(error);
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
      res.end();
    }
  }
}

// POST /api/chats/:id/regenerate - Stream-regenerate last AI response with selected tone
export async function regenerateMessage(req, res, next) {
  try {
    const { id } = req.params;
    const { tone = 'Professional' } = req.body || {};

    if (!id || typeof id !== 'string' || !id.trim()) {
      return res.status(400).json({ success: false, error: 'Valid chat ID is required' });
    }

    const validTones = ['Professional', 'Casual', 'Concise'];
    const activeTone = validTones.includes(tone) ? tone : 'Professional';

    const chat = await storage.getChatById(id.trim());
    if (!chat || !chat.messages || chat.messages.length === 0) {
      return res.status(404).json({ success: false, error: 'No prior messages in conversation to regenerate' });
    }

    // Find the last user prompt in the conversation
    const lastUserMsg = [...chat.messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg) {
      return res.status(400).json({ success: false, error: 'No previous user prompt found to regenerate' });
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    let accumulatedText = '';
    try {
      accumulatedText = await streamOpenAIResponse({
        content: lastUserMsg.content,
        tone: activeTone,
        chatHistory: chat.messages.slice(0, -1),
        onToken: (token) => {
          res.write(`data: ${JSON.stringify({ type: 'token', token })}\n\n`);
        },
      });
    } catch (err) {
      const errMsg = `[Error regenerating response: ${err.message}]`;
      accumulatedText = errMsg;
      res.write(`data: ${JSON.stringify({ type: 'token', token: errMsg })}\n\n`);
    }

    const newAssistantMessage = {
      id: `msg_ast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      role: 'assistant',
      content: accumulatedText,
      tone: activeTone,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
    };

    // Update last assistant message in MongoDB
    const updatedChat = await storage.replaceLastAssistantMessage(id.trim(), newAssistantMessage);

    res.write(
      `data: ${JSON.stringify({
        type: 'done',
        done: true,
        assistantMessage: newAssistantMessage,
        chat: updatedChat,
      })}\n\n`
    );
    res.end();
  } catch (error) {
    if (!res.headersSent) {
      next(error);
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
      res.end();
    }
  }
}
