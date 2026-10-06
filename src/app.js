import express from 'express';
import cors from 'cors';
import interviewRoutes from './routes/interviewRoutes.js';
import authRoutes from './routes/authRoutes.js';

export const createApp = () => {
  const app = express();

  // Production-ready CORS setup
  const allowedOrigins = process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim())
    : '*';

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Render & Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'AiCoach Backend API',
    });
  });

  // Base API route
  app.get('/', (req, res) => {
    res.status(200).json({
      message: 'AiCoach AI Mock Interview API is running smoothly 🚀',
      endpoints: {
        health: '/health',
        auth: '/api/auth',
        interview: '/api/interview',
      },
    });
  });

  // Mount Feature Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/interview', interviewRoutes);

  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // Global Error Handler
  app.use((err, req, res, next) => {
    console.error('[Server Error]:', err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal Server Error',
    });
  });

  return app;
};
