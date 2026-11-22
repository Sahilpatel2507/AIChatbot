import express from 'express';
import {
  createChat,
  getAllChats,
  getChatById,
  deleteChat,
  addMessage,
  streamMessage,
  regenerateMessage,
} from '../controllers/chatController.js';

const router = express.Router();

// REST API routes for conversations
router.post('/', createChat);
router.get('/', getAllChats);
router.get('/:id', getChatById);
router.delete('/:id', deleteChat);
router.post('/:id/messages', addMessage);

// Real-time Server-Sent Events (SSE) streaming endpoints
router.post('/:id/messages/stream', streamMessage);
router.post('/:id/regenerate', regenerateMessage);

export default router;
