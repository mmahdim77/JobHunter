import { Request, Response } from 'express';
import { spawn } from 'child_process';
import { prisma } from '../lib/prisma';
import path from 'path';
import fs from 'fs';

export const generateCoverLetter = async (req: Request, res: Response): Promise<void> => {
    try {
        const { jobId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Get user's primary resume
        const primaryResume = await prisma.resume.findFirst({
            where: {
                userId,
                isPrimary: true
            }
        });

        if (!primaryResume) {
            res.status(400).json({ error: 'No primary resume found' });
            return;
        }

        if (!primaryResume.content) {
            res.status(400).json({ error: 'Primary resume has no content' });
            return;
        }

        // Get job details
        const job = await prisma.jobPost.findUnique({
            where: { id: jobId }
        });

        if (!job) {
            res.status(404).json({ error: 'Job not found' });
            return;
        }

        // Get user's LLM settings or direct API key
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { llmSettings: true }
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Determine which API key to use
        let apiKey: string | undefined;
        let provider = 'openai';
        let model = 'gpt-4-turbo-preview';

        if (user.llmSettings) {
            apiKey = user.llmSettings.apiKey || undefined;
            provider = user.llmSettings.provider;
            model = user.llmSettings.model;
        } else {
            // Fallback to direct API keys
            apiKey = user.openaiApiKey || user.grokApiKey || user.deepseekApiKey || user.geminiApiKey || undefined;
            if (user.grokApiKey) provider = 'groq';
            else if (user.deepseekApiKey) provider = 'deepseek';
            else if (user.geminiApiKey) provider = 'google';
        }

        if (!apiKey) {
            res.status(400).json({ error: 'No API key found. Please configure LLM settings.' });
            return;
        }

        // Prepare job data for the cover letter generator
        const jobData = {
            title: job.title,
            company: job.company,
            description: job.description || '',
            requirements: job.description || '',
            location: {
                country: job.country,
                city: job.city,
                state: job.state
            }
        };

        // Create temporary resume file
        const tempResumeDir = path.join(process.cwd(), 'data', 'temp');
        const tempResumePath = path.join(tempResumeDir, `${primaryResume.id}.tex`);
        
        // Ensure temp directory exists
        if (!fs.existsSync(tempResumeDir)) {
            fs.mkdirSync(tempResumeDir, { recursive: true });
        }

        // Write resume content to temporary file
        fs.writeFileSync(tempResumePath, primaryResume.content);

        // Call the cover letter generator script
        const scriptPath = path.join(process.cwd(), 'scripts', 'cover_letter_generator.py');
        const outputDir = path.join(process.cwd(), 'uploads', 'cover_letters');
        
        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const pythonProcess = spawn('python3', [
            scriptPath,
            '--resume_path', tempResumePath,
            '--job_data', JSON.stringify(jobData),
            '--provider', provider,
            '--model', model,
            '--api_key', apiKey,
            '--output_dir', outputDir
        ]);

        let output = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            error += data.toString();
        });

        pythonProcess.on('close', async (code) => {
            // Clean up temporary resume file
            try {
                fs.unlinkSync(tempResumePath);
            } catch (err) {
                console.error('Error cleaning up temporary resume file:', err);
            }

            if (code !== 0) {
                console.error('Cover letter generation failed:', error);
                res.status(500).json({ error: 'Failed to generate cover letter' });
                return;
            }

            try {
                const result = JSON.parse(output);
                const coverLetterPath = result.cover_letter_path;

                // Save the cover letter record in the database
                const coverLetter = await prisma.coverLetter.create({
                    data: {
                        userId,
                        jobId,
                        filePath: coverLetterPath,
                        fileName: path.basename(coverLetterPath)
                    }
                });

                res.json({
                    success: true,
                    coverLetterId: coverLetter.id,
                    fileName: coverLetter.fileName
                });
            } catch (err) {
                console.error('Error parsing cover letter generator output:', err);
                res.status(500).json({ error: 'Failed to process cover letter' });
            }
        });

    } catch (error) {
        console.error('Error generating cover letter:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}; 