import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

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
      where: { userId, isPrimary: true }
    });
    if (!primaryResume || !primaryResume.content) {
      res.status(404).json({ error: 'No primary resume found or resume has no content' });
      return;
    }

    // Get user's LLM settings
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { llmSettings: true }
    });
    if (!user || !user.llmSettings) {
      res.status(404).json({ error: 'User or LLM settings not found' });
      return;
    }

    // Write resume content to a temp file
    const tempDir = path.join(process.cwd(), 'data', 'temp');
    fs.mkdirSync(tempDir, { recursive: true });
    const tempResumePath = path.join(tempDir, `resume_${Date.now()}.${primaryResume.format}`);
    fs.writeFileSync(tempResumePath, primaryResume.content);

    // Prepare job data as JSON string
    const jobData = {
      title: job.title,
      company: job.company,
      description: job.description || '',
      jobType: job.jobType || '',
      companyIndustry: job.companyIndustry || ''
    };
    const jobDataStr = JSON.stringify(jobData);

    // Prepare arguments for the Python script
    const scriptPath = path.join(process.cwd(), 'scripts', 'cover_letter_generator.py');
    const outputDir = path.join(process.cwd(), 'uploads', 'cover_letters');
    fs.mkdirSync(outputDir, { recursive: true });

    const args = [
      scriptPath,
      '--resume_path', tempResumePath,
      '--job_data', jobDataStr,
      '--provider', user.llmSettings.provider,
      '--api_key', user.llmSettings.apiKey || '',
      '--output_dir', outputDir
    ];

    const pythonProcess = spawn('python3', args);
    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    pythonProcess.on('close', async (code) => {
      fs.unlinkSync(tempResumePath);
      if (code !== 0) {
        console.error('Python script error:', stderr);
        res.status(500).json({ error: 'Python script failed', details: stderr });
        return;
      }
      try {
        const result = JSON.parse(stdout);
        // Save the cover letter record in the database
        const coverLetter = await prisma.coverLetter.create({
          data: {
            filePath: result.cover_letter_path,
            fileName: path.basename(result.cover_letter_path),
            userId,
            jobId
          }
        });
        res.json({ success: true, coverLetter });
      } catch (err) {
        console.error('Error parsing Python output:', err, stdout);
        res.status(500).json({ error: 'Failed to parse Python output', details: stdout });
      }
    });
  } catch (error) {
    console.error('Error generating cover letter:', error);
    res.status(500).json({ error: 'Failed to generate cover letter' });
  }
}; 