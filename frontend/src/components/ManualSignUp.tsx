'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

const checkPasswordStrength = (password: string) => {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const strength = [
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
  ].filter(Boolean).length;

  return {
    strength,
    requirements: {
      minLength: hasMinLength,
      upperCase: hasUpperCase,
      lowerCase: hasLowerCase,
      numbers: hasNumbers,
      specialChar: hasSpecialChar,
    },
  };
};

export default function ManualSignUp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    strength: 0,
    requirements: {
      minLength: false,
      upperCase: false,
      lowerCase: false,
      numbers: false,
      specialChar: false,
    },
  });

  const handlePasswordChange = (password: string) => {
    setFormData(prev => ({ ...prev, password }));
    setPasswordStrength(checkPasswordStrength(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password strength
    if (passwordStrength.strength < 3) {
      setError('Password is too weak. Please make it stronger.');
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Something went wrong');
      }

      // Get the callback URL from search params or default to homepage
      const callbackUrl = searchParams.get('callbackUrl') || '/';
      
      // Sign in the user after successful signup
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: true,
        callbackUrl: callbackUrl.includes('/auth/signin') ? '/' : callbackUrl,
      });

      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          disabled={isLoading}
          required
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          disabled={isLoading}
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          disabled={isLoading}
          required
        />
        <div className="mt-2 space-y-1">
          <div className="text-sm text-gray-600">Password Requirements:</div>
          <ul className="text-sm space-y-1">
            <li className={`flex items-center ${passwordStrength.requirements.minLength ? 'text-green-600' : 'text-gray-500'}`}>
              {passwordStrength.requirements.minLength ? '✓' : '•'} At least 8 characters
            </li>
            <li className={`flex items-center ${passwordStrength.requirements.upperCase ? 'text-green-600' : 'text-gray-500'}`}>
              {passwordStrength.requirements.upperCase ? '✓' : '•'} At least one uppercase letter
            </li>
            <li className={`flex items-center ${passwordStrength.requirements.lowerCase ? 'text-green-600' : 'text-gray-500'}`}>
              {passwordStrength.requirements.lowerCase ? '✓' : '•'} At least one lowercase letter
            </li>
            <li className={`flex items-center ${passwordStrength.requirements.numbers ? 'text-green-600' : 'text-gray-500'}`}>
              {passwordStrength.requirements.numbers ? '✓' : '•'} At least one number
            </li>
            <li className={`flex items-center ${passwordStrength.requirements.specialChar ? 'text-green-600' : 'text-gray-500'}`}>
              {passwordStrength.requirements.specialChar ? '✓' : '•'} At least one special character
            </li>
          </ul>
        </div>
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          disabled={isLoading}
          required
        />
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
} 