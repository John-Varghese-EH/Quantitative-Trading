"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const user = useAppStore((s) => s.user);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (pathname.startsWith('/admin') && user?.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router, pathname, user]);

  if (!isAuthenticated) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Sidebar />
      <div className="main-layout" style={{ flex: 1 }}>
        <TopBar />
        <main>{children}</main>
      </div>
    </div>
  );
}
