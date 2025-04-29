'use client';

import { signIn } from "next-auth/react";

interface SignInButtonProps {
  children: React.ReactNode;
  provider: string;
  type: "signup" | "signin";
}

export default function SignInButton({
  children,
  provider,
  type,
}: SignInButtonProps) {
  const handleSignIn = () => {
    signIn(provider, {
      callbackUrl: "/",
    });
  };

  return (
    <button
      onClick={handleSignIn}
      className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      {children}
    </button>
  );
} 