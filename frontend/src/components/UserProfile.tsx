import React from 'react';
import { signOut } from 'next-auth/react';

interface UserProfileProps {
  user: {
    name?: string;
    email: string;
    plan: string;
  };
}

export default function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
          <span className="text-xl font-semibold text-indigo-600">
            {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {user.name || 'User'}
          </h2>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">Plan</span>
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
            {user.plan}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Logout
        </button>
      </div>
    </div>
  );
} 