import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { spawn } from 'child_process';
import path from 'path';

const prisma = new PrismaClient();

export const searchJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { search_term, location, results_wanted } = req.body;
    
    if (!search_term || !location) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    // Run the Python script
    const pythonProcess = spawn('python3', [
      path.join(__dirname, '../../scripts/scrape_jobs.py'),
      search_term,
      location,
      (results_wanted || 20).toString()
    ]);

    let scriptOutput = '';
    let scriptError = '';

    // Collect data from stdout
    pythonProcess.stdout.on('data', (data) => {
      scriptOutput += data.toString();
    });

    // Collect data from stderr
    pythonProcess.stderr.on('data', (data) => {
      scriptError += data.toString();
      console.error('Python script error:', scriptError);
    });

    // Handle process completion
    pythonProcess.on('close', async (code) => {
      if (code !== 0) {
        console.error('Python script error:', scriptError);
        res.status(500).json({ error: 'Failed to process job data' });
        return;
      }

      try {
        // Parse the job data
        const jobData = JSON.parse(scriptOutput);
        
        // Save jobs to database
        const savedJobs = await Promise.all(
          jobData.map(async (job: any) => {
            try {
              return await prisma.jobPost.create({
                data: {
                  title: job.title || '',
                  company: job.company || '',
                  companyUrl: job.companyUrl || null,
                  jobUrl: job.jobUrl || '',
                  country: job.location?.country || null,
                  city: job.location?.city || null,
                  state: job.location?.state || null,
                  isRemote: job.isRemote || false,
                  description: job.description || '',
                  jobType: job.jobType || '',
                  salaryInterval: job.salary?.interval || null,
                  salaryMinAmount: job.salary?.minAmount || null,
                  salaryMaxAmount: job.salary?.maxAmount || null,
                  salaryCurrency: job.salary?.currency || null,
                  datePosted: job.datePosted ? new Date(job.datePosted) : new Date(),
                  companyIndustry: job.companyIndustry || null,
                  companyLogo: job.companyLogo || null,
                  userId: userId // Use userId directly instead of connect
                }
              });
            } catch (error) {
              console.error('Error saving job:', error);
              return null;
            }
          })
        );

        // Filter out any null values from failed saves
        const successfulJobs = savedJobs.filter(job => job !== null);
        
        res.json(successfulJobs);
      } catch (error) {
        console.error('Error processing jobs:', error);
        res.status(500).json({ error: 'Failed to process job data' });
      }
    });

  } catch (error) {
    console.error('Error in searchJobs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const jobs = await prisma.jobPost.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(jobs);
  } catch (error) {
    console.error('Error in getUserJobs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 