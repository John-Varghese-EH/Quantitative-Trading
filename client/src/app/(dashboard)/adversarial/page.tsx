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
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Play, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts'
import api from '@/services/api'
import toast from 'react-hot-toast'

const ATTACK_COLORS: Record<string, string> = {
  fgsm: '#ef4444',
  pgd: '#f97316',
  data_poisoning: '#eab308',
  label_flipping: '#a855f7',
  feature_manipulation: '#ec4899',
  noise_injection: '#06b6d4',
}

export default function AdversarialPage() {
  const [attackType, setAttackType] = useState('fgsm')
  const [modelId, setModelId] = useState('')
  const [symbol, setSymbol] = useState('AAPL')
  const [epsilon, setEpsilon] = useState(0.01)
  const [result, setResult] = useState<any>(null)

  const { data: attackTypes } = useQuery({
    queryKey: ['attack-types'],
    queryFn: () => api.get('/attacks/types').then(r => r.data.attacks),
  })

  const { data: models } = useQuery({
    queryKey: ['ml-models'],
    queryFn: () => api.get('/ml/models').then(r => r.data.models.filter((m: any) => m.status === 'ready')),
  })

  const { data: history } = useQuery({
    queryKey: ['attack-history'],
    queryFn: () => api.get('/attacks/history').then(r => r.data.history),
    refetchInterval: 10_000,
  })

  const attackMutation = useMutation({
    mutationFn: (body: any) => api.post('/attacks/simulate', body),
    onSuccess: (res) => {
      setResult(res.data)
      toast.error(`⚔️ Attack launched! ${res.data.attack_success_rate}% success rate`)
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Attack failed'),
  })

  const handleAttack = () => {
    if (!modelId) return toast.error('Select a trained model')
    attackMutation.mutate({ model_id: modelId, attack_type: attackType, symbol, params: { epsilon } })
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: '1.8rem', fontWeight: 800 }}>
          Adversarial <span style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Attacks</span>
        </h1>
        <p style={{ color: 'var(--color-muted)', margin: 0 }}>Simulate adversarial attacks on trained ML models</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
        {/* Attack Config */}
        <div>
          <div className="glass" style={{ padding: 24, marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={18} color="#ef4444" /> Configure Attack
            </h3>

            {/* Attack Type */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {(attackTypes || []).map((a: any) => (
                <button key={a.id} onClick={() => setAttackType(a.id)} style={{
                  padding: '11px 14px', borderRadius: 10,
                  border: `1px solid ${attackType === a.id ? ATTACK_COLORS[a.id] || '#ef4444' : 'var(--color-border)'}`,
                  background: attackType === a.id ? `${ATTACK_COLORS[a.id] || '#ef4444'}18` : 'transparent',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: attackType === a.id ? ATTACK_COLORS[a.id] || '#ef4444' : 'var(--color-text)' }}>{a.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: 2 }}>{a.description}</div>
                  <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4, marginTop: 4, display: 'inline-block', color: 'var(--color-muted)' }}>{a.category}</span>
                </button>
              ))}
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
              {['fgsm', 'pgd'].includes(attackType) && (
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)', display: 'block', marginBottom: 5 }}>
                    Epsilon (perturbation): {epsilon}
                  </label>
                  <input type="range" min={0.001} max={0.2} step={0.001} value={epsilon} onChange={e => setEpsilon(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#ef4444' }} />
                </div>
              )}
              <motion.button className="btn-danger" onClick={handleAttack}
                disabled={attackMutation.isPending} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                style={{ padding: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: attackMutation.isPending ? 0.7 : 1 }}>
                <Zap size={16} />{attackMutation.isPending ? 'Attacking…' : '⚡ Launch Attack'}
              </motion.button>
            </div>
          </div>

          {/* Attack History */}
          <div className="glass" style={{ padding: 20 }}>
            <h4 style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '0.9rem' }}>Attack History</h4>
            {(!history || history.length === 0) ? (
              <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No attacks yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {history.slice(0, 5).map((h: any) => (
                  <div key={h.id} className="glass-light" style={{ padding: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem' }}>
                      <span style={{ color: ATTACK_COLORS[h.attack_type] || '#ef4444', fontWeight: 600 }}>{h.attack_type.replace(/_/g, ' ').toUpperCase()}</span>
                      <span style={{ fontWeight: 700, color: h.success_rate > 30 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                        {h.success_rate?.toFixed(1)}% success
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: 3 }}>
                      Confidence drop: {h.confidence_drop?.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div>
          {!result && !attackMutation.isPending && (
            <div className="glass" style={{ padding: 60, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
              <AlertTriangle size={64} opacity={0.2} color="#ef4444" style={{ marginBottom: 16 }} />
              <h3 style={{ color: 'var(--color-muted)', fontWeight: 400 }}>Configure and launch an attack to see results</h3>
            </div>
          )}

          {attackMutation.isPending && (
            <div className="glass" style={{ padding: 60, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
              <div className="spinner" />
            </div>
          )}

          {result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Attack Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                {[
                  { l: 'Attack Success Rate', v: `${result.attack_success_rate}%`, color: result.attack_success_rate > 30 ? 'var(--color-danger)' : 'var(--color-success)' },
                  { l: 'Confidence Drop', v: `${result.confidence_drop_pct}%`, color: 'var(--color-warning)' },
                  { l: 'Predictions Flipped', v: `${result.n_flipped_predictions} / ${result.n_samples}`, color: 'var(--color-danger)' },
                  { l: 'Original Confidence', v: `${result.original_avg_confidence}%`, color: 'var(--color-success)' },
                  { l: 'Adversarial Confidence', v: `${result.adversarial_avg_confidence}%`, color: 'var(--color-danger)' },
                  { l: 'Attack Type', v: result.attack_type?.replace(/_/g, ' ').toUpperCase(), color: ATTACK_COLORS[result.attack_type] || '#ef4444' },
                ].map(m => (
                  <div key={m.l} className="glass" style={{ padding: 16 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{m.l}</div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: m.color }}>{m.v}</div>
                  </div>
                ))}
              </div>

              {/* Before vs After Comparison */}
              <div className="glass" style={{ padding: 24, marginBottom: 16 }}>
                <h3 style={{ margin: '0 0 16px', fontWeight: 700 }}>Prediction Comparison: Original vs Adversarial</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Original Predictions</div>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={result.comparison}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="index" tick={{ fontSize: 9, fill: '#64748b' }} />
                        <YAxis domain={[0, 1]} tick={{ fontSize: 9, fill: '#64748b' }} />
                        <Tooltip contentStyle={{ background: '#0d1429', border: 'none', borderRadius: 6, fontSize: '0.75rem' }} />
                        <Bar dataKey="original_prob" radius={[3,3,0,0]}>
                          {result.comparison.map((d: any, i: number) => (
                            <Cell key={i} fill={d.original_pred === 1 ? '#10b981' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#ef4444', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Adversarial Predictions ⚠</div>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={result.comparison}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="index" tick={{ fontSize: 9, fill: '#64748b' }} />
                        <YAxis domain={[0, 1]} tick={{ fontSize: 9, fill: '#64748b' }} />
                        <Tooltip contentStyle={{ background: '#0d1429', border: 'none', borderRadius: 6, fontSize: '0.75rem' }} />
                        <Bar dataKey="adversarial_prob" radius={[3,3,0,0]}>
                          {result.comparison.map((d: any, i: number) => (
                            <Cell key={i} fill={d.flipped ? '#f97316' : (d.adversarial_pred === 1 ? '#10b981' : '#ef4444')} opacity={d.flipped ? 1 : 0.6} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: '0.78rem' }}>
                  {[
                    { color: '#10b981', label: 'BUY (original)' },
                    { color: '#ef4444', label: 'SELL (original)' },
                    { color: '#f97316', label: 'Flipped by attack' },
                  ].map(l => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-muted)' }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: l.color }} />{l.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Flipped predictions table */}
              <div className="glass" style={{ padding: 20 }}>
                <h4 style={{ margin: '0 0 12px', fontWeight: 700 }}>
                  Flipped Predictions <span style={{ color: 'var(--color-danger)', fontWeight: 400, fontSize: '0.85rem' }}>({result.comparison.filter((d: any) => d.flipped).length} flipped)</span>
                </h4>
                <table className="data-table">
                  <thead><tr><th>#</th><th>Original Pred</th><th>Adv. Pred</th><th>Orig. Prob</th><th>Adv. Prob</th><th>Flipped</th></tr></thead>
                  <tbody>
                    {result.comparison.slice(0, 10).map((d: any) => (
                      <tr key={d.index} style={{ background: d.flipped ? 'rgba(249,115,22,0.05)' : 'transparent' }}>
                        <td style={{ color: 'var(--color-muted)' }}>{d.index}</td>
                        <td><span className={`badge ${d.original_pred ? 'badge-success' : 'badge-danger'}`}>{d.original_pred ? 'BUY' : 'SELL'}</span></td>
                        <td><span className={`badge ${d.adversarial_pred ? 'badge-success' : 'badge-danger'}`}>{d.adversarial_pred ? 'BUY' : 'SELL'}</span></td>
                        <td>{(d.original_prob * 100).toFixed(1)}%</td>
                        <td>{(d.adversarial_prob * 100).toFixed(1)}%</td>
                        <td>{d.flipped ? <span style={{ color: '#f97316', fontWeight: 700 }}>⚠ YES</span> : <span style={{ color: 'var(--color-muted)' }}>—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
