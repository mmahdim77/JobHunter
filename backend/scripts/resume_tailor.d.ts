declare module '../../scripts/resume_tailor' {
  export class resume_tailor {
    constructor();
    generate_tailored_resume(
      job_data: {
        title: string;
        company: string;
        description?: string | null;
        jobType?: string | null;
        companyIndustry?: string | null;
      },
      llm_provider: string,
      api_key: string | undefined,
      primary_resume_path: string,
      output_dir: string
    ): Promise<string>;
  }
} 