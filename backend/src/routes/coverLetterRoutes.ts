import express from 'express';
import { generateCoverLetter } from '../controllers/coverLetterController';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// Generate cover letter for a specific job
router.post('/:jobId/generate', authenticateToken, generateCoverLetter);

export default router; 