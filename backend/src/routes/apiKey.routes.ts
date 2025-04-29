import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { getApiKeys, updateApiKeys } from '../controllers/apiKey.controller';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get API keys
router.get('/', getApiKeys);

// Update API keys
router.put('/', updateApiKeys);

export default router; 