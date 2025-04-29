import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company: string;
    companyUrl?: string;
    jobUrl: string;
    location?: {
      country?: string;
      city?: string;
      state?: string;
    };
    isRemote: boolean;
    description: string;
    jobType: string;
    salary?: {
      interval?: string;
      minAmount?: number;
      maxAmount?: number;
      currency?: string;
    };
    datePosted: string;
    companyIndustry?: string;
    companyLogo?: string;
  };
}

export default function JobCard({ job }: JobCardProps) {
  const { data: session } = useSession();
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [coverLetterUrl, setCoverLetterUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Function to truncate markdown text to 2 lines
  const truncateMarkdown = (text: string, lines: number = 2): string => {
    const linesArray = text.split('\n');
    if (linesArray.length <= lines) return text;
    return linesArray.slice(0, lines).join('\n') + '...';
  };

  const handleGenerateResume = async () => {
    try {
      setIsGeneratingResume(true);
      setError(null);

      const response = await fetch(`http://localhost:5001/resumes/tailor/${job.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate tailored resume');
      }

      const data = await response.json();
      setDownloadUrl(`http://localhost:5001/uploads/tailored/${data.filename}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGeneratingResume(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    try {
      setIsGeneratingCoverLetter(true);
      setError(null);

      const response = await fetch(`http://localhost:5001/api/cover-letters/${job.id}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate cover letter');
      }

      const data = await response.json();
      setCoverLetterUrl(`http://localhost:5001/uploads/cover_letters/${data.fileName}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
          <p className="text-gray-600">{job.company}</p>
          {job.location && (
            <p className="text-gray-500">
              {job.location.city && `${job.location.city}, `}
              {job.location.state && `${job.location.state}, `}
              {job.location.country}
              {job.isRemote && ' (Remote)'}
            </p>
          )}
        </div>
        {job.companyLogo && (
          <img
            src={job.companyLogo}
            alt={`${job.company} logo`}
            className="w-12 h-12 object-contain"
          />
        )}
      </div>

      <div className="mt-4">
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {showFullDescription ? job.description : truncateMarkdown(job.description)}
          </ReactMarkdown>
        </div>
        {job.description.split('\n').length > 2 && (
          <button
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showFullDescription ? 'Show less' : 'Show more...'}
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {job.jobType && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {job.jobType}
          </span>
        )}
        {job.companyIndustry && (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            {job.companyIndustry}
          </span>
        )}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Posted {new Date(job.datePosted).toLocaleDateString()}
        </div>
        <div className="flex gap-2">
          <a
            href={job.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Apply
          </a>
          <button
            onClick={handleGenerateResume}
            disabled={isGeneratingResume}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isGeneratingResume ? 'Generating...' : 'Generate Resume'}
          </button>
          <button
            onClick={handleGenerateCoverLetter}
            disabled={isGeneratingCoverLetter}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {isGeneratingCoverLetter ? 'Generating...' : 'Generate Cover Letter'}
          </button>
          {downloadUrl && (
            <a
              href={downloadUrl}
              download
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Download Resume
            </a>
          )}
          {coverLetterUrl && (
            <a
              href={coverLetterUrl}
              download
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Download Cover Letter
            </a>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 text-red-600">
          {error}
        </div>
      )}
    </div>
  );
} 