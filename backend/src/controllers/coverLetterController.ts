import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import fs from 'fs';
import path from 'path';
import { CoverLetterGenerator } from '../../scripts/cover_letter_generator';

export const generateCoverLetter = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const jobId = req.params.jobId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
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

    // Get the primary resume
    const primaryResume = await prisma.resume.findFirst({
      where: {
        userId,
        isPrimary: true
      }
    });

    if (!primaryResume || !primaryResume.content) {
      res.status(404).json({ error: 'No primary resume found or resume has no content' });
      return;
    }

    // Get user's API keys
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        llmSettings: true
      }
    });

    if (!user || !user.llmSettings) {
      res.status(404).json({ error: 'User or LLM settings not found' });
      return;
    }

    // Create temporary directory for resume content
    const tempDir = path.join(process.cwd(), 'data', 'temp');
    fs.mkdirSync(tempDir, { recursive: true });
    const tempResumePath = path.join(tempDir, `resume_${Date.now()}.${primaryResume.format}`);

    // Write resume content to temporary file
    if (primaryResume.content) {
      fs.writeFileSync(tempResumePath, primaryResume.content);
    }

    // Initialize cover letter generator
    const generator = new CoverLetterGenerator();

    // Generate cover letter
    const { filePath, fileName } = await generator.generateTailoredCoverLetter(
      {
        title: job.title,
        company: job.company,
        description: job.description || '',
        jobType: job.jobType || '',
        companyIndustry: job.companyIndustry || ''
      },
      tempResumePath,
      user.llmSettings.provider,
      user.llmSettings.apiKey || undefined
    );

    // Clean up temporary file
    fs.unlinkSync(tempResumePath);

    // Save cover letter to database
    const coverLetter = await prisma.coverLetter.create({
      data: {
        filePath,
        fileName,
        userId,
        jobId
      }
    });

    res.json({
      success: true,
      coverLetter
    });
  } catch (error) {
    console.error('Error generating cover letter:', error);
    res.status(500).json({ error: 'Failed to generate cover letter' });
  }
}; 