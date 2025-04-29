import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import fs from 'fs';
import path from 'path';
import { MulterRequest } from '../types/multer';
import { ResumeTailor } from '../../scripts/resume_tailor';

interface Resume {
  id: string;
  title: string;
  content: string;
  format: string;
  isPrimary: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface JobPost {
  id: string;
  title: string;
  company: string;
  description: string | null;
  jobType: string | null;
  companyIndustry: string | null;
}

interface UserWithApiKeys {
  openaiApiKey: string | null;
  grokApiKey: string | null;
  deepseekApiKey: string | null;
  geminiApiKey: string | null;
}

export const createResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { title, content, format, isPrimary } = req.body;

    if (!title || !content || !format) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (format !== 'latex' && format !== 'text') {
      res.status(400).json({ error: 'Invalid format. Must be either latex or text' });
      return;
    }

    // If this is to be the primary resume, unset any existing primary resume
    if (isPrimary) {
      await prisma.$executeRaw`
        UPDATE "Resume" 
        SET "isPrimary" = false 
        WHERE "userId" = ${userId} AND "isPrimary" = true
      `;
    }

    const resume = await prisma.$executeRaw`
      INSERT INTO "Resume" ("title", "content", "format", "isPrimary", "userId")
      VALUES (${title}, ${content}, ${format}, ${isPrimary}, ${userId})
      RETURNING *
    `;

    res.status(201).json(resume);
  } catch (error) {
    console.error('Error creating resume:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getResumes = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const resumes = await prisma.$queryRaw<Resume[]>`
      SELECT * FROM "Resume" 
      WHERE "userId" = ${userId}
      ORDER BY "isPrimary" DESC, "updatedAt" DESC
    `;

    res.json(resumes);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { title, content, format, isPrimary } = req.body;

    // Check if resume exists and belongs to user
    const existingResume = await prisma.$queryRaw<Resume[]>`
      SELECT * FROM "Resume" 
      WHERE "id" = ${id} AND "userId" = ${userId}
      LIMIT 1
    `;

    if (!existingResume || existingResume.length === 0) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    // If this is to be the primary resume, unset any existing primary resume
    if (isPrimary) {
      await prisma.$executeRaw`
        UPDATE "Resume" 
        SET "isPrimary" = false 
        WHERE "userId" = ${userId} AND "isPrimary" = true
      `;
    }

    const updatedResume = await prisma.$queryRaw<Resume[]>`
      UPDATE "Resume" 
      SET "title" = ${title}, 
          "content" = ${content}, 
          "format" = ${format}, 
          "isPrimary" = ${isPrimary}
      WHERE "id" = ${id}
      RETURNING *
    `;

    res.json(updatedResume[0]);
  } catch (error) {
    console.error('Error updating resume:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    // Check if resume exists and belongs to user
    const existingResume = await prisma.$queryRaw<Resume[]>`
      SELECT * FROM "Resume" 
      WHERE "id" = ${id} AND "userId" = ${userId}
      LIMIT 1
    `;

    if (!existingResume || existingResume.length === 0) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    await prisma.$executeRaw`
      DELETE FROM "Resume" 
      WHERE "id" = ${id}
    `;

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const setPrimaryResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    // Check if resume exists and belongs to user
    const existingResume = await prisma.$queryRaw<Resume[]>`
      SELECT * FROM "Resume" 
      WHERE "id" = ${id} AND "userId" = ${userId}
      LIMIT 1
    `;

    if (!existingResume || existingResume.length === 0) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    // Unset any existing primary resume
    await prisma.$executeRaw`
      UPDATE "Resume" 
      SET "isPrimary" = false 
      WHERE "userId" = ${userId} AND "isPrimary" = true
    `;

    // Set the new primary resume
    const updatedResume = await prisma.$queryRaw<Resume[]>`
      UPDATE "Resume" 
      SET "isPrimary" = true 
      WHERE "id" = ${id}
      RETURNING *
    `;

    res.json(updatedResume[0]);
  } catch (error) {
    console.error('Error setting primary resume:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadResume = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Create resume record
    const resume = await prisma.resume.create({
      data: {
        title: originalName as string,
        content: fileContent as string,
        format: path.extname(originalName).toLowerCase() === '.tex' ? 'latex' : 'text',
        isPrimary: false,
        userId: userId
      }
    });

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    res.status(201).json(resume);
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
};

export const generateTailoredResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const jobId = req.params.jobId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get the primary resume
    const [primaryResume] = await prisma.$queryRaw<Resume[]>`
      SELECT * FROM "Resume" 
      WHERE "userId" = ${userId} AND "isPrimary" = true
      LIMIT 1
    `;

    if (!primaryResume) {
      res.status(404).json({ error: 'No primary resume found' });
      return;
    }

    // Get the job details
    const [job] = await prisma.$queryRaw<JobPost[]>`
      SELECT * FROM "JobPost" 
      WHERE "id" = ${jobId}
      LIMIT 1
    `;

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // Get user's API keys
    const [user] = await prisma.$queryRaw<UserWithApiKeys[]>`
      SELECT "openaiApiKey", "grokApiKey", "deepseekApiKey", "geminiApiKey"
      FROM "User"
      WHERE "id" = ${userId}
      LIMIT 1
    `;

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Create a temporary file for the resume content
    const tempDir = path.join(process.cwd(), 'data', 'temp');
    fs.mkdirSync(tempDir, { recursive: true });
    const tempResumePath = path.join(tempDir, `resume_${Date.now()}.tex`);
    fs.writeFileSync(tempResumePath, primaryResume.content);

    // Prepare job data for the resume tailor
    const jobData = {
      title: job.title,
      company: job.company,
      description: job.description || '',
      jobType: job.jobType || '',
      companyIndustry: job.companyIndustry || ''
    };

    // Initialize resume tailor
    const tailor = new ResumeTailor();

    // Generate tailored resume
    const outputPath = await tailor.generateTailoredResume(
      jobData,
      'openai', // Default to OpenAI, can be made configurable
      user.openaiApiKey || undefined,
      tempResumePath,
      path.join(process.cwd(), 'uploads', 'tailored')
    );

    // Clean up the temporary file
    fs.unlinkSync(tempResumePath);

    // Return the path to the generated resume
    res.json({
      success: true,
      path: outputPath,
      filename: path.basename(outputPath)
    });
  } catch (error) {
    console.error('Error generating tailored resume:', error);
    res.status(500).json({ error: 'Failed to generate tailored resume' });
  }
}; 