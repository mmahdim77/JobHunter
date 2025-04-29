const { spawn } = require('child_process');
const path = require('path');

class ResumeTailor {
  constructor() {
    this.pythonScript = path.join(__dirname, 'resume_tailor.py');
    // Get the path to the virtual environment's Python interpreter
    this.pythonPath = path.join(__dirname, '..', 'venv', 'bin', 'python');
  }

  async generateTailoredResume(jobData, llmProvider, apiKey, primaryResumePath, outputDir) {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(this.pythonPath, [
        this.pythonScript,
        '--job-data', JSON.stringify(jobData),
        '--llm-provider', llmProvider,
        '--api-key', apiKey || '',
        '--primary-resume', primaryResumePath,
        '--output-dir', outputDir
      ], {
        env: {
          ...process.env,
          PYTHONPATH: path.join(__dirname, '..')
        }
      });

      let outputData = '';
      let errorData = '';

      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString();
        console.log('Python stdout:', data.toString());
      });

      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
        console.error('Python stderr:', data.toString());
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
          reject(new Error(`Failed to parse Python script output: ${error.message}`));
        }
      });
    });
  }
}

module.exports = { ResumeTailor }; 