import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  createResume,
  getResumes,
  updateResume,
  deleteResume,
  setPrimaryResume,
  uploadResume,
  generateTailoredResume
} from '../controllers/resume.controller';
import multer from 'multer';

const router = Router();
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/plain' || file.mimetype === 'application/x-tex') {
      cb(null, true);
    } else {
      cb(new Error('Only .txt and .tex files are allowed'));
    }
  }
});

// All routes require authentication
router.use(authenticateToken);

// Create a new resume
router.post('/', createResume);

// Get all resumes for the current user
router.get('/', getResumes);

// Update a resume
router.put('/:id', updateResume);

// Delete a resume
router.delete('/:id', deleteResume);

// Set a resume as primary
router.post('/:id/primary', setPrimaryResume);

// Add file upload route
router.post('/upload', upload.single('file'), uploadResume);

// Generate tailored resume for a job
router.post('/tailor/:jobId', generateTailoredResume);

export default router; 