import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getDbStatus } from './config/db.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// CORS configuration allowing requests from the frontend client
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, or same-server requests)
      if (!origin || origin === CLIENT_URL || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database initialization
connectDB();

// Root route
app.get('/', (req, res) => {
  res.json({
    project: 'AIChatbot API',
    status: 'Running',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      health: 'GET /api/health',
      chats: 'GET, POST /api/chats',
      chatDetail: 'GET, DELETE /api/chats/:id',
      messages: 'POST /api/chats/:id/messages',
    },
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDbStatus();
  res.status(200).json({
    status: 'ok',
    message: 'AIChatbot backend is running successfully',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    database: {
      connected: dbStatus.isConnected,
      host: dbStatus.host,
      mode: dbStatus.isConnected ? 'MongoDB Active' : 'Fallback Resilient Store Active',
    },
  });
});

// Chat REST API routes
app.use('/api/chats', chatRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint '${req.method} ${req.originalUrl}' not found`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Database Validation Error',
      details: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: `Invalid format for field: ${err.path}`,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Server] AIChatbot server running on http://localhost:${PORT}`);
  });
}

export default app;
