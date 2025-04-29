import express from 'express';
import { searchJobs, getUserJobs } from '../controllers/job.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// Search and save jobs
router.post('/search', authenticateToken, searchJobs);

// Get user's saved jobs
router.get('/my-jobs', authenticateToken, getUserJobs);

export default router; 