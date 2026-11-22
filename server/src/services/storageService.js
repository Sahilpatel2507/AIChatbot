import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Chat from '../models/Chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'chats.json');

// Ensure local fallback data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readLocalChats() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('[Storage] Error reading fallback chats file:', err.message);
    return [];
  }
}

function writeLocalChats(chats) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(chats, null, 2), 'utf8');
  } catch (err) {
    console.error('[Storage] Error writing fallback chats file:', err.message);
  }
}

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

export const storage = {
  async getAllChats() {
    if (isDbConnected()) {
      return await Chat.find().sort({ updatedAt: -1 }).lean();
    }
    const chats = readLocalChats();
    return chats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  async getChatById(id) {
    if (isDbConnected()) {
      let query = { chatId: id };
      if (mongoose.Types.ObjectId.isValid(id)) {
        query = { $or: [{ chatId: id }, { _id: id }] };
      }
      return await Chat.findOne(query).lean();
    }
    const chats = readLocalChats();
    return chats.find((c) => c.chatId === id || c._id === id) || null;
  },

  async createChat({ chatId, title }) {
    const finalChatId = chatId || `chat_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const finalTitle = title ? title.trim() : 'New Conversation';
    const now = new Date().toISOString();

    if (isDbConnected()) {
      const newChat = new Chat({
        chatId: finalChatId,
        title: finalTitle,
        messages: [],
      });
      const saved = await newChat.save();
      return saved.toObject();
    }

    const chats = readLocalChats();
    const newChat = {
      _id: `local_${Date.now()}`,
      chatId: finalChatId,
      title: finalTitle,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    chats.unshift(newChat);
    writeLocalChats(chats);
    return newChat;
  },

  async deleteChat(id) {
    if (isDbConnected()) {
      let query = { chatId: id };
      if (mongoose.Types.ObjectId.isValid(id)) {
        query = { $or: [{ chatId: id }, { _id: id }] };
      }
      const deleted = await Chat.findOneAndDelete(query).lean();
      return !!deleted;
    }

    const chats = readLocalChats();
    const initialLen = chats.length;
    const filtered = chats.filter((c) => c.chatId !== id && c._id !== id);
    if (filtered.length !== initialLen) {
      writeLocalChats(filtered);
      return true;
    }
    return false;
  },

  async addMessages(id, newMessages, newTitle = null) {
    const now = new Date().toISOString();

    if (isDbConnected()) {
      let query = { chatId: id };
      if (mongoose.Types.ObjectId.isValid(id)) {
        query = { $or: [{ chatId: id }, { _id: id }] };
      }

      const updateData = {
        $push: { messages: { $each: newMessages } },
      };

      if (newTitle) {
        updateData.$set = { title: newTitle };
      }

      const updated = await Chat.findOneAndUpdate(query, updateData, {
        new: true,
        runValidators: true,
      }).lean();

      return updated;
    }

    const chats = readLocalChats();
    const chatIndex = chats.findIndex((c) => c.chatId === id || c._id === id);
    if (chatIndex === -1) {
      return null;
    }

    chats[chatIndex].messages.push(...newMessages);
    if (newTitle) {
      chats[chatIndex].title = newTitle;
    }
    chats[chatIndex].updatedAt = now;
    writeLocalChats(chats);
    return chats[chatIndex];
  },

  async replaceLastAssistantMessage(id, newAssistantMessage) {
    const now = new Date().toISOString();

    if (isDbConnected()) {
      let query = { chatId: id };
      if (mongoose.Types.ObjectId.isValid(id)) {
        query = { $or: [{ chatId: id }, { _id: id }] };
      }
      const chat = await Chat.findOne(query);
      if (!chat) return null;

      const lastAstIndex = [...chat.messages].reverse().findIndex((m) => m.role === 'assistant');
      if (lastAstIndex !== -1) {
        const actualIndex = chat.messages.length - 1 - lastAstIndex;
        chat.messages[actualIndex] = newAssistantMessage;
      } else {
        chat.messages.push(newAssistantMessage);
      }
      const saved = await chat.save();
      return saved.toObject();
    }

    const chats = readLocalChats();
    const chatIndex = chats.findIndex((c) => c.chatId === id || c._id === id);
    if (chatIndex === -1) return null;

    const messages = chats[chatIndex].messages || [];
    const lastAstIndex = [...messages].reverse().findIndex((m) => m.role === 'assistant');
    if (lastAstIndex !== -1) {
      const actualIndex = messages.length - 1 - lastAstIndex;
      messages[actualIndex] = newAssistantMessage;
    } else {
      messages.push(newAssistantMessage);
    }
    chats[chatIndex].updatedAt = now;
    writeLocalChats(chats);
    return chats[chatIndex];
  },
};
