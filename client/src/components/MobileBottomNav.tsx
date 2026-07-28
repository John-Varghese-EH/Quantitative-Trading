"use client";
/**
 * QuantAdv - Quantitative Trading Platform
 * Copyright (C) 2026 John Varghese (J0X)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, TrendingUp, Brain, Activity, Menu, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const MOBILE_NAV_ITEMS = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/market', label: 'Market', icon: TrendingUp },
  { to: '/ai-prediction', label: 'AI', icon: Brain },
  { to: '/trading', label: 'Trade', icon: Activity },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  return (
    <nav className="mobile-bottom-nav">
      {MOBILE_NAV_ITEMS.map(({ to, label, icon: Icon }) => {
        const isActive = pathname === to;
        return (
          <NextLink
            key={to}
            href={to}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={22} className="nav-icon" />
            <span className="nav-label">{label}</span>
          </NextLink>
        );
      })}
      
      {/* Menu Button to toggle Sidebar Drawer */}
      <button 
        className={`mobile-nav-item ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={22} className="nav-icon" /> : <Menu size={22} className="nav-icon" />}
        <span className="nav-label">{sidebarOpen ? 'Close' : 'Menu'}</span>
      </button>
    </nav>
  );
}
