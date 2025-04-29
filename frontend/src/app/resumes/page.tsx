'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

interface Resume {
  id: string;
  title: string;
  content: string;
  format: 'latex' | 'text';
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ResumesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newResume, setNewResume] = useState({
    title: '',
    content: '',
    format: 'text' as 'latex' | 'text',
    isPrimary: false
  });

  useEffect(() => {
    if (status === 'authenticated') {
      fetchResumes();
    } else if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  const fetchResumes = async () => {
    try {
      const response = await fetch('http://localhost:5001/resumes', {
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch resumes');
      }

      const data = await response.json();
      setResumes(data);
    } catch (err) {
      setError('Failed to load resumes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`
        },
        body: JSON.stringify(newResume)
      });

      if (!response.ok) {
        throw new Error('Failed to create resume');
      }

      const createdResume = await response.json();
      setResumes([...resumes, createdResume]);
      setNewResume({
        title: '',
        content: '',
        format: 'text',
        isPrimary: false
      });
    } catch (err) {
      setError('Failed to create resume');
      console.error(err);
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      // First, set all resumes to non-primary
      const updatedResumes = resumes.map(resume => ({
        ...resume,
        isPrimary: false
      }));

      // Then set the selected resume as primary
      const response = await fetch(`http://localhost:5001/resumes/${id}/primary`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to set primary resume');
      }

      const updatedResume = await response.json();
      
      // Update the local state with the new primary resume
      setResumes(updatedResumes.map(resume => 
        resume.id === id 
          ? { ...resume, isPrimary: true }
          : resume
      ));
    } catch (err) {
      setError('Failed to set primary resume');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5001/resumes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete resume');
      }

      setResumes(resumes.filter(resume => resume.id !== id));
    } catch (err) {
      setError('Failed to delete resume');
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5001/resumes/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload resume');
      }

      const newResume = await response.json();
      setResumes([...resumes, newResume]);
    } catch (err) {
      setError('Failed to upload resume');
      console.error(err);
    }
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Resumes</h1>
          <Link 
            href="/dashboard" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* New Resume Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Add New Resume</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={newResume.title}
                  onChange={(e) => setNewResume({ ...newResume, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Format</label>
                <select
                  value={newResume.format}
                  onChange={(e) => setNewResume({ ...newResume, format: e.target.value as 'latex' | 'text' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="text">Text</option>
                  <option value="latex">LaTeX</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea
                  value={newResume.content}
                  onChange={(e) => setNewResume({ ...newResume, content: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={10}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newResume.isPrimary}
                  onChange={(e) => setNewResume({ ...newResume, isPrimary: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Set as primary resume</label>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Add Resume
              </button>
            </form>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Or upload a file</label>
              <input
                type="file"
                onChange={handleFileUpload}
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
                accept=".txt,.tex"
              />
            </div>
          </div>

          {/* Resume List */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Your Resumes</h2>
            {loading ? (
              <div className="text-center">Loading resumes...</div>
            ) : resumes.length === 0 ? (
              <p className="text-gray-500">No resumes found. Add your first resume above.</p>
            ) : (
              <div className="space-y-4">
                {resumes.map((resume) => (
                  <div key={resume.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{resume.title}</h3>
                        <p className="text-sm text-gray-500">
                          {resume.format.toUpperCase()} • {new Date(resume.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {!resume.isPrimary && (
                          <button
                            onClick={() => handleSetPrimary(resume.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Set Primary
                          </button>
                        )}
                        {resume.isPrimary && (
                          <span className="text-green-600 font-medium">Primary</span>
                        )}
                        <button
                          onClick={() => handleDelete(resume.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <pre className="bg-gray-50 p-2 rounded text-sm overflow-x-auto">
                        {resume.content.substring(0, 100)}...
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 