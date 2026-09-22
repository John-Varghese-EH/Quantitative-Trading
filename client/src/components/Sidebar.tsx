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


import { usePathname, useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { motion } from 'framer-motion'
import {
  LayoutDashboard, TrendingUp, Brain, Zap, Shield, FlaskConical,
  BarChart3, Lightbulb, Bell, LogOut, Activity,
  Users, Bot, Radar, Layers
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from './Logo'

const NAV_ITEMS = [
  { to: '/dashboard',      label: 'Dashboard',        icon: LayoutDashboard },
  { to: '/copilot',        label: 'AI Copilot',       icon: Bot },
  { to: '/scanner',        label: 'Market Scanner',   icon: Radar },
  { to: '/derivatives',    label: 'Options Chain',    icon: Layers },
  { to: '/market',         label: 'Market Data',       icon: TrendingUp },
  { to: '/ai-prediction',  label: 'AI Prediction',     icon: Brain },
  { to: '/trading',        label: 'Trading Simulator', icon: Activity },
  { to: '/adversarial',    label: 'Adversarial ML',    icon: Zap },
  { to: '/defense',        label: 'Defense Module',    icon: Shield },
  { to: '/sandbox',        label: 'Sandbox',           icon: FlaskConical },
  { to: '/analytics',      label: 'Analytics',         icon: BarChart3 },
  { to: '/explainable-ai', label: 'Explainable AI',    icon: Lightbulb },
  { to: '/notifications',  label: 'Notifications',     icon: Bell },
]

export default function Sidebar() {
  const { unreadCount, sidebarOpen } = useAppStore()
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <aside className={`sidebar transition-all duration-300 ease-in-out border-r border-border bg-background flex flex-col h-full ${!sidebarOpen ? 'w-[72px]' : 'w-[260px]'}`}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 border-b border-border flex ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
      >
        <Logo size={32} showText={sidebarOpen} className="sidebar-logo-container" />
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto px-3 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }, i) => {
          const isActive = pathname === to;
          return (
            <motion.div
              key={to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <NextLink
                href={to}
                className={`flex items-center rounded-lg transition-colors duration-200 ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'} ${sidebarOpen ? 'px-3 py-2.5 justify-start' : 'p-2.5 justify-center'}`}
                title={!sidebarOpen ? label : undefined}
              >
                <Icon size={18} className={isActive ? 'text-primary' : 'text-muted-foreground'} />
                {sidebarOpen && <span className="ml-3 text-sm">{label}</span>}
                {to === '/notifications' && unreadCount > 0 && sidebarOpen && (
                  <span className="ml-auto bg-destructive text-destructive-foreground text-[0.65rem] font-bold px-[7px] py-[2px] rounded-full min-w-[18px] text-center">
                    {unreadCount}
                  </span>
                )}
              </NextLink>
            </motion.div>
          );
        })}

        {/* Admin only */}
        {(user as any)?.role === 'admin' && (
          <NextLink 
            href="/admin" 
            className={`flex items-center rounded-lg transition-colors duration-200 ${pathname === '/admin' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'} ${sidebarOpen ? 'px-3 py-2.5 justify-start' : 'p-2.5 justify-center'}`}
            title={!sidebarOpen ? 'Admin Panel' : undefined}
          >
            <Users size={18} className={pathname === '/admin' ? 'text-primary' : 'text-muted-foreground'} />
            {sidebarOpen && <span className="ml-3 text-sm">Admin Panel</span>}
          </NextLink>
        )}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-border flex justify-center">
        {sidebarOpen ? (
          <div className="flex items-center gap-3 bg-muted/50 p-2.5 rounded-xl w-full border border-border/50 shadow-sm transition-all hover:bg-muted/80">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-border" />
            ) : (
              <div className="w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center font-medium text-xs text-foreground shrink-0 shadow-sm">
                {(user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate text-foreground">
                {user?.displayName || user?.email?.split('@')[0] || 'User'}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {user?.email}
              </div>
            </div>
            <button onClick={handleLogout} title="Logout" className="text-muted-foreground hover:text-destructive p-1.5 rounded-md hover:bg-destructive/10 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={handleLogout} title="Logout" className="text-muted-foreground hover:text-destructive p-2.5 rounded-xl hover:bg-destructive/10 transition-colors">
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  )
}
