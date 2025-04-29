'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

interface ApiKeys {
  openaiApiKey: string | null;
  grokApiKey: string | null;
  deepseekApiKey: string | null;
  geminiApiKey: string | null;
}

export default function ApiKeysPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openaiApiKey: '',
    grokApiKey: '',
    deepseekApiKey: '',
    geminiApiKey: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchApiKeys();
    } else if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('http://localhost:5001/api-keys', {
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }

      const data = await response.json();
      setApiKeys(data);
    } catch (err) {
      setError('Failed to load API keys');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('http://localhost:5001/api-keys', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`
        },
        body: JSON.stringify(apiKeys)
      });

      if (!response.ok) {
        throw new Error('Failed to update API keys');
      }

      setSuccess('API keys updated successfully');
    } catch (err) {
      setError('Failed to update API keys');
      console.error(err);
    }
  };

  if (status === 'loading' || loading) {
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
          <h1 className="text-3xl font-bold">API Keys Management</h1>
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

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">OpenAI API Key</h2>
            <input
              type="password"
              value={apiKeys.openaiApiKey || ''}
              onChange={(e) => setApiKeys({ ...apiKeys, openaiApiKey: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your OpenAI API key"
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Grok API Key</h2>
            <input
              type="password"
              value={apiKeys.grokApiKey || ''}
              onChange={(e) => setApiKeys({ ...apiKeys, grokApiKey: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your Grok API key"
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">DeepSeek API Key</h2>
            <input
              type="password"
              value={apiKeys.deepseekApiKey || ''}
              onChange={(e) => setApiKeys({ ...apiKeys, deepseekApiKey: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your DeepSeek API key"
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Gemini API Key</h2>
            <input
              type="password"
              value={apiKeys.geminiApiKey || ''}
              onChange={(e) => setApiKeys({ ...apiKeys, geminiApiKey: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your Gemini API key"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save API Keys
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 