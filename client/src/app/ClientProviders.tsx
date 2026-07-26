"use client";

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';

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
  React.useEffect(() => {
    const _0x1a2b = ['\x4a\x6f\x68\x6e\x20\x56\x61\x72\x67\x68\x65\x73\x65\x20\x28\x4a\x30\x58\x29', '\x4c\x69\x6e\x6b\x65\x64\x49\x6e\x3a\x20\x2f\x69\x6e\x2f\x4a\x6f\x68\x6e\x2d\x2d\x56\x61\x72\x67\x68\x65\x73\x65\x2f', '\x47\x69\x74\x48\x75\x62\x3a\x20\x4a\x6f\x68\x6e\x2d\x56\x61\x72\x67\x68\x65\x73\x65\x2d\x45\x48'];
    console.log(`%c${_0x1a2b[0]}\n${_0x1a2b[1]}\n${_0x1a2b[2]}`, 'color: #888; font-size: 11px;');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <div dangerouslySetInnerHTML={{ __html: '<!-- \x4a\x6f\x68\x6e\x20\x56\x61\x72\x67\x68\x65\x73\x65\x20\x28\x4a\x30\x58\x29 | \x4c\x69\x6e\x6b\x65\x64\x49\x6e\x3a\x20\x2f\x69\x6e\x2f\x4a\x6f\x68\x6e\x2d\x2d\x56\x61\x72\x67\x68\x65\x73\x65\x2f | \x47\x69\x74\x48\x75\x62\x3a\x20\x4a\x6f\x68\x6e\x2d\x56\x61\x72\x67\x68\x65\x73\x65\x2d\x45\x48 -->' }} />
          {/* Subtle Global Noise Overlay */}
          <div 
            className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] dark:opacity-[0.05]"
            style={{ backgroundImage: 'url("/noise.png")', mixBlendMode: 'overlay' }}
          />
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
