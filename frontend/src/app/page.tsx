'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/AuthModal';
import UserInfo from '@/components/UserInfo';
import JobCard from '@/components/JobCard';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [progress, setProgress] = useState(0);

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const searchJobs = async (searchTerm: string, location: string) => {
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
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify({
          search_term: searchTerm,
          location: location,
          results_wanted: 10,
          hours_old: 72,
          site_name: ['linkedin'],
          linkedin_fetch_description: true,
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      setJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      // Reset progress after a short delay
      setTimeout(() => setProgress(0), 500);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
    }
  }, [router]);

  if (status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Job Search</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                placeholder="Job title or keywords"
                className="flex-1 p-2 border rounded"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <input
                type="text"
                placeholder="Location"
                className="flex-1 p-2 border rounded"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <button
                onClick={() => searchJobs(searchTerm, location)}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !searchTerm.trim()}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {loading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {jobs.map((job, index) => (
              <JobCard 
                key={`${job.id}-${index}`} 
                job={job} 
              />
            ))}
            {!loading && jobs.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No jobs found. Try a different search.
              </div>
            )}
          </div>
        </div>
      </div>

      {session ? (
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold">Welcome back, {session.user?.name}!</h1>
            <p className="text-xl text-gray-600 mt-2">Manage your account and plan</p>
          </div>
          <UserInfo user={session.user} />
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Job Search Dashboard
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-bold">Welcome to Our App</h1>
          <p className="text-xl text-gray-600">Get started by signing in or creating an account</p>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => openAuthModal('signin')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </main>
  );
}
