import { Request } from 'express';
import { Multer } from 'multer';

export interface MulterRequest extends Request {
  file?: Express.Multer.File;
  user?: {
    id: string;
  };
} 