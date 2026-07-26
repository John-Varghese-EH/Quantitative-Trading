"use client";

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';

if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Encountered a script tag while rendering React component')) {
      return; // Suppress next-themes script tag warning in React 19
    }
    originalError.apply(console, args);
  };
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'dark:bg-zinc-900 dark:text-white',
              style: {
                borderRadius: '12px',
                background: 'var(--color-bg)',
                color: 'var(--color-text)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }
            }} 
          />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
