'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'OAuthAccountNotLinked':
        return 'This email is already associated with a different sign-in method. Please use your original sign-in method.';
      case 'Callback':
        return 'There was a problem signing you in. Please try again.';
      default:
        return 'An error occurred during authentication. Please try again.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {error ? getErrorMessage(error) : 'An error occurred during authentication.'}
          </p>
        </div>
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 