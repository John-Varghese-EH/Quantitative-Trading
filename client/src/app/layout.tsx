"use client";

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
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
  return (
    <html lang="en">
      <head>
        <title>QuantAdv</title>
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0d1429',
                color: '#e2e8f0',
                border: '1px solid rgba(99, 179, 237, 0.2)',
                borderRadius: '10px',
              },
            }}
          />
        </QueryClientProvider>
      </body>
    </html>
  );
}
