import express from 'express';
import { body } from 'express-validator';
import { signup, signin, googleAuth } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate-request';

const router = express.Router();

router.post(
  '/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
  ],
  (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    console.log('Signup route hit');
    console.log('Request body:', req.body);
    next();
  },
  validateRequest,
  signup
);

router.post(
  '/signin',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  signin
);

router.post('/google', googleAuth);

export default router; 