"use client";
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  DollarSign, TrendingUp, TrendingDown, Brain, Activity, Shield,
  Zap, BarChart2, Target, AlertTriangle
} from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '@/services/api'

const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i: number) => ({ 
    opacity: 1, y: 0, scale: 1, 
    transition: { delay: i * 0.08, type: 'spring' as const, stiffness: 120, damping: 14 } 
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
          <p style={{ margin: '0 0 8px', color: 'var(--color-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{card.label}</p>
          <h3 style={{ margin: '0 0 6px', fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text)' }}>{card.value}</h3>
          {card.change && (
            <span style={{ fontSize: '0.8rem', color: card.positive ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>
              {card.positive ? '▲' : '▼'} {card.change}
            </span>
          )}
        </div>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: `${card.color}22`,
          border: `1px solid ${card.color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
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
      icon: <DollarSign size={22} color="#00d4ff" />, color: '#00d4ff', glowColor: 'rgba(0,212,255,0.3)',
    },
    {
      label: 'Daily P&L', value: `${stats.daily_pnl >= 0 ? '+' : ''}$${stats.daily_pnl?.toFixed(2) ?? '—'}`,
      positive: stats.daily_pnl >= 0,
      icon: stats.daily_pnl >= 0 ? <TrendingUp size={22} color="#10b981" /> : <TrendingDown size={22} color="#ef4444" />,
      color: stats.daily_pnl >= 0 ? '#10b981' : '#ef4444', glowColor: 'rgba(16,185,129,0.3)',
    },
    {
      label: 'AI Confidence', value: `${stats.ai_confidence ?? 0}%`,
      icon: <Brain size={22} color="#7c3aed" />, color: '#7c3aed', glowColor: 'rgba(124,58,237,0.3)',
    },
    {
      label: 'Model Accuracy', value: `${stats.model_accuracy ?? 0}%`,
      icon: <Target size={22} color="#f59e0b" />, color: '#f59e0b', glowColor: 'rgba(245,158,11,0.3)',
    },
    {
      label: 'Risk Score', value: `${stats.risk_score ?? 0}`,
      icon: <AlertTriangle size={22} color="#ef4444" />, color: '#ef4444', glowColor: 'rgba(239,68,68,0.3)',
    },
    {
      label: 'Open Positions', value: stats.open_positions ?? 0,
      icon: <Activity size={22} color="#06b6d4" />, color: '#06b6d4', glowColor: 'rgba(6,182,212,0.3)',
    },
    {
      label: 'Total Trades', value: stats.total_trades ?? 0,
      icon: <BarChart2 size={22} color="#a78bfa" />, color: '#a78bfa', glowColor: 'rgba(167,139,250,0.3)',
    },
    {
      label: 'Attacks Simulated', value: stats.total_attacks ?? 0,
      icon: <Zap size={22} color="#f97316" />, color: '#f97316', glowColor: 'rgba(249,115,22,0.3)',
    },
  ] : []

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: '1.8rem', fontWeight: 800 }}>
          Trading <span className="gradient-text">Dashboard</span>
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
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false}
                tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false}
                tickFormatter={(v) => `$${(v/1000).toFixed(1)}k`} />
              <Tooltip contentStyle={{ background: '#0d1429', border: '1px solid rgba(99,179,237,0.2)', borderRadius: 8, color: '#e2e8f0' }}
                formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Value']} />
              <Area type="monotone" dataKey="value" stroke="#00d4ff" strokeWidth={2} fill="url(#portfolioGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Market Heatmap */}
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 700 }}>Market Heatmap</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {(heatmap || []).map((s: any) => (
              <motion.div key={s.sector} whileHover={{ scale: 1.05 }} style={{
                padding: '10px 8px', borderRadius: 10, textAlign: 'center',
                background: s.change >= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                border: `1px solid ${s.change >= 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                cursor: 'default',
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', marginBottom: 4 }}>{s.sector}</div>
                <div style={{ fontWeight: 700, color: s.change >= 0 ? 'var(--color-success)' : 'var(--color-danger)', fontSize: '0.9rem' }}>
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
              <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.01, x: 4 }}
                className="glass-light" style={{ padding: 14, cursor: 'pointer' }}>
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
