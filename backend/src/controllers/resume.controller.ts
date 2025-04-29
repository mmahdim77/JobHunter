import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import fs from 'fs';
import path from 'path';
import { MulterRequest } from '../types/multer';
import { ResumeTailor } from '../../scripts/resume_tailor';
import { uploadFile, deleteFile } from '../utils/cloudinary';

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
      await prisma.resume.updateMany({
        where: { userId, isPrimary: true },
        data: { isPrimary: false }
      });
    }

    const resume = await prisma.resume.create({
      data: {
        title,
        content,
        format,
        isPrimary,
        userId
      }
    });

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

    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: [
        { isPrimary: 'desc' },
        { updatedAt: 'desc' }
      ]
    });

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
    const existingResume = await prisma.resume.findFirst({
      where: { id, userId }
    });

    if (!existingResume) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    // If this is to be the primary resume, unset any existing primary resume
    if (isPrimary) {
      await prisma.resume.updateMany({
        where: { userId, isPrimary: true },
        data: { isPrimary: false }
      });
    }

    const updatedResume = await prisma.resume.update({
      where: { id },
      data: {
        title,
        content,
        format,
        isPrimary
      }
    });

    res.json(updatedResume);
  } catch (error) {
    console.error('Error updating resume:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const resume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    if (resume.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete from Cloudinary if public_id exists
    if (resume.cloudinaryPublicId) {
      await deleteFile(resume.cloudinaryPublicId);
    }

    // Delete from database
    await prisma.resume.delete({
      where: { id },
    });

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ error: 'Failed to delete resume' });
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
    const existingResume = await prisma.resume.findFirst({
      where: { id, userId }
    });

    if (!existingResume) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    // Unset any existing primary resume
    await prisma.resume.updateMany({
      where: { userId, isPrimary: true },
      data: { isPrimary: false }
    });

    // Set the new primary resume
    const updatedResume = await prisma.resume.update({
      where: { id },
      data: { isPrimary: true }
    });

    res.json(updatedResume);
  } catch (error) {
    console.error('Error setting primary resume:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadResume = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Upload file to Cloudinary
    const result = await uploadFile(req.file, 'resumes');

    // Save resume information to database
    const resume = await prisma.resume.create({
      data: {
        fileName: req.file.originalname,
        filePath: result.url,
        cloudinaryPublicId: result.public_id,
        userId: userId,
        isPrimary: false, // Set to true if it's the user's first resume
      },
    });

    // If this is the user's first resume, set it as primary
    const userResumes = await prisma.resume.findMany({
      where: { userId },
    });

    if (userResumes.length === 1) {
      await prisma.resume.update({
        where: { id: resume.id },
        data: { isPrimary: true },
      });
    }

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
    const primaryResume = await prisma.resume.findFirst({
      where: {
        userId,
        isPrimary: true
      }
    });

    if (!primaryResume) {
      res.status(404).json({ error: 'No primary resume found' });
      return;
    }

    // Get the job details
    const job = await prisma.jobPost.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // Get user's API keys
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        openaiApiKey: true,
        grokApiKey: true,
        deepseekApiKey: true,
        geminiApiKey: true
      }
    });

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
      description: job.description,
      jobType: job.jobType,
      companyIndustry: job.companyIndustry
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