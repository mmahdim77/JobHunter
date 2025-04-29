'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/AuthModal';
import UserInfo from '@/components/UserInfo';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  if (status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 flex justify-center items-center min-h-[calc(100vh-4rem)]">
        {session ? (
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8">
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
          <div className="text-center space-y-8 bg-white rounded-lg shadow-md p-12 w-full max-w-2xl">
            <h1 className="text-4xl font-bold">Welcome to JobHunter</h1>
            <p className="text-xl text-gray-600">Your AI-powered job application assistant</p>
            
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
      </div>
    </main>
  );
}
