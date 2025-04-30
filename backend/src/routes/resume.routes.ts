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
import path from 'path';
import fs from 'fs';

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['.txt', '.tex'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .txt and .tex files are allowed'));
    }
  }
});

// All routes require authentication
router.use(authenticateToken);

// Get all resumes
router.get('/', getResumes);

// Create a new resume
router.post('/', createResume);

// Update a resume
router.put('/:id', updateResume);

// Delete a resume
router.delete('/:id', deleteResume);

// Set a resume as primary
router.post('/:id/primary', setPrimaryResume);

// Upload a resume file
router.post('/upload', upload.single('file'), uploadResume);

// Generate a tailored resume
router.post('/tailor/:jobId', generateTailoredResume);

export default router; 