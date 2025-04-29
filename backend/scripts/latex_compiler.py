import os
import subprocess
from pathlib import Path
import logging
import shutil
from typing import Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class LatexCompiler:
    """A class to handle LaTeX compilation to PDF."""
    
    def __init__(self, temp_dir: str = "temp"):
        """
        Initialize the LatexCompiler.
        
        Args:
            temp_dir: Directory for temporary files during compilation
        """
        self.temp_dir = temp_dir
        os.makedirs(temp_dir, exist_ok=True)
    
    def compile_latex_to_pdf(
        self,
        latex_content: str,
        output_dir: str,
        output_filename: str,
        clean_temp: bool = True
    ) -> Optional[str]:
        """
        Compile LaTeX content to PDF.
        
        Args:
            latex_content: LaTeX content as string
            output_dir: Directory to save the PDF
            output_filename: Name of the output file (without extension)
            clean_temp: Whether to clean temporary files after compilation
            
        Returns:
            Path to the generated PDF if successful, None otherwise
        """
        try:
            # Create output directory if it doesn't exist
            os.makedirs(output_dir, exist_ok=True)
            
            # Create temporary directory for this compilation
            temp_compile_dir = os.path.join(self.temp_dir, output_filename)
            os.makedirs(temp_compile_dir, exist_ok=True)
            
            # Write LaTeX content to temporary file
            tex_file = os.path.join(temp_compile_dir, f"{output_filename}.tex")
            with open(tex_file, 'w') as f:
                f.write(latex_content)
            
            # Compile LaTeX to PDF
            logger.info(f"Compiling LaTeX to PDF: {output_filename}")
            subprocess.run(
                ['pdflatex', '-interaction=nonstopmode', '-output-directory', temp_compile_dir, tex_file],
                check=True,
                capture_output=True
            )
            
            # Move PDF to output directory
            pdf_file = os.path.join(temp_compile_dir, f"{output_filename}.pdf")
            output_pdf = os.path.join(output_dir, f"{output_filename}.pdf")
            shutil.move(pdf_file, output_pdf)
            
            # Clean up temporary files if requested
            if clean_temp:
                shutil.rmtree(temp_compile_dir)
            
            logger.info(f"Successfully compiled PDF: {output_pdf}")
            return output_pdf
            
        except subprocess.CalledProcessError as e:
            logger.error(f"LaTeX compilation failed: {e.stderr.decode()}")
            return None
        except Exception as e:
            logger.error(f"Error during LaTeX compilation: {str(e)}")
            return None

def compile_latex_to_pdf(
    latex_content: str,
    output_dir: str,
    output_filename: str,
    clean_temp: bool = True
) -> Optional[str]:
    """
    Convenience function to compile LaTeX to PDF.
    
    Args:
        latex_content: LaTeX content as string
        output_dir: Directory to save the PDF
        output_filename: Name of the output file (without extension)
        clean_temp: Whether to clean temporary files after compilation
        
    Returns:
        Path to the generated PDF if successful, None otherwise
    """
    compiler = LatexCompiler()
    return compiler.compile_latex_to_pdf(
        latex_content=latex_content,
        output_dir=output_dir,
        output_filename=output_filename,
        clean_temp=clean_temp
    )
