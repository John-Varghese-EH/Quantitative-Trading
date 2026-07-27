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

import { useQuery } from '@tanstack/react-query'
import { motion, Variants } from 'framer-motion'
import {
  DollarSign, TrendingUp, TrendingDown, Brain, Activity, Shield,
  Zap, BarChart2, Target, AlertTriangle
} from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '@/services/api'

const CARD_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({ 
    opacity: 1, y: 0, 
    transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" } 
  }),
}

interface StatCard {
  label: string
  value: string | number
  change?: string
  positive?: boolean
  icon: React.ReactNode
  color: string
  glowColor: string
}

function StatCardComponent({ card, index }: { card: StatCard; index: number }) {
  return (
    <motion.div
      className="glass stat-card"
      custom={index}
      initial="hidden"
      animate="visible"
      variants={CARD_VARIANTS}
      style={{ '--glow': card.glowColor } as any}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ margin: '0 0 4px', color: 'var(--color-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</p>
          <h3 style={{ margin: '0 0 6px', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)' }}>{card.value}</h3>
          {card.change && (
            <span style={{ fontSize: '0.8rem', color: card.positive ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>
              {card.positive ? '▲' : '▼'} {card.change}
            </span>
          )}
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 8,
          background: `rgba(var(--color-${card.color}-rgb), 0.1)`,
          border: `1px solid ${card.color}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: card.color
        }}>
          {card.icon}
        </div>
      </div>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then(r => r.data),
    refetchInterval: 60_000,
  })

  const { data: portfolio } = useQuery({
    queryKey: ['portfolio-history'],
    queryFn: () => api.get('/dashboard/portfolio-history?days=30').then(r => r.data),
  })

  const { data: heatmap } = useQuery({
    queryKey: ['market-heatmap'],
    queryFn: () => api.get('/dashboard/market-heatmap').then(r => r.data.sectors),
  })

  const { data: news } = useQuery({
    queryKey: ['news-feed'],
    queryFn: () => api.get('/news/feed').then(r => r.data.articles),
  })

  const { data: holdings } = useQuery({
    queryKey: ['portfolio-holdings'],
    queryFn: () => api.get('/dashboard/portfolio').then(r => r.data.holdings).catch(() => []),
  })

  const CARDS: StatCard[] = stats ? [
    {
      label: 'Portfolio Value', value: `$${stats.portfolio_value?.toLocaleString() ?? '—'}`,
      change: `${Math.abs(stats.daily_pnl_pct)}%`, positive: stats.daily_pnl_pct >= 0,
      icon: <DollarSign size={20} />, color: 'var(--color-text)', glowColor: 'transparent',
    },
    {
      label: 'Daily P&L', value: `${stats.daily_pnl >= 0 ? '+' : ''}$${stats.daily_pnl?.toFixed(2) ?? '—'}`,
      positive: stats.daily_pnl >= 0,
      icon: stats.daily_pnl >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />,
      color: stats.daily_pnl >= 0 ? 'var(--color-success)' : 'var(--color-danger)', glowColor: 'transparent',
    },
    {
      label: 'AI Confidence', value: `${stats.ai_confidence ?? 0}%`,
      icon: <Brain size={20} />, color: 'var(--color-accent)', glowColor: 'transparent',
    },
    {
      label: 'Model Accuracy', value: `${stats.model_accuracy ?? 0}%`,
      icon: <Target size={20} />, color: 'var(--color-warning)', glowColor: 'transparent',
    },
    {
      label: 'Risk Score', value: `${stats.risk_score ?? 0}`,
      icon: <AlertTriangle size={20} />, color: 'var(--color-danger)', glowColor: 'transparent',
    },
    {
      label: 'Open Positions', value: stats.open_positions ?? 0,
      icon: <Activity size={20} />, color: 'var(--color-text)', glowColor: 'transparent',
    },
    {
      label: 'Total Trades', value: stats.total_trades ?? 0,
      icon: <BarChart2 size={20} />, color: 'var(--color-text)', glowColor: 'transparent',
    },
    {
      label: 'Attacks Simulated', value: stats.total_attacks ?? 0,
      icon: <Zap size={20} />, color: 'var(--color-text)', glowColor: 'transparent',
    },
  ] : []

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Trading Dashboard
        </h1>
        <p style={{ color: 'var(--color-muted)', margin: 0 }}>Adversarial ML Sandbox — Paper Trading Mode</p>
      </motion.div>

      {/* Stat Cards */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : (
        <div className="dashboard-grid" style={{ marginBottom: 32 }}>
          {CARDS.map((c, i) => <StatCardComponent key={c.label} card={c} index={i} />)}
        </div>
      )}

      {/* Portfolio Chart + Market Heatmap */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Portfolio Growth */}
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 20px', fontWeight: 700 }}>Portfolio Growth (30 days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={portfolio?.history || []}>
              <defs>
                <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e1ff" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} tickLine={false} axisLine={false}
                tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)' }} tickLine={false} axisLine={false}
                tickFormatter={(v) => `$${(v/1000).toFixed(1)}k`} />
              <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 6, color: 'var(--color-text)' }}
                formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Value']} />
              <Area type="monotone" dataKey="value" stroke="var(--color-accent)" strokeWidth={2} fill="url(#portfolioGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Market Heatmap */}
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 700 }}>Market Heatmap</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {(heatmap || []).map((s: any) => (
              <motion.div key={s.sector} whileHover={{ y: -2 }} transition={{ duration: 0.15 }} style={{
                padding: '10px 8px', borderRadius: 8, textAlign: 'center',
                background: s.change >= 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${s.change >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                cursor: 'default',
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: 2, fontWeight: 500 }}>{s.sector}</div>
                <div style={{ fontWeight: 600, color: s.change >= 0 ? 'var(--color-success)' : 'var(--color-danger)', fontSize: '0.85rem' }}>
                  {s.change >= 0 ? '+' : ''}{s.change}%
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Portfolio Holdings */}
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 700 }}>💼 Active Holdings</h3>
          {(!holdings || holdings.length === 0) ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--color-muted)' }}>No active holdings</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Shares</th>
                    <th>Avg Price</th>
                    <th>Current Value</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h: any, i: number) => (
                    <motion.tr key={h.symbol} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <td style={{ fontWeight: 700 }}>{h.symbol}</td>
                      <td>{h.shares}</td>
                      <td>${h.avg_price?.toFixed(2)}</td>
                      <td style={{ color: h.pnl >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        ${(h.shares * h.current_price)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* News Feed */}
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 700 }}>📰 Market News & Sentiment</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(news || []).slice(0, 5).map((article: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-light" style={{ padding: '12px 16px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>{article.source}</span>
                  <span className={`badge ${article.impact === 'bullish' ? 'badge-success' : 'badge-danger'}`}>
                    {article.impact}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.5 }}>{article.title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
