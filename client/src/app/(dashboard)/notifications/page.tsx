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


import { motion } from 'framer-motion'
import { Bell, CheckCheck, Zap, Brain, TrendingUp, Shield, AlertTriangle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

const NOTIF_ICONS: Record<string, React.ReactNode> = {
  price: <TrendingUp size={16} color="#00d4ff" />,
  attack: <Zap size={16} color="#ef4444" />,
  training: <Brain size={16} color="#7c3aed" />,
  trade: <TrendingUp size={16} color="#10b981" />,
  defense: <Shield size={16} color="#10b981" />,
  system: <AlertTriangle size={16} color="#f59e0b" />,
}

const SAMPLE_NOTIFS = [
  { id: '1', type: 'training', title: 'Model Training Complete', message: 'Your Random Forest model on AAPL achieved 67.3% accuracy.', is_read: false, created_at: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: '2', type: 'attack', title: 'Attack Simulation Result', message: 'FGSM attack achieved 34% success rate on your LSTM model.', is_read: false, created_at: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: '3', type: 'trade', title: 'Backtest Complete', message: 'MA Crossover on SPY returned +18.4% over 2 years.', is_read: true, created_at: new Date(Date.now() - 60 * 60000).toISOString() },
  { id: '4', type: 'defense', title: 'Defense Applied', message: 'Adversarial Training improved model security score to 78.', is_read: true, created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: '5', type: 'price', title: 'Price Alert', message: 'NVDA crossed $900 - up 3.2% today.', is_read: true, created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
]

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function NotificationsPage() {
  const { notifications, markAllRead, unreadCount, addNotification } = useAppStore()
  const allNotifs = [...notifications, ...SAMPLE_NOTIFS]

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: '0 0 6px', fontSize: '1.8rem', fontWeight: 800 }}>
              <Bell size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Notifications
            </h1>
            <p style={{ color: 'var(--color-muted)', margin: 0 }}>
              {unreadCount + SAMPLE_NOTIFS.filter(n => !n.is_read).length} unread notifications
            </p>
          </div>
          <motion.button className="btn-secondary" onClick={markAllRead} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ padding: '9px 18px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem' }}>
            <CheckCheck size={16} /> Mark all read
          </motion.button>
        </div>
      </motion.div>

      {/* Test Notification Button */}
      <div className="glass-light" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>Test notifications:</span>
        {[
          { type: 'training', title: 'Training Complete', message: 'Your model finished training!' },
          { type: 'attack', title: 'Attack Alert', message: 'New adversarial attack detected!' },
          { type: 'price', title: 'Price Alert', message: 'AAPL is up 5% today!' },
        ].map(n => (
          <button key={n.type} onClick={() => addNotification(n)}
            className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
            + {n.type}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {allNotifs.map((n, i) => (
          <motion.div key={n.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            className="glass" style={{ padding: 18, borderLeft: `3px solid ${n.is_read ? 'transparent' : 'var(--color-primary)'}`, opacity: n.is_read ? 0.7 : 1 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {NOTIF_ICONS[n.type] || <Bell size={16} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{n.title}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {!n.is_read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)' }} />}
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{timeAgo(n.created_at)}</span>
                  </div>
                </div>
                <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.88rem' }}>{n.message}</p>
              </div>
            </div>
          </motion.div>
        ))}

        {allNotifs.length === 0 && (
          <div className="glass" style={{ padding: 60, textAlign: 'center' }}>
            <Bell size={48} opacity={0.2} style={{ marginBottom: 12 }} />
            <p style={{ color: 'var(--color-muted)' }}>No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
