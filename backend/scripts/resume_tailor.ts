import { spawn } from 'child_process';
import path from 'path';

interface JobData {
  title: string;
  company: string;
  description?: string | null;
  jobType?: string | null;
  companyIndustry?: string | null;
}

export class ResumeTailor {
  private pythonScript: string;

  constructor() {
    this.pythonScript = path.join(__dirname, 'resume_tailor.py');
  }

  async generateTailoredResume(
    jobData: JobData,
    llmProvider: string,
    apiKey: string | undefined,
    primaryResumePath: string,
    outputDir: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python3', [
        this.pythonScript,
        '--job-data', JSON.stringify(jobData),
        '--llm-provider', llmProvider,
        '--api-key', apiKey || '',
        '--primary-resume', primaryResumePath,
        '--output-dir', outputDir
      ]);

      let outputData = '';
      let errorData = '';

      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python script failed with error: ${errorData}`));
          return;
        }

        try {
          const result = JSON.parse(outputData);
          resolve(result.output_path);
        } catch (error) {
          reject(new Error(`Failed to parse Python script output: ${error}`));
        }
      });
    });
  }
} 