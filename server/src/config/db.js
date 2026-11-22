import mongoose from 'mongoose';

let isDbConnected = false;

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aichatbot';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
    isDbConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isDbConnected = false;
    console.warn(`[Database] MongoDB Connection Warning: ${error.message}`);
    console.warn('[Database] Local fallback store activated. Set MONGODB_URI to connect to MongoDB Atlas or start local mongod.');
  }
};

mongoose.connection.on('connected', () => {
  isDbConnected = true;
  console.log('[Database] Mongoose connected to MongoDB.');
});

mongoose.connection.on('error', (err) => {
  isDbConnected = false;
  console.error(`[Database] Mongoose connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  isDbConnected = false;
  console.warn('[Database] Mongoose disconnected from MongoDB.');
});

export const getDbStatus = () => ({
  isConnected: isDbConnected && mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host || null,
  name: mongoose.connection.name || null,
});
