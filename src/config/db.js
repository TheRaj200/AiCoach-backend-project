import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn('⚠️ [DB] No MONGODB_URI found in environment. Running in Resilient In-Memory Fallback mode.');
    isConnected = false;
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`✅ [DB] MongoDB Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ [DB] MongoDB Connection Error: ${error.message}`);
    console.warn('⚠️ [DB] Switching automatically to In-Memory Fallback mode so the app continues running.');
    isConnected = false;
    return false;
  }
};

export const isDbConnected = () => isConnected;
