import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../services/api'

const COLORS = ['#00d4ff', '#7c3aed', '#10b981', '#f59e0b', '#f97316', '#ef4444']

export default function AnalyticsPage() {
  const { data: stats } = useQuery({ queryKey: ['dashboard-stats'], queryFn: () => api.get('/dashboard/stats').then(r => r.data) })
  const { data: portfolioData } = useQuery({ queryKey: ['portfolio-history-90'], queryFn: () => api.get('/dashboard/portfolio-history?days=90').then(r => r.data) })
  const { data: attackHistory } = useQuery({ queryKey: ['attack-history'], queryFn: () => api.get('/attacks/history').then(r => r.data.history) })
  const { data: defenseHistory } = useQuery({ queryKey: ['defense-history'], queryFn: () => api.get('/defenses/history').then(r => r.data.history) })
  const { data: btHistory } = useQuery({ queryKey: ['backtest-history'], queryFn: () => api.get('/trading/backtest/history').then(r => r.data.history) })
  const { data: models } = useQuery({ queryKey: ['ml-models'], queryFn: () => api.get('/ml/models').then(r => r.data.models) })

  // Attack distribution by type
  const attackDist = attackHistory ? Object.entries(
    attackHistory.reduce((acc: any, a: any) => { acc[a.attack_type] = (acc[a.attack_type] || 0) + 1; return acc }, {})
  ).map(([name, value]) => ({ name, value })) : []

  // Model accuracy distribution
  const modelAccuracy = (models || []).filter((m: any) => m.accuracy).map((m: any) => ({
    name: m.name.slice(0, 10),
    accuracy: Math.round(m.accuracy * 100),
    type: m.model_type,
  }))

  // Strategy performance
  const strategyPerf = (btHistory || []).map((b: any) => ({
    strategy: b.strategy.replace(/_/g, ' '),
    return: b.total_return,
    sharpe: b.sharpe_ratio,
    winRate: b.win_rate,
  }))

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: '1.8rem', fontWeight: 800 }}>
          Analytics <span className="gradient-text">Dashboard</span>
        </h1>
        <p style={{ color: 'var(--color-muted)', margin: 0 }}>Comprehensive performance analytics and insights</p>
      </motion.div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { l: 'Total Models', v: stats?.total_models ?? 0, color: '#00d4ff' },
          { l: 'Backtests Run', v: btHistory?.length ?? 0, color: '#10b981' },
          { l: 'Attacks Simulated', v: attackHistory?.length ?? 0, color: '#ef4444' },
          { l: 'Defenses Applied', v: defenseHistory?.length ?? 0, color: '#7c3aed' },
        ].map(s => (
          <div key={s.l} className="glass" style={{ padding: 18 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{s.l}</div>
            <div style={{ fontWeight: 900, fontSize: '2rem', color: s.color }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Portfolio Growth */}
      <div className="glass" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontWeight: 700 }}>Portfolio Growth (90 days)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={portfolioData?.history || []}>
            <defs>
              <linearGradient id="portfolioGrad90" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={v => v.slice(5)} />
            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(1)}k`} />
            <Tooltip contentStyle={{ background: '#0d1429', border: '1px solid rgba(99,179,237,0.2)', borderRadius: 8, fontSize: '0.8rem' }} formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Value']} />
            <Area type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2} fill="url(#portfolioGrad90)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Model Accuracy */}
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 700 }}>Model Accuracy Comparison</h3>
          {modelAccuracy.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-muted)' }}>Train models to see comparison</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={modelAccuracy}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={{ background: '#0d1429', border: 'none', borderRadius: 6, fontSize: '0.75rem' }} />
                <Bar dataKey="accuracy" radius={[4,4,0,0]}>
                  {modelAccuracy.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Attack Distribution Pie */}
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 700 }}>Attack Type Distribution</h3>
          {attackDist.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-muted)' }}>No attacks simulated yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={attackDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {attackDist.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0d1429', border: 'none', borderRadius: 6, fontSize: '0.75rem' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Strategy Performance */}
      <div className="glass" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontWeight: 700 }}>Strategy Performance Comparison</h3>
        {strategyPerf.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-muted)' }}>Run backtests to compare strategies</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={strategyPerf}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="strategy" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ background: '#0d1429', border: 'none', borderRadius: 6, fontSize: '0.75rem' }} />
              <Bar dataKey="return" name="Total Return %" radius={[4,4,0,0]}>
                {strategyPerf.map((s: any, i: number) => <Cell key={i} fill={s.return >= 0 ? '#10b981' : '#ef4444'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Defense vs Attack */}
      <div className="glass" style={{ padding: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontWeight: 700 }}>Defense Effectiveness Scores</h3>
        {(!defenseHistory || defenseHistory.length === 0) ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-muted)' }}>Apply defenses to see effectiveness scores</div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={defenseHistory.slice(0, 10).map((d: any) => ({ type: d.defense_type.replace(/_/g, ' '), score: d.security_score }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="type" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#0d1429', border: 'none', borderRadius: 6, fontSize: '0.75rem' }} />
              <Bar dataKey="score" fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
