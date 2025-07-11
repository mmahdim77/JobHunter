import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import fs from 'fs';
import path from 'path';
import { MulterRequest } from '../types/multer';
import { ResumeTailor } from '../../scripts/resume_tailor';

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
        where: {
          userId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    // Create a file path for the resume
    const uploadsDir = path.join(process.cwd(), 'uploads', 'resumes');
    fs.mkdirSync(uploadsDir, { recursive: true });
    const fileName = `${title}-${Date.now()}.${format}`;
    const filePath = path.join(uploadsDir, fileName);

    // Write the content to the file
    fs.writeFileSync(filePath, content);

    const resume = await prisma.resume.create({
      data: {
        userId,
        content,
        format,
        isPrimary: isPrimary || false,
        fileName,
        filePath,
      },
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
      where: {
        userId,
      },
      orderBy: [
        { isPrimary: 'desc' },
        { updatedAt: 'desc' },
      ],
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
    const { content, format, isPrimary } = req.body;

    // Check if resume exists and belongs to user
    const existingResume = await prisma.resume.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingResume) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    // If this is to be the primary resume, unset any existing primary resume
    if (isPrimary) {
      await prisma.resume.updateMany({
        where: {
          userId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    // Update the file if content has changed
    if (content) {
      fs.writeFileSync(existingResume.filePath, content);
    }

    const updatedResume = await prisma.resume.update({
      where: {
        id,
      },
      data: {
        content,
        format,
        isPrimary: isPrimary || false,
      },
    });

    res.json(updatedResume);
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
    const existingResume = await prisma.resume.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingResume) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    await prisma.resume.delete({
      where: {
        id,
      },
    });

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
    const existingResume = await prisma.resume.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingResume) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    // Unset any existing primary resume
    await prisma.resume.updateMany({
      where: {
        userId,
        isPrimary: true,
      },
      data: {
        isPrimary: false,
      },
    });

    // Set the new primary resume
    const updatedResume = await prisma.resume.update({
      where: {
        id,
      },
      data: {
        isPrimary: true,
      },
    });

    res.json(updatedResume);
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
    const fileName = req.file.originalname;
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const format = path.extname(fileName).toLowerCase() === '.tex' ? 'latex' : 'text';

    // Create resume record
    const resume = await prisma.resume.create({
      data: {
        userId,
        content: fileContent,
        format,
        isPrimary: false,
        fileName,
        filePath,
      },
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
    const primaryResume = await prisma.resume.findFirst({
      where: {
        userId,
        isPrimary: true,
      },
    });

    if (!primaryResume) {
      res.status(404).json({ error: 'No primary resume found' });
      return;
    }

    // Get the job details
    const job = await prisma.jobPost.findUnique({
      where: {
        id: jobId,
      },
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // Get user's API keys
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        openaiApiKey: true,
        grokApiKey: true,
        deepseekApiKey: true,
        geminiApiKey: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Create a temporary file for the resume content
    const tempDir = path.join(process.cwd(), 'data', 'temp');
    fs.mkdirSync(tempDir, { recursive: true });
    const tempResumePath = path.join(tempDir, `resume_${Date.now()}.tex`);
    
    if (!primaryResume.content) {
      res.status(400).json({ error: 'Primary resume has no content' });
      return;
    }
    
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