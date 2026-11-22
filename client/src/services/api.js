/**
 * API service connecting AIChatbot frontend with Express backend.
 * Supports standard REST endpoints and Server-Sent Events (SSE) streaming.
 */
const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.error || `HTTP ${res.status}: ${res.statusText}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, error.message);
    throw error;
  }
}

/**
 * Handles reading an SSE stream from a fetch Response.
 */
async function readSseStream(response, { onToken, onUserMessage, onDone, onError }) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep trailing incomplete chunk

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const dataStr = trimmed.slice(6).trim();
        if (!dataStr) continue;

        try {
          const payload = JSON.parse(dataStr);
          if (payload.type === 'token' && onToken) {
            onToken(payload.token);
          } else if (payload.type === 'user_message' && onUserMessage) {
            onUserMessage(payload.userMessage);
          } else if (payload.type === 'done' && onDone) {
            onDone(payload);
          } else if (payload.type === 'error' && onError) {
            onError(new Error(payload.error));
          }
        } catch (jsonErr) {
          console.warn('[SSE Parse Warning]:', jsonErr.message, dataStr);
        }
      }
    }
  } catch (err) {
    if (onError) onError(err);
    throw err;
  }
}

export const chatApi = {
  // GET /api/chats - Retrieve all conversations
  async getAllChats() {
    return request('/chats');
  },

  // GET /api/chats/:id - Retrieve a particular conversation
  async getChatById(id) {
    return request(`/chats/${id}`);
  },

  // POST /api/chats - Create a new conversation
  async createChat(title) {
    return request('/chats', {
      method: 'POST',
      body: JSON.stringify(title ? { title } : {}),
    });
  },

  // DELETE /api/chats/:id - Delete a conversation
  async deleteChat(id) {
    return request(`/chats/${id}`, {
      method: 'DELETE',
    });
  },

  // POST /api/chats/:id/messages - Non-streaming save
  async sendMessage(chatId, { content, tone, assistantContent }) {
    return request(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, tone, assistantContent }),
    });
  },

  // POST /api/chats/:id/messages/stream - Server-Sent Events (SSE) Streaming
  async streamMessage(chatId, { content, tone }, callbacks = {}) {
    const response = await fetch(`${API_BASE}/chats/${chatId}/messages/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, tone }),
    });
    return readSseStream(response, callbacks);
  },

  // POST /api/chats/:id/regenerate - Stream-regenerate last AI response
  async streamRegenerate(chatId, { tone }, callbacks = {}) {
    const response = await fetch(`${API_BASE}/chats/${chatId}/regenerate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tone }),
    });
    return readSseStream(response, callbacks);
  },

  // GET /api/health - Check server and DB status
  async checkHealth() {
    return request('/health');
  },
};

export default chatApi;
