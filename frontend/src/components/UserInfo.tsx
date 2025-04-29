'use client';

import { signOut } from 'next-auth/react';

interface UserInfoProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    plan?: 'FREE' | 'BASIC' | 'PREMIUM';
  };
}

export default function UserInfo({ user }: UserInfoProps) {
  const getPlanFeatures = (plan: string) => {
    switch (plan) {
      case 'FREE':
        return ['Basic features', 'Limited storage'];
      case 'BASIC':
        return ['All free features', 'More storage', 'Priority support'];
      case 'PREMIUM':
        return ['All basic features', 'Unlimited storage', '24/7 support', 'Advanced features'];
      default:
        return ['Basic features'];
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Account Information</h2>
        <div className="space-y-2">
          <p><span className="font-semibold">Name:</span> {user.name || 'Not set'}</p>
          <p><span className="font-semibold">Email:</span> {user.email}</p>
          <p>
            <span className="font-semibold">Plan:</span>{' '}
            <span className={`px-2 py-1 rounded-full text-sm ${
              user.plan === 'PREMIUM' ? 'bg-purple-100 text-purple-800' :
              user.plan === 'BASIC' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {user.plan || 'FREE'}
            </span>
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Plan Features</h2>
        <ul className="space-y-2">
          {getPlanFeatures(user.plan || 'FREE').map((feature, index) => (
            <li key={index} className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
} 