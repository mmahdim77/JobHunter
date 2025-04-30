import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.routes';
import jobRoutes from './routes/job.routes';
import resumeRoutes from './routes/resume.routes';
import apiKeyRoutes from './routes/apiKey.routes';
import coverLetterRoutes from './routes/coverLetterRoutes';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// CORS configuration
const corsOptions = {
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:5001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Request logging middleware
app.use((req: express.Request, _res: express.Response, next: express.NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Debug route registration
console.log('Registering routes...');

// Auth routes
console.log('Mounting auth routes at /auth');
app.use('/auth', authRoutes);

// Job routes
console.log('Mounting job routes at /api/jobs');
app.use('/api/jobs', jobRoutes);

// Resume routes
console.log('Mounting resume routes at /api/resumes');
app.use('/api/resumes', resumeRoutes);

// API key routes
console.log('Mounting API key routes at /api-keys');
app.use('/api-keys', apiKeyRoutes);

// Cover letter routes
console.log('Mounting cover letter routes at /api/cover-letters');
app.use('/api/cover-letters', coverLetterRoutes);

// List all registered routes
console.log('\nRegistered routes:');
app._router.stack.forEach((middleware: any) => {
  if (middleware.route) {
    // Routes registered directly on the app
    console.log(`${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    // Router middleware
    middleware.handle.stack.forEach((handler: any) => {
      if (handler.route) {
        const path = handler.route.path;
        const methods = Object.keys(handler.route.methods);
        console.log(`${methods} ${middleware.regexp} ${path}`);
      }
    });
  }
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  prisma.$disconnect();
  process.exit(0);
}); 