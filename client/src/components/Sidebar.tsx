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
  Users
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from './Logo'

const NAV_ITEMS = [
  { to: '/dashboard',      label: 'Dashboard',        icon: LayoutDashboard },
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
    <aside className={`sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ padding: '24px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: sidebarOpen ? 'flex-start' : 'center' }}
      >
        <Logo size={32} showText={sidebarOpen} className="sidebar-logo-container" />
      </motion.div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
        {NAV_ITEMS.map(({ to, label, icon: Icon }, i) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <NextLink
              href={to}
              className={`sidebar-link ${pathname === to ? 'active' : ''}`}
              style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: sidebarOpen ? '10px 16px' : '10px' }}
              title={!sidebarOpen ? label : undefined}
            >
              <Icon size={18} />
              {sidebarOpen && <span>{label}</span>}
              {to === '/notifications' && unreadCount > 0 && sidebarOpen && (
                <span style={{
                  marginLeft: 'auto',
                  background: 'var(--color-danger)',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 10,
                  minWidth: 18,
                  textAlign: 'center',
                }}>{unreadCount}</span>
              )}
            </NextLink>
          </motion.div>
        ))}

        {/* Admin only */}
        {(user as any)?.role === 'admin' && (
          <NextLink href="/admin" className={`sidebar-link ${pathname === '/admin' ? 'active' : ''}`} style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: sidebarOpen ? '10px 16px' : '10px' }} title={!sidebarOpen ? 'Admin Panel' : undefined}>
            <Users size={18} />
            {sidebarOpen && <span>Admin Panel</span>}
          </NextLink>
        )}
      </nav>

      {/* User section */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'center' }}>
        {sidebarOpen ? (
          <div className="glass-light" style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, borderRadius: 8, width: '100%' }}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{
                width: 32, height: 32,
                background: 'var(--color-border)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-text)', flexShrink: 0,
              }}>
                {(user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.displayName || user?.email?.split('@')[0] || 'User'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
            </div>
            <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', padding: 4, display: 'flex' }}>
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', padding: 10, display: 'flex', borderRadius: 8 }} className="sidebar-link">
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  )
}
