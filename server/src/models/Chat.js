import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      default: () => `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'assistant'],
        message: '{VALUE} is not a valid message role. Allowed roles: user, assistant.',
      },
      required: [true, 'Message role is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content cannot be empty'],
      trim: true,
    },
    tone: {
      type: String,
      enum: ['Professional', 'Casual', 'Concise'],
      default: 'Professional',
    },
    timestamp: {
      type: String,
      default: () =>
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  },
  {
    _id: false,
    timestamps: true,
  }
);

const chatSchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
      required: [true, 'chatId is required'],
      unique: true,
      index: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Chat title is required'],
      trim: true,
      default: 'New Conversation',
    },
    messages: [messageSchema],
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

export const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
