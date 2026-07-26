import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Lightbulb, Brain } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'
import api from '../services/api'

export default function ExplainableAIPage() {
  const [modelId, setModelId] = useState('')
  const [symbol, setSymbol] = useState('AAPL')
  const [shapData, setShapData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const { data: models } = useQuery({
    queryKey: ['ml-models'],
    queryFn: () => api.get('/ml/models').then(r => r.data.models.filter((m: any) => m.status === 'ready')),
  })

  const fetchExplanation = async () => {
    if (!modelId) return
    setLoading(true)
    try {
      const res = await api.get(`/ml/explain/${modelId}?symbol=${symbol}`)
      setShapData(res.data)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const colors = ['#00d4ff', '#7c3aed', '#10b981', '#f59e0b', '#f97316', '#ef4444', '#06b6d4', '#a78bfa']

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: '1.8rem', fontWeight: 800 }}>
          Explainable <span className="gradient-text">AI</span>
        </h1>
        <p style={{ color: 'var(--color-muted)', margin: 0 }}>Understand why the AI makes its predictions using SHAP values</p>
      </motion.div>

      {/* Controls */}
      <div className="glass" style={{ padding: 20, marginBottom: 24, display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)', display: 'block', marginBottom: 5 }}>Model</label>
          <select className="input-field" value={modelId} onChange={e => setModelId(e.target.value)}>
            <option value="">Select a trained model…</option>
            {(models || []).map((m: any) => (
              <option key={m.id} value={m.id}>{m.name} · {m.model_type} · {m.symbol}</option>
            ))}
          </select>
        </div>
        <div style={{ width: 140 }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)', display: 'block', marginBottom: 5 }}>Symbol</label>
          <input className="input-field" value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} />
        </div>
        <motion.button className="btn-primary" onClick={fetchExplanation} disabled={!modelId || loading}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          style={{ padding: '12px 24px', opacity: !modelId || loading ? 0.7 : 1 }}>
          {loading ? 'Explaining…' : '🔍 Explain'}
        </motion.button>
      </div>

      {!shapData && !loading && (
        <div className="glass" style={{ padding: 60, textAlign: 'center' }}>
          <Lightbulb size={64} opacity={0.2} style={{ marginBottom: 16 }} />
          <h3 style={{ color: 'var(--color-muted)', fontWeight: 400 }}>Select a model and click Explain to see SHAP values</h3>
        </div>
      )}

      {loading && (
        <div className="glass" style={{ padding: 60, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" />
        </div>
      )}

      {shapData && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Explainability Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            {/* Feature Importance */}
            <div className="glass" style={{ padding: 24 }}>
              <h3 style={{ margin: '0 0 18px', fontWeight: 700 }}>
                🏆 Global Feature Importance (SHAP)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={shapData.feature_importance?.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="feature" tick={{ fontSize: 10, fill: '#e2e8f0' }} tickLine={false} axisLine={false} width={130} />
                  <Tooltip contentStyle={{ background: '#0d1429', border: '1px solid rgba(99,179,237,0.2)', borderRadius: 6, fontSize: '0.75rem' }}
                    formatter={(v: any) => [Number(v).toFixed(6), 'SHAP Value']} />
                  <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                    {shapData.feature_importance?.slice(0, 10).map((_: any, i: number) => (
                      <Cell key={i} fill={colors[i % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Waterfall (single prediction) */}
            <div className="glass" style={{ padding: 24 }}>
              <h3 style={{ margin: '0 0 18px', fontWeight: 700 }}>⚡ SHAP Waterfall (Latest Prediction)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(shapData.waterfall || []).slice(0, 10).map((item: any, i: number) => {
                  const isPositive = item.shap_value > 0
                  const pct = Math.min(Math.abs(item.shap_value) / (shapData.waterfall?.[0]?.shap_value || 1) * 100, 100)
                  return (
                    <motion.div key={item.feature} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <div style={{ width: 110, fontSize: '0.78rem', color: 'var(--color-text)', textAlign: 'right', flexShrink: 0 }}>{item.feature}</div>
                        <div style={{ flex: 1, height: 20, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, delay: i * 0.05 }}
                            style={{
                              height: '100%', borderRadius: 4,
                              background: isPositive ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #ef4444, #dc2626)',
                            }}
                          />
                        </div>
                        <div style={{ width: 80, fontSize: '0.75rem', fontWeight: 600, color: isPositive ? 'var(--color-success)' : 'var(--color-danger)', textAlign: 'right' }}>
                          {isPositive ? '+' : ''}{item.shap_value.toFixed(5)}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
              <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Base value: {shapData.base_value}</div>
                {shapData.note && <div style={{ fontSize: '0.75rem', color: 'var(--color-warning)', marginTop: 4 }}>ℹ {shapData.note}</div>}
              </div>
            </div>
          </div>

          {/* Feature Explanation Cards */}
          <div className="glass" style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 18px', fontWeight: 700 }}>📖 Feature Explanations</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {(shapData.feature_importance || []).slice(0, 12).map((feat: any, i: number) => (
                <div key={feat.feature} className="glass-light" style={{ padding: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: colors[i % colors.length], marginBottom: 6 }}>{feat.feature}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: 8 }}>
                    Importance: {feat.importance.toFixed(6)}
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: `${Math.min(feat.importance / (shapData.feature_importance[0]?.importance || 1) * 100, 100)}%`,
                      background: colors[i % colors.length],
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
