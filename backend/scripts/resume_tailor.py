import os
import sys
from typing import Dict, Any, Optional
from pathlib import Path
import json
from datetime import datetime
import argparse

# Add the scripts directory to the Python path
script_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(script_dir)

from llm_service import generate_text

class resume_tailor:
    def __init__(self):
        self.temp_dir = 'data/temp'
        self.output_dir = "uploads/tailored"
        os.makedirs(self.temp_dir, exist_ok=True)
        os.makedirs(self.output_dir, exist_ok=True)

    def read_resume_base(self, resume_path: str) -> str:
        """
        Read the base resume LaTeX file.
        
        Args:
            resume_path: Path to the base resume LaTeX file
            
        Returns:
            Content of the resume file as string
        """
        with open(resume_path, 'r') as f:
            return f.read()

    def create_tailoring_prompt(self, job_data: Dict[str, Any], resume_content: str) -> str:
        """
        Create a comprehensive prompt for the LLM to tailor the resume.
        
        Args:
            job_data: Dictionary containing job details
            resume_content: Content of the base resume
            
        Returns:
            A detailed prompt for the LLM
        """
        # Extract relevant job information
        job_title = job_data.get('title', '')
        company = job_data.get('company', '')
        job_description = job_data.get('description', '')
        required_skills = job_data.get('skills', '')
        experience_range = job_data.get('experience_range', '')
        job_level = job_data.get('job_level', '')
        
        prompt = f"""You are an expert resume writer and career consultant. Your task is to tailor the following resume for the position of {job_title} at {company}.

Job Details:
- Position: {job_title}
- Company: {company}
- Required Experience: {experience_range}
- Job Level: {job_level}
- Required Skills: {required_skills}
- Job Description: {job_description}

Base Resume:
{resume_content}

Instructions:
1. Analyze the job requirements and the base resume carefully.
2. Tailor the resume to highlight relevant skills, experiences, and achievements that match the job requirements.
3. Maintain the original LaTeX formatting and structure.
4. Only modify content, not the LaTeX commands or document structure.
5. Ensure all modifications are realistic and based on the information in the base resume.
6. Focus on achievements and experiences that demonstrate the required skills.
7. Use action verbs and quantifiable results where possible.
8. Keep the same sections as the original resume but adjust the content within them.
9. Do not add any new sections but you can remove a section or entry if it is completely irrelevant.
10. Ensure the tailored resume maintains a professional tone and format.
11. Ensure the resume fits in one page

Please provide the tailored resume in LaTeX format, maintaining all the original LaTeX commands and structure while updating the content to better match the job requirements."""

        return prompt

    def tailor_resume(
        self,
        resume_path: str,
        job_data: Dict[str, Any],
        provider: str = "openai",
        model: str = "gpt-4-turbo-preview",
        api_key: Optional[str] = None,
        **kwargs
    ) -> str:
        """
        Tailor a resume for a specific job using LLM.
        
        Args:
            resume_path: Path to the base resume LaTeX file
            job_data: Dictionary containing job details
            provider: LLM provider to use ('openai', 'anthropic', 'groq', 'google')
            model: Model name to use
            api_key: API key for the provider
            **kwargs: Additional arguments to pass to the LLM service
            
        Returns:
            Tailored resume in LaTeX format
        """
        # Read the base resume
        resume_content = self.read_resume_base(resume_path)
        
        # Create the tailoring prompt
        prompt = self.create_tailoring_prompt(job_data, resume_content)
        
        # Generate the tailored resume using LLM
        tailored_resume = generate_text(
            prompt=prompt,
            provider=provider,
            model=model,
            api_key=api_key,
            system_prompt="You are an expert resume writer and LaTeX specialist. Your task is to tailor resumes for specific job positions while maintaining the original LaTeX formatting and structure.",
            temperature=0.7,
            max_tokens=4000,
            **kwargs
        )
        
        return tailored_resume

    def save_tailored_resume(
        self,
        tailored_content: str,
        output_path: str,
        job_data: Dict[str, Any]
    ) -> None:
        """
        Save the tailored resume to a file.
        
        Args:
            tailored_content: The tailored resume content
            output_path: Path where to save the tailored resume
            job_data: Dictionary containing job details for filename
        """
        # Create output directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Save the tailored resume
        with open(output_path, 'w') as f:
            f.write(tailored_content)

    def generate_tailored_resume(
        self,
        job_data: Dict[str, Any],
        llm_provider: str,
        api_key: Optional[str],
        primary_resume_path: str,
        output_dir: str
    ) -> str:
        """
        Generate a tailored resume based on job data and primary resume.
        
        Args:
            job_data: Dictionary containing job details
            llm_provider: Name of the LLM provider to use
            api_key: API key for the LLM provider
            primary_resume_path: Path to the primary resume file
            output_dir: Directory to save the generated resume
            
        Returns:
            Path to the generated resume file
        """
        try:
            os.makedirs(output_dir, exist_ok=True)

            # Generate filename with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"tailored_resume_{timestamp}.tex"
            output_path = os.path.join(output_dir, filename)

            # Generate the tailored resume using the LLM
            tailored_content = self.tailor_resume(
                resume_path=primary_resume_path,
                job_data=job_data,
                provider=llm_provider,
                api_key=api_key
            )
        
            # Save the tailored resume
            self.save_tailored_resume(tailored_content, output_path, job_data)
        
            return output_path

        except Exception as e:
            print(json.dumps({'error': str(e)}))
            raise

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Generate a tailored resume')
    parser.add_argument('--job-data', type=str, required=True, help='JSON string of job data')
    parser.add_argument('--llm-provider', type=str, required=True, help='LLM provider to use')
    parser.add_argument('--api-key', type=str, help='API key for the LLM provider')
    parser.add_argument('--primary-resume', type=str, required=True, help='Path to primary resume')
    parser.add_argument('--output-dir', type=str, required=True, help='Output directory')

    args = parser.parse_args()

    try:
        job_data = json.loads(args.job_data)
        tailor = resume_tailor()
        output_path = tailor.generate_tailored_resume(
            job_data=job_data,
            llm_provider=args.llm_provider,
            api_key=args.api_key,
            primary_resume_path=args.primary_resume,
            output_dir=args.output_dir
        )
        print(json.dumps({'output_path': output_path}))
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1) 