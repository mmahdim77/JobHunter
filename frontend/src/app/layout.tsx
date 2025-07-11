'use client';

import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <main className="min-h-screen bg-gray-100">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
