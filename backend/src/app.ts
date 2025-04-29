import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import coverLetterRoutes from './routes/coverLetterRoutes';
import jobRoutes from './routes/job.routes';
import resumeRoutes from './routes/resume.routes';
import authRoutes from './routes/auth.routes';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/cover-letters', coverLetterRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default app; 