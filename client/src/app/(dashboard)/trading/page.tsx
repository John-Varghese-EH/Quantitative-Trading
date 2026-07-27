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
import { Activity, Play } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '@/services/api'
import toast from 'react-hot-toast'
import { useAppStore } from '@/store/useAppStore'
import { formatCurrency, formatCurrencyCompact } from '@/utils/currency'

const STRATEGIES = [
  { id: 'buy_and_hold', name: 'Buy and Hold', color: '#00d4ff', desc: 'Buy on day 1, hold to end' },
  { id: 'ma_crossover', name: 'MA Crossover', color: '#10b981', desc: 'Short vs long moving average' },
  { id: 'mean_reversion', name: 'Mean Reversion', color: '#f59e0b', desc: 'Trade on z-score deviations' },
  { id: 'momentum', name: 'Momentum', color: '#7c3aed', desc: 'Follow price momentum' },
  { id: 'ai_prediction', name: 'AI Strategy', color: '#f97316', desc: 'ML model signals' },
]

const SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'BTC-USD', 'SPY', 'AMZN']

export default function TradingSimulatorPage() {
  const { currency } = useAppStore()
  const [strategy, setStrategy] = useState('ma_crossover')
  const [symbol, setSymbol] = useState('AAPL')
  const [startDate, setStartDate] = useState('2022-01-01')
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10))
  const [capital, setCapital] = useState(10000)
  const [result, setResult] = useState<any>(null)

  const { data: history } = useQuery({
    queryKey: ['backtest-history'],
    queryFn: () => api.get('/trading/backtest/history').then(r => r.data.history),
  })

  const backtestMutation = useMutation({
    mutationFn: (body: any) => api.post('/trading/backtest', body),
    onSuccess: (res) => {
      setResult(res.data)
      toast.success('Backtest complete!')
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Backtest failed'),
  })

  const handleRun = () => {
    backtestMutation.mutate({ symbol, strategy, start_date: startDate, end_date: endDate, initial_capital: capital })
  }

  const activeStrategy = STRATEGIES.find(s => s.id === strategy)

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: '1.8rem', fontWeight: 800 }}>
          Trading <span className="gradient-text">Simulator</span>
        </h1>
        <p style={{ color: 'var(--color-muted)', margin: 0 }}>Backtest strategies on historical data - no real money</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
        {/* Config Panel */}
        <div>
          <div className="glass" style={{ padding: 24, marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 18px', fontWeight: 700 }}>Strategy Config</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {STRATEGIES.map(s => (
                <button key={s.id} onClick={() => setStrategy(s.id)} style={{
                  padding: '11px 14px', borderRadius: 10, border: `1px solid ${strategy === s.id ? s.color : 'var(--color-border)'}`,
                  background: strategy === s.id ? `${s.color}18` : 'transparent',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: strategy === s.id ? s.color : 'var(--color-text)' }}>{s.name}</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--color-muted)', marginTop: 2 }}>{s.desc}</div>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)', display: 'block', marginBottom: 5 }}>Symbol</label>
                <select className="input-field" value={symbol} onChange={e => setSymbol(e.target.value)}>
                  {SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)', display: 'block', marginBottom: 5 }}>Start</label>
                  <input type="date" className="input-field" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ fontSize: '0.82rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)', display: 'block', marginBottom: 5 }}>End</label>
                  <input type="date" className="input-field" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ fontSize: '0.82rem' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)', display: 'block', marginBottom: 5 }}>Initial Capital ({currency})</label>
                <input type="number" className="input-field" value={capital} onChange={e => setCapital(Number(e.target.value))} min={100} />
              </div>
              <motion.button className="btn-primary" onClick={handleRun}
                disabled={backtestMutation.isPending} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                style={{ padding: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: backtestMutation.isPending ? 0.7 : 1 }}>
                <Play size={16} />{backtestMutation.isPending ? 'Running…' : 'Run Backtest'}
              </motion.button>
            </div>
          </div>

          {/* History */}
          <div className="glass" style={{ padding: 20 }}>
            <h4 style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '0.9rem' }}>Recent Backtests</h4>
            {(!history || history.length === 0) ? (
              <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No backtests yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {history.slice(0, 5).map((h: any) => (
                  <div key={h.id} className="glass-light" style={{ padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.83rem' }}>{h.symbol} · {h.strategy}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>Win: {h.win_rate}% · {h.total_trades} trades</div>
                      </div>
                      <div style={{ fontWeight: 700, color: h.total_return >= 0 ? 'var(--color-success)' : 'var(--color-danger)', fontSize: '0.9rem' }}>
                        {h.total_return >= 0 ? '+' : ''}{h.total_return?.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div>
          {!result && !backtestMutation.isPending && (
            <div className="glass" style={{ padding: 60, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={64} opacity={0.2} style={{ marginBottom: 16 }} />
              <h3 style={{ color: 'var(--color-muted)', fontWeight: 400 }}>Configure a strategy and run a backtest</h3>
            </div>
          )}

          {backtestMutation.isPending && (
            <div className="glass" style={{ padding: 60, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="spinner" />
            </div>
          )}

          {result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                {[
                  { l: 'Total Return', v: `${result.total_return >= 0 ? '+' : ''}${result.total_return?.toFixed(2)}%`, color: result.total_return >= 0 ? 'var(--color-success)' : 'var(--color-danger)' },
                  { l: 'Sharpe Ratio', v: result.sharpe_ratio?.toFixed(2), color: 'var(--color-text)' },
                  { l: 'Max Drawdown', v: `${result.max_drawdown?.toFixed(2)}%`, color: 'var(--color-danger)' },
                  { l: 'Win Rate', v: `${result.win_rate?.toFixed(1)}%`, color: 'var(--color-success)' },
                  { l: 'Final Value', v: formatCurrency(result.final_value, currency), color: 'var(--color-text)' },
                  { l: 'Total Trades', v: result.total_trades, color: 'var(--color-text)' },
                  { l: 'CAGR', v: `${result.cagr?.toFixed(2)}%`, color: 'var(--color-warning)' },
                  { l: 'Initial Capital', v: formatCurrency(result.initial_capital, currency), color: 'var(--color-text)' },
                ].map(stat => (
                  <div key={stat.l} className="glass" style={{ padding: 16 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{stat.l}</div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: stat.color }}>{stat.v}</div>
                  </div>
                ))}
              </div>

              {/* Equity Curve */}
              <div className="glass" style={{ padding: 24, marginBottom: 16 }}>
                <h3 style={{ margin: '0 0 16px', fontWeight: 700 }}>
                  Equity Curve - {activeStrategy?.name} on {result.symbol}
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={result.equity_curve}>
                    <defs>
                      <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={activeStrategy?.color} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={activeStrategy?.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={v => formatCurrencyCompact(v, currency)} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: '0.8rem' }}
                      formatter={(v: any) => [formatCurrency(v, currency), 'Portfolio Value']} />
                    <Area type="monotone" dataKey="value" stroke={activeStrategy?.color} strokeWidth={2} fill="url(#eqGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Trade Log */}
              {result.trade_log?.length > 0 && (
                <div className="glass" style={{ padding: 20 }}>
                  <h4 style={{ margin: '0 0 14px', fontWeight: 700 }}>Recent Trades</h4>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th><th>Type</th><th>Price</th><th>Shares</th><th>P&L</th><th>ROI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.trade_log.slice(-15).reverse().map((t: any, i: number) => (
                        <tr key={i}>
                          <td style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>{t.date}</td>
                          <td><span className={`badge ${t.type === 'BUY' ? 'badge-success' : 'badge-danger'}`}>{t.type}</span></td>
                          <td>{formatCurrency(t.price, currency)}</td>
                          <td>{t.shares}</td>
                          <td style={{ color: t.pnl >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                            {t.pnl !== undefined ? `${t.pnl >= 0 ? '+' : ''}${formatCurrency(Math.abs(t.pnl), currency)}` : '-'}
                          </td>
                          <td style={{ color: t.roi >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                            {t.roi !== undefined ? `${t.roi >= 0 ? '+' : ''}${t.roi?.toFixed(2)}%` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
