"use client";

import { useQuery } from '@tanstack/react-query'
import { Bell, Search, TrendingUp, TrendingDown } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import api from '@/services/api'

export default function TopBar() {
  const { unreadCount, user } = useAppStore()

  const { data: prices } = useQuery({
    queryKey: ['live-prices'],
    queryFn: () => api.get('/market/live-prices').then(r => r.data.prices),
    refetchInterval: 30_000,
  })

  return (
    <header style={{
      position: 'fixed', top: 0, left: 260, right: 0, height: 64,
      background: 'rgba(3, 6, 15, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--color-border)',
      zIndex: 99,
      display: 'flex', alignItems: 'center', gap: 16, padding: '0 24px',
    }}>
      {/* Live Ticker */}
      <div className="ticker-wrapper" style={{ flex: 1, maxWidth: 600 }}>
        {prices && (
          <div className="ticker-content" style={{ gap: 32, display: 'flex' }}>
            {[...prices, ...prices].map((p: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{p.symbol}</span>
                <span style={{ color: p.positive ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>
                  ${p.price.toLocaleString()}
                </span>
                <span style={{ color: p.positive ? 'var(--color-success)' : 'var(--color-danger)', fontSize: '0.75rem' }}>
                  {p.positive ? '+' : ''}{p.change_pct}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
        {/* Notifications */}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={20} color="var(--color-muted)" />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -6,
              background: 'var(--color-danger)',
              color: '#fff', fontSize: '0.6rem', fontWeight: 700,
              width: 16, height: 16, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{unreadCount}</span>
          )}
        </div>

        {/* User pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--color-border)',
          borderRadius: 24, padding: '6px 14px',
          fontSize: '0.85rem',
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #00d4ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', fontWeight: 700, color: '#fff',
          }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <span style={{ color: 'var(--color-text)' }}>{user?.username}</span>
          {user?.role === 'admin' && (
            <span className="badge badge-purple" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>ADMIN</span>
          )}
        </div>
      </div>
    </header>
  )
}
