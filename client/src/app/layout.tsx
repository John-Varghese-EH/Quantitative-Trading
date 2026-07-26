"use client";

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import '../index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const _0x1a2b = ['\x4a\x6f\x68\x6e\x20\x56\x61\x72\x67\x68\x65\x73\x65\x20\x28\x4a\x30\x58\x29', '\x4c\x69\x6e\x6b\x65\x64\x49\x6e\x3a\x20\x2f\x69\x6e\x2f\x4a\x6f\x68\x6e\x2d\x2d\x56\x61\x72\x67\x68\x65\x73\x65\x2f', '\x47\x69\x74\x48\x75\x62\x3a\x20\x4a\x6f\x68\x6e\x2d\x56\x61\x72\x67\x68\x65\x73\x65\x2d\x45\x48'];
    console.log(`%c${_0x1a2b[0]}\n${_0x1a2b[1]}\n${_0x1a2b[2]}`, 'color: #888; font-size: 11px;');
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>VaultShield</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://db.onlinewebfonts.com/c/04e6981992c0e2e7642af2074ebe3901?family=Helvetica+Now+Display+Bold" rel="stylesheet" type="text/css" />
      </head>
      <body>
        <div dangerouslySetInnerHTML={{ __html: '<!-- \x4a\x6f\x68\x6e\x20\x56\x61\x72\x67\x68\x65\x73\x65\x20\x28\x4a\x30\x58\x29 | \x4c\x69\x6e\x6b\x65\x64\x49\x6e\x3a\x20\x2f\x69\x6e\x2f\x4a\x6f\x68\x6e\x2d\x2d\x56\x61\x72\x67\x68\x65\x73\x65\x2f | \x47\x69\x74\x48\x75\x62\x3a\x20\x4a\x6f\x68\x6e\x2d\x56\x61\x72\x67\x68\x65\x73\x65\x2d\x45\x48 -->' }} />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {/* Subtle Global Noise Overlay */}
          <div 
            className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] dark:opacity-[0.05]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: 'var(--color-card)',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '10px',
                  },
                }}
              />
            </QueryClientProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
