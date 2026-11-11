import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { EmailService } from './services/email.service';
import { corsOptions } from './config/cors';
import { errorHandler } from './middleware/error.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import fileRoutes from './routes/file.routes';
import aiRoutes from './routes/ai.routes';
import executionRoutes from './routes/execution.routes';

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, error: 'Too many requests from this IP, please try again later.' },
});
app.use('/api', limiter);

// Readiness check for Postman and deployment health probes.
app.get('/api/health', (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  const databaseStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][
    mongoose.connection.readyState
  ] || 'unknown';
  res.status(databaseReady ? 200 : 503).json({
    success: databaseReady,
    data: {
      status: databaseReady ? 'healthy' : 'unavailable',
      app: 'CodeMatrix Backend API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: databaseStatus,
      emailConfigured: EmailService.isConfigured,
    },
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/execution', executionRoutes);

// Error Handler
app.use(errorHandler);

export default app;
