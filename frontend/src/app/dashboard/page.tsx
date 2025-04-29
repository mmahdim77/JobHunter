'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import JobSearchForm from '@/components/JobSearchForm';
import JobCard from '@/components/JobCard';
import UserProfile from '@/components/UserProfile';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

interface Job {
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
}

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/');
      return;
    }

    // Fetch user's jobs
    fetch('http://localhost:5001/jobs/my-jobs', {
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setJobs(data);
      })
      .catch(err => setError('Failed to fetch jobs'))
      .finally(() => setLoading(false));
  }, [session, status, router]);

  const handleSearch = async (searchData: any) => {
    if (!session) {
      router.push('/');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setProgress(0);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch('http://localhost:5001/jobs/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify(searchData),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      setJobs(prevJobs => [...data, ...prevJobs]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      // Reset progress after a short delay
      setTimeout(() => setProgress(0), 500);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded md:col-span-2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push('/');
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Job Search Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* User Profile */}
            <div className="md:col-span-1">
              <UserProfile user={{
                name: session.user.name || undefined,
                email: session.user.email || '',
                plan: session.user.plan || 'FREE'
              }} />
            </div>

            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              {/* Job Search Form */}
              <JobSearchForm onSearch={handleSearch} />

              {/* Job List */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Your Job Posts</h2>
                {jobs.length === 0 ? (
                  <p className="text-gray-500">No jobs found. Start by searching for jobs above.</p>
                ) : (
                  jobs.map(job => (
                    <JobCard key={job.id} job={job} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 