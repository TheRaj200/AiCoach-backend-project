import 'dotenv/config';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Connect to Database (MongoDB Atlas with graceful fallback)
  await connectDB();

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`🚀 [Server] AiCoach Server running on port ${PORT}`);
    console.log(`📡 [Endpoints] Health Check: http://localhost:${PORT}/health`);
    console.log(`🧠 [Endpoints] Interview API: http://localhost:${PORT}/api/interview`);
  });
}

startServer();
