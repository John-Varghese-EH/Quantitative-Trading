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
  DollarSign, TrendingUp, TrendingDown, Brain, Activity,
  Zap, BarChart2, Target, AlertTriangle, Briefcase, Newspaper,
  ChevronRight, ArrowUpRight, ArrowDownRight, Server, Shield
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '@/services/api'
import { useAppStore } from '@/store/useAppStore'
import { formatCurrency, formatCurrencyCompact } from '@/utils/currency'
import Link from 'next/link'

const CARD_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ 
    opacity: 1, y: 0, 
    transition: { delay: i * 0.05, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } 
  }),
}

interface StatCard {
  label: string
  value: string | number
  change?: string
  positive?: boolean
  icon: React.ReactNode
  color: string
}

function StatCardComponent({ card, index }: { card: StatCard; index: number }) {
  return (
    <motion.div
      className="glass"
      custom={index}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}
      variants={CARD_VARIANTS}
      style={{
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        borderTop: `3px solid ${card.color}`,
        borderRadius: 'var(--radius-lg)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        <div>
          <p style={{ margin: '0 0 10px', color: 'var(--color-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{card.label}</p>
          <h3 style={{ margin: '0 0 10px', fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
            {card.value}
          </h3>
          {card.change && (
            <span style={{ 
              fontSize: '0.75rem', 
              color: card.positive ? 'var(--color-success)' : 'var(--color-danger)', 
              fontWeight: 700,
              background: `color-mix(in srgb, ${card.color} 15%, transparent)`,
              padding: '4px 10px',
              borderRadius: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}>
              {card.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {card.change}
            </span>
          )}
        </div>
        <div style={{
          width: 52, height: 52, borderRadius: 16,
          background: `color-mix(in srgb, ${card.color} 12%, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: card.color,
        }}>
          {card.icon}
        </div>
      </div>
      
      {/* Decorative ambient background */}
      <div style={{
        position: 'absolute', right: -20, bottom: -20, width: 120, height: 120,
        background: `radial-gradient(circle, color-mix(in srgb, ${card.color} 15%, transparent) 0%, transparent 70%)`,
        zIndex: 0, borderRadius: '50%', pointerEvents: 'none'
      }} />
    </motion.div>
  )
}

export default function DashboardPage() {
  const { currency } = useAppStore()
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
      label: 'Portfolio Value', value: formatCurrency(stats.portfolio_value, currency),
      change: `${Math.abs(stats.daily_pnl_pct)}%`, positive: stats.daily_pnl_pct >= 0,
      icon: <DollarSign size={24} />, color: 'var(--color-accent)'
    },
    {
      label: 'Daily P&L', value: `${stats.daily_pnl >= 0 ? '+' : ''}${formatCurrency(Math.abs(stats.daily_pnl), currency)}`,
      positive: stats.daily_pnl >= 0,
      icon: stats.daily_pnl >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />,
      color: stats.daily_pnl >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
    },
    {
      label: 'AI Confidence', value: `${stats.ai_confidence ?? 0}%`,
      icon: <Brain size={24} />, color: '#8B5CF6'
    },
    {
      label: 'Model Accuracy', value: `${stats.model_accuracy ?? 0}%`,
      icon: <Target size={24} />, color: 'var(--color-warning)'
    },
    {
      label: 'Risk Score', value: `${stats.risk_score ?? 0}`,
      icon: <AlertTriangle size={24} />, color: 'var(--color-danger)'
    },
    {
      label: 'Open Positions', value: stats.open_positions ?? 0,
      icon: <Activity size={24} />, color: '#10B981'
    },
    {
      label: 'Total Trades', value: stats.total_trades ?? 0,
      icon: <BarChart2 size={24} />, color: '#F43F5E'
    },
    {
      label: 'Attacks Simulated', value: stats.total_attacks ?? 0,
      icon: <Zap size={24} />, color: '#F59E0B'
    },
  ] : []

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good Morning'
    if (h < 17) return 'Good Afternoon'
    return 'Good Evening'
  })()

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Header Section */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 8px', fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text)' }}>
            {greeting}
          </h1>
          <p style={{ color: 'var(--color-muted)', margin: 0, fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 8px var(--color-success)' }} />
            Algorithmic Sandbox <span style={{ opacity: 0.5 }}>•</span> Paper Trading Mode
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { label: 'Train Model', href: '/ai-prediction', color: 'var(--color-accent)', icon: <Brain size={16} /> },
            { label: 'Run Backtest', href: '/trading', color: 'var(--color-success)', icon: <Activity size={16} /> },
            { label: 'Launch Attack', href: '/adversarial', color: 'var(--color-danger)', icon: <Shield size={16} /> },
          ].map(action => (
            <Link key={action.label} href={action.href} style={{
              padding: '10px 18px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700,
              background: `color-mix(in srgb, ${action.color} 10%, transparent)`, 
              border: `1px solid color-mix(in srgb, ${action.color} 30%, transparent)`,
              color: action.color, textDecoration: 'none', transition: 'all 0.2s',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: `0 4px 12px color-mix(in srgb, ${action.color} 10%, transparent)`
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = action.color;
              e.currentTarget.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = `color-mix(in srgb, ${action.color} 10%, transparent)`;
              e.currentTarget.style.color = action.color;
            }}>
              {action.icon}
              {action.label}
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Stat Cards Grid */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
          {CARDS.map((c, i) => <StatCardComponent key={c.label} card={c} index={i} />)}
        </div>
      )}

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 24 }}>
        
        {/* Portfolio Growth Chart */}
        <motion.div className="glass" style={{ padding: '24px 24px 12px', gridColumn: 'span 2' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.25rem' }}>Portfolio Growth (30 Days)</h3>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-muted)', background: 'var(--color-border)', padding: '4px 12px', borderRadius: 20 }}>
              Live Data
            </span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={portfolio?.history || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-muted)', fontWeight: 600 }} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} dy={10} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)', fontWeight: 600 }} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrencyCompact(v, currency)} />
              <Tooltip 
                contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontWeight: 600 }}
                itemStyle={{ color: 'var(--color-accent)', fontWeight: 800 }}
                formatter={(v: any) => [formatCurrency(v, currency), 'Value']} 
              />
              <Area type="monotone" dataKey="value" stroke="var(--color-accent)" strokeWidth={3} fill="url(#portfolioGrad)" activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--color-accent)' }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Market Heatmap */}
        <motion.div className="glass" style={{ padding: 24 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 style={{ margin: '0 0 20px', fontWeight: 800, fontSize: '1.25rem' }}>Sector Heatmap</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {(heatmap || []).map((s: any) => {
              const isPositive = s.change >= 0;
              const colorBase = isPositive ? 'var(--color-success)' : 'var(--color-danger)';
              return (
                <motion.div key={s.sector} whileHover={{ scale: 1.02 }} transition={{ duration: 0.15 }} style={{
                  padding: '16px', borderRadius: 12, textAlign: 'center',
                  background: `color-mix(in srgb, ${colorBase} 10%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${colorBase} 25%, transparent)`,
                  cursor: 'default',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center'
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text)', marginBottom: 4, fontWeight: 700 }}>{s.sector}</div>
                  <div style={{ fontWeight: 800, color: colorBase, fontSize: '1.1rem', fontVariantNumeric: 'tabular-nums' }}>
                    {isPositive ? '+' : ''}{s.change}%
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 24 }}>
        {/* Portfolio Holdings */}
        <motion.div className="glass" style={{ padding: 24, display: 'flex', flexDirection: 'column' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Briefcase size={20} style={{ color: 'var(--color-accent)' }} /> Active Holdings
            </h3>
            <Link href="/trading" style={{ fontSize: '0.85rem', color: 'var(--color-accent)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View All <ChevronRight size={14} />
            </Link>
          </div>
          {(!holdings || holdings.length === 0) ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-muted)', background: 'var(--color-glass-light)', borderRadius: 12, fontWeight: 600 }}>No active positions in sandbox</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left', color: 'var(--color-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Asset</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right', color: 'var(--color-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shares</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right', color: 'var(--color-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Price</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right', color: 'var(--color-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h: any, i: number) => (
                    <motion.tr key={h.symbol} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '16px 8px', fontWeight: 800 }}>{h.symbol}</td>
                      <td style={{ padding: '16px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{h.shares}</td>
                      <td style={{ padding: '16px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--color-muted)', fontWeight: 600 }}>{formatCurrency(h.avg_price, currency)}</td>
                      <td style={{ padding: '16px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 800, color: h.pnl >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {formatCurrency(h.shares * h.current_price, currency)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* News Feed */}
        <motion.div className="glass" style={{ padding: 24 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h3 style={{ margin: '0 0 20px', fontWeight: 800, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Newspaper size={20} style={{ color: 'var(--color-accent)' }} /> Market Signals
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {(news || []).slice(0, 4).map((article: any, i: number) => {
              const isBullish = article.impact === 'bullish';
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  style={{ 
                    padding: '16px', borderRadius: 12, cursor: 'pointer',
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', gap: 16, alignItems: 'flex-start'
                  }}>
                  <div style={{ 
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: `color-mix(in srgb, ${isBullish ? 'var(--color-success)' : 'var(--color-danger)'} 15%, transparent)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isBullish ? 'var(--color-success)' : 'var(--color-danger)'
                  }}>
                    {isBullish ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{article.source}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, fontWeight: 600, color: 'var(--color-text)' }}>{article.title}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* System Status Footer */}
      <motion.div className="glass" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {[
            { label: 'API Connection', ok: true },
            { label: 'ML Engine', ok: true },
            { label: 'Market Feed', ok: true },
            { label: 'Security Module', ok: true },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', fontWeight: 600 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.ok ? 'var(--color-success)' : 'var(--color-danger)', boxShadow: s.ok ? '0 0 10px var(--color-success)' : '0 0 10px var(--color-danger)' }} />
              <span style={{ color: 'var(--color-text)' }}>{s.label}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Server size={14} /> Systems Operational
        </div>
      </motion.div>
    </div>
  )
}
