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

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Shield, ShieldCheck } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import api from '@/services/api'
import toast from 'react-hot-toast'

const DEFENSE_DESCRIPTIONS: Record<string, { color: string; risk: string }> = {
  adversarial_training: { color: '#10b981', risk: 'Best against gradient attacks' },
  input_validation: { color: '#00d4ff', risk: 'Blocks anomalous inputs' },
  outlier_detection: { color: '#7c3aed', risk: 'Removes statistical outliers' },
  defensive_distillation: { color: '#f59e0b', risk: 'Smooths gradient landscape' },
  feature_sanitization: { color: '#06b6d4', risk: 'PCA-based denoising' },
}

export default function DefensePage() {
  const [defenseType, setDefenseType] = useState('adversarial_training')
  const [modelId, setModelId] = useState('')
  const [symbol, setSymbol] = useState('AAPL')
  const [result, setResult] = useState<any>(null)

  const { data: defenseTypes } = useQuery({
    queryKey: ['defense-types'],
    queryFn: () => api.get('/defenses/types').then(r => r.data.defenses),
  })

  const { data: models } = useQuery({
    queryKey: ['ml-models'],
    queryFn: () => api.get('/ml/models').then(r => r.data.models.filter((m: any) => m.status === 'ready')),
  })

  const { data: history } = useQuery({
    queryKey: ['defense-history'],
    queryFn: () => api.get('/defenses/history').then(r => r.data.history),
  })

  const defenseMutation = useMutation({
    mutationFn: (body: any) => api.post('/defenses/apply', body),
    onSuccess: (res) => {
      setResult(res.data)
      toast.success(`Defense applied! Security score: ${res.data.security_score}`)
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Defense failed'),
  })

  const radarData = result ? [
    { metric: 'Accuracy', before: result.accuracy_before * 100, after: result.accuracy_after * 100 },
    { metric: 'Security', before: 30, after: result.security_score },
    { metric: 'Robustness', before: 25, after: Math.min(100, result.security_score + 10) },
    { metric: 'Confidence', before: 50, after: Math.min(100, result.accuracy_after * 90) },
    { metric: 'Resilience', before: 20, after: Math.min(100, result.security_score - 5) },
  ] : []

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: '1.8rem', fontWeight: 800 }}>
          Defense <span className="gradient-text">Module</span>
        </h1>
        <p style={{ color: 'var(--color-muted)', margin: 0 }}>Apply defense mechanisms to harden AI models against attacks</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
        {/* Config */}
        <div>
          <div className="glass" style={{ padding: 24, marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={18} color="var(--color-success)" /> Apply Defense
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {(defenseTypes || []).map((d: any) => {
                const meta = DEFENSE_DESCRIPTIONS[d.id] || { color: '#10b981', risk: '' }
                return (
                  <button key={d.id} onClick={() => setDefenseType(d.id)} style={{
                    padding: '11px 14px', borderRadius: 10,
                    border: `1px solid ${defenseType === d.id ? meta.color : 'var(--color-border)'}`,
                    background: defenseType === d.id ? `${meta.color}15` : 'transparent',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Shield size={14} color={defenseType === d.id ? meta.color : 'var(--color-muted)'} />
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: defenseType === d.id ? meta.color : 'var(--color-text)' }}>{d.name}</div>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: 3, paddingLeft: 22 }}>{d.description}</div>
                    <div style={{ fontSize: '0.68rem', color: meta.color, marginTop: 3, paddingLeft: 22, display: 'flex', alignItems: 'center', gap: 4 }}><ShieldCheck size={12} /> {meta.risk}</div>
                  </button>
                )
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)', display: 'block', marginBottom: 5 }}>Target Model</label>
                <select className="input-field" value={modelId} onChange={e => setModelId(e.target.value)}>
                  <option value="">Select a trained model…</option>
                  {(models || []).map((m: any) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.symbol})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)', display: 'block', marginBottom: 5 }}>Symbol</label>
                <input className="input-field" value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} />
              </div>
              <button onClick={() => { if (!modelId) return toast.error('Select a model'); defenseMutation.mutate({ model_id: modelId, defense_type: defenseType, symbol }) }} disabled={defenseMutation.isPending} className="btn-primary" style={{ width: '100%', padding: 14, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Shield size={18} /> {defenseMutation.isPending ? 'Applying…' : 'Apply Defense'}
              </button>
            </div>
          </div>

          {/* History */}
          <div className="glass" style={{ padding: 20 }}>
            <h4 style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '0.9rem' }}>Defense History</h4>
            {(!history || history.length === 0) ? (
              <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No defenses applied yet</p>
            ) : (
              history.slice(0, 5).map((h: any) => (
                <div key={h.id} className="glass-light" style={{ padding: 10, marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.83rem', color: 'var(--color-success)' }}>{h.defense_type.replace(/_/g, ' ')}</span>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Score: {h.security_score}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: 3 }}>
                    {(h.accuracy_before * 100).toFixed(1)}% → {(h.accuracy_after * 100).toFixed(1)}% accuracy
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Results */}
        <div>
          {!result && !defenseMutation.isPending && (
            <div className="glass" style={{ padding: 60, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
              <Shield size={64} opacity={0.2} color="#10b981" style={{ marginBottom: 16 }} />
              <h3 style={{ color: 'var(--color-muted)', fontWeight: 400 }}>Select a defense mechanism and apply it to see results</h3>
            </div>
          )}

          {defenseMutation.isPending && (
            <div className="glass" style={{ padding: 60, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
              <div className="spinner" />
            </div>
          )}

          {result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Score Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                {[
                  { l: 'Security Score', v: result.security_score, color: 'var(--color-success)', suffix: '' },
                  { l: 'Accuracy Before', v: (result.accuracy_before * 100).toFixed(1), color: 'var(--color-warning)', suffix: '%' },
                  { l: 'Accuracy After', v: (result.accuracy_after * 100).toFixed(1), color: 'var(--color-success)', suffix: '%' },
                  { l: 'Improvement', v: result.improvement_pct >= 0 ? `+${result.improvement_pct}` : result.improvement_pct, color: result.improvement_pct >= 0 ? 'var(--color-success)' : 'var(--color-danger)', suffix: '%' },
                  { l: 'Defense Type', v: result.defense_type.replace(/_/g, ' '), color: 'var(--color-primary)', suffix: '' },
                  { l: 'Status', v: 'Applied', color: 'var(--color-success)', suffix: '' },
                ].map(m => (
                  <div key={m.l} className="glass" style={{ padding: 16 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{m.l}</div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: m.color }}>{m.v}{m.suffix}</div>
                  </div>
                ))}
              </div>

              {/* Radar Chart */}
              <div className="glass" style={{ padding: 24, marginBottom: 16 }}>
                <h3 style={{ margin: '0 0 16px', fontWeight: 700 }}>Security Radar: Before vs After Defense</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'center' }}>
                  <ResponsiveContainer width="100%" height={260}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748b' }} />
                      <Radar name="Before" dataKey="before" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} />
                      <Radar name="After" dataKey="after" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>

                  {/* Before/After Bar */}
                  <div>
                    <div className="glass-light" style={{ padding: 20, marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>Before Defense</span>
                        <span style={{ fontWeight: 700, color: 'var(--color-warning)' }}>{(result.accuracy_before * 100).toFixed(1)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${result.accuracy_before * 100}%`, background: '#ef4444' }} />
                      </div>
                    </div>
                    <div className="glass-light" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>After Defense</span>
                        <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>{(result.accuracy_after * 100).toFixed(1)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${result.accuracy_after * 100}%` }} />
                      </div>
                    </div>

                    {/* Security Score Ring */}
                    <div style={{ textAlign: 'center', marginTop: 20 }}>
                      <div style={{
                        width: 100, height: 100, margin: '0 auto',
                        borderRadius: '50%', border: '6px solid var(--color-success)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 25px rgba(16,185,129,0.4)',
                      }}>
                        <div style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--color-success)' }}>{Math.round(result.security_score)}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--color-muted)' }}>SECURITY</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
