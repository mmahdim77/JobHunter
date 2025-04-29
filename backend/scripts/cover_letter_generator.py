import json
from typing import Dict, Any, Optional
import os
from pathlib import Path
from llm_service import generate_text
from datetime import datetime

class cover_letter_generator:
    def __init__(self):
        self.temp_dir = 'data/temp'
        os.makedirs(self.temp_dir, exist_ok=True)

    def read_resume(self, resume_path: str) -> str:
        """
        Read the resume LaTeX file.
        
        Args:
            resume_path: Path to the resume LaTeX file
            
        Returns:
            Content of the resume file as string
        """
        with open(resume_path, 'r') as f:
            return f.read()

    def create_cover_letter_prompt(self, job_data: Dict[str, Any], resume_content: str) -> str:
        """
        Create a comprehensive prompt for the LLM to generate a cover letter.
        
        Args:
            job_data: Dictionary containing job details
            resume_content: Content of the resume
            
        Returns:
            A detailed prompt for the LLM
        """
        # Extract relevant job information
        job_title = job_data.get('title', '')
        company = job_data.get('company', '')
        location = job_data.get('location', {})
        job_description = job_data.get('description', '')
        requirements = job_data.get('requirements', '')
        
        prompt = f"""You are an expert career consultant and professional writer. Your task is to create a compelling cover letter for the position of {job_title} at {company}.

Job Details:
- Position: {job_title}
- Company: {company}
- Location: {location.get('city', '')}, {location.get('state', '')}, {location.get('country', '')}
- Job Description: {job_description}
- Requirements: {requirements}

Applicant's Resume:
{resume_content}

Instructions:
1. Create a professional, one-page cover letter in LaTeX format.
2. The cover letter should be tailored specifically to this position and company.
3. Use the information from the resume to highlight relevant skills and experiences.
4. Structure the cover letter with:
   - Professional header with contact information
   - Proper date and recipient information
   - Engaging opening paragraph that shows enthusiasm for the position
   - 2-3 body paragraphs that:
     * Demonstrate understanding of the company and position
     * Highlight relevant skills and experiences from the resume
     * Show how your background matches the job requirements
     * Include specific examples and achievements
   - Strong closing paragraph with a call to action
   - Professional sign-off

5. Writing Guidelines:
   - Use a professional and confident tone
   - Be specific and concrete in your examples
   - Show enthusiasm for the company and position
   - Use active voice and strong action verbs
   - Keep paragraphs concise and focused
   - Ensure perfect grammar and spelling
   - Maintain a formal business letter format

6. LaTeX Formatting:
   - Use proper LaTeX commands for formatting
   - Include necessary LaTeX packages
   - Maintain consistent spacing and margins
   - Use appropriate font sizes and styles
   - Ensure the document compiles correctly

Please provide the cover letter in LaTeX format, maintaining all the proper LaTeX commands and structure while creating a compelling and professional document."""

        return prompt

    def generate_cover_letter(
        self,
        resume_path: str,
        job_data: Dict[str, Any],
        provider: str = "openai",
        model: str = "gpt-4-turbo-preview",
        api_key: Optional[str] = None,
        **kwargs
    ) -> str:
        """
        Generate a tailored cover letter using LLM.
        
        Args:
            resume_path: Path to the resume LaTeX file
            job_data: Dictionary containing job details
            provider: LLM provider to use ('openai', 'anthropic', 'groq', 'google')
            model: Model name to use
            api_key: API key for the provider
            **kwargs: Additional arguments to pass to the LLM service
            
        Returns:
            Generated cover letter in LaTeX format
        """
        # Read the resume
        resume_content = self.read_resume(resume_path)
        
        # Create the cover letter prompt
        prompt = self.create_cover_letter_prompt(job_data, resume_content)
        
        # Generate the cover letter using LLM
        cover_letter = generate_text(
            prompt=prompt,
            provider=provider,
            model=model,
            api_key=api_key,
            system_prompt="You are an expert professional writer and LaTeX specialist. Your task is to create compelling, tailored cover letters that highlight the applicant's qualifications while maintaining proper LaTeX formatting.",
            temperature=0.7,
            max_tokens=4000,
            **kwargs
        )
        
        return cover_letter

    def save_cover_letter(
        self,
        cover_letter_content: str,
        output_path: str,
        job_data: Dict[str, Any]
    ) -> None:
        """
        Save the cover letter to a file.
        
        Args:
            cover_letter_content: The cover letter content
            output_path: Path where to save the cover letter
            job_data: Dictionary containing job details for filename
        """
        # Create output directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Save the cover letter
        with open(output_path, 'w') as f:
            f.write(cover_letter_content)

    def generate_tailored_cover_letter(
        self,
        job_data: Dict[str, Any],
        llm_provider: str = 'openai',
        api_key: Optional[str] = None,
        resume_path: str = 'Resume_base.tex',
        output_dir: str = 'outputs/cover_letters'
    ) -> str:
        """
        High-level function to generate and save a tailored cover letter.
        
        Args:
            job_data: Dictionary containing job details
            llm_provider: LLM provider to use
            api_key: API key for the provider
            resume_path: Path to the resume
            output_dir: Directory to save the cover letter
            
        Returns:
            Path to the saved cover letter
        """
        try:
            # Generate the cover letter
            cover_letter = self.generate_cover_letter(
                resume_path=resume_path,
                job_data=job_data,
                provider=llm_provider,
                api_key=api_key
            )
            
            # Create output filename with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            company = job_data.get('company', 'unknown').lower().replace(' ', '_')
            title = job_data.get('title', 'unknown').lower().replace(' ', '_')
            output_filename = f"{company}_{title}_{timestamp}_cover_letter.tex"
            output_path = os.path.join(output_dir, output_filename)
            
            # Save the cover letter
            self.save_cover_letter(cover_letter, output_path, job_data)
            
            # Return JSON response
            response = {
                'success': True,
                'cover_letter_path': output_path,
                'error': None
            }
            print(json.dumps(response))
            return output_path
            
        except Exception as e:
            error_response = {
                'success': False,
                'cover_letter_path': None,
                'error': str(e)
            }
            print(json.dumps(error_response))
            raise

if __name__ == '__main__':
    import argparse
    import sys

    parser = argparse.ArgumentParser(description='Generate a tailored cover letter')
    parser.add_argument('--resume_path', type=str, required=True, help='Path to the resume file')
    parser.add_argument('--job_data', type=str, required=True, help='JSON string of job data')
    parser.add_argument('--provider', type=str, default='openai', help='LLM provider to use')
    parser.add_argument('--model', type=str, default='gpt-4-turbo-preview', help='Model to use')
    parser.add_argument('--api_key', type=str, help='API key for the provider')
    parser.add_argument('--output_dir', type=str, required=True, help='Output directory')

    args = parser.parse_args()

    try:
        job_data = json.loads(args.job_data)
        generator = cover_letter_generator()
        output_path = generator.generate_tailored_cover_letter(
            job_data=job_data,
            llm_provider=args.provider,
            api_key=args.api_key,
            resume_path=args.resume_path,
            output_dir=args.output_dir
        )
    except Exception as e:
        error_response = {
            'success': False,
            'cover_letter_path': None,
            'error': str(e)
        }
        print(json.dumps(error_response))
        sys.exit(1) 