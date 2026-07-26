import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Search, RefreshCw } from 'lucide-react'
import api from '../services/api'

const SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'BTC-USD', 'ETH-USD', 'SPY', 'AMZN', 'META']
const INTERVALS = [{ v: '1d', l: '1 Day' }, { v: '1wk', l: '1 Week' }, { v: '1mo', l: '1 Month' }]

function CustomCandlestick(props: any) {
  const { x, y, width, height, open, close, high, low } = props
  if (!open || !close) return null
  const isUp = close >= open
  const color = isUp ? '#10b981' : '#ef4444'
  const bodyTop = isUp ? y : y + height
  const bodyHeight = Math.max(Math.abs(height), 1)
  return (
    <g>
      <line x1={x + width / 2} x2={x + width / 2} y1={props.wickTop} y2={props.wickBottom} stroke={color} strokeWidth={1} />
      <rect x={x + 1} y={bodyTop} width={width - 2} height={bodyHeight} fill={color} opacity={0.85} rx={1} />
    </g>
  )
}

export default function MarketDataPage() {
  const [symbol, setSymbol] = useState('AAPL')
  const [interval, setInterval] = useState('1d')
  const [customSymbol, setCustomSymbol] = useState('')

  const activeSymbol = customSymbol || symbol

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['ohlcv', activeSymbol, interval],
    queryFn: () => api.get(`/market/ohlcv?symbol=${activeSymbol}&interval=${interval}`).then(r => r.data),
  })

  const { data: quote } = useQuery({
    queryKey: ['quote', activeSymbol],
    queryFn: () => api.get(`/market/quote?symbol=${activeSymbol}`).then(r => r.data),
    refetchInterval: 30_000,
  })

  const chartData = (data?.data || []).slice(-120).map((d: any, i: number) => ({
    ...d,
    date: d.date?.slice(5),
    wickTop: null, wickBottom: null,
  }))

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: '1.8rem', fontWeight: 800 }}>
          Market <span className="gradient-text">Data</span>
        </h1>
        <p style={{ color: 'var(--color-muted)', margin: 0 }}>Real-time financial data with technical indicators</p>
      </motion.div>

      {/* Controls */}
      <div className="glass" style={{ padding: 20, marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {SYMBOLS.map(s => (
            <button key={s} onClick={() => { setSymbol(s); setCustomSymbol('') }} style={{
              padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
              background: (customSymbol ? false : symbol === s) ? 'var(--color-primary)' : 'rgba(255,255,255,0.06)',
              color: (customSymbol ? false : symbol === s) ? '#000' : 'var(--color-muted)',
              transition: 'all 0.2s',
            }}>{s}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 'auto' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
            <input value={customSymbol} onChange={e => setCustomSymbol(e.target.value.toUpperCase())}
              className="input-field" placeholder="Custom symbol…"
              style={{ paddingLeft: 32, width: 160, padding: '8px 10px 8px 30px', fontSize: '0.85rem' }} />
          </div>
          <select value={interval} onChange={e => setInterval(e.target.value)} className="input-field" style={{ width: 110, fontSize: '0.85rem' }}>
            {INTERVALS.map(i => <option key={i.v} value={i.v}>{i.l}</option>)}
          </select>
          <button onClick={() => refetch()} className="btn-secondary" style={{ padding: '8px 14px' }}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Quote Card */}
      {quote && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: 20, marginBottom: 20, display: 'flex', gap: 32, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: 4 }}>{quote.symbol}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>${quote.price?.toLocaleString()}</div>
          </div>
          {[
            { l: 'Change', v: `${quote.change >= 0 ? '+' : ''}$${quote.change?.toFixed(2)}`, pos: quote.change >= 0 },
            { l: 'Change %', v: `${quote.change_pct >= 0 ? '+' : ''}${quote.change_pct?.toFixed(2)}%`, pos: quote.change_pct >= 0 },
            { l: 'Volume', v: (quote.volume / 1e6).toFixed(2) + 'M', pos: true },
            { l: 'High', v: `$${quote.high?.toFixed(2)}`, pos: true },
            { l: 'Low', v: `$${quote.low?.toFixed(2)}`, pos: true },
          ].map(item => (
            <div key={item.l}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: 4 }}>{item.l}</div>
              <div style={{ fontWeight: 700, color: item.l === 'Change' || item.l === 'Change %' ? (item.pos ? 'var(--color-success)' : 'var(--color-danger)') : 'var(--color-text)' }}>
                {item.v}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>
      ) : (
        <>
          {/* Price Chart (simplified as line + bars) */}
          <div className="glass" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontWeight: 700 }}>
              {activeSymbol} — Price & Volume
              <span style={{ fontWeight: 400, color: 'var(--color-muted)', fontSize: '0.85rem', marginLeft: 12 }}>{data?.count} candles</span>
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="price" orientation="right" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false}
                  tickFormatter={v => `$${v.toFixed(0)}`} />
                <YAxis yAxisId="vol" orientation="left" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false}
                  tickFormatter={v => `${(v/1e6).toFixed(0)}M`} />
                <Tooltip contentStyle={{ background: '#0d1429', border: '1px solid rgba(99,179,237,0.2)', borderRadius: 8, fontSize: '0.8rem' }} />
                <Bar yAxisId="vol" dataKey="volume" fill="rgba(124,58,237,0.3)" radius={[2,2,0,0]} />
                <Line yAxisId="price" type="monotone" dataKey="close" stroke="#00d4ff" strokeWidth={2} dot={false} />
                <Line yAxisId="price" type="monotone" dataKey="ma_20" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                <Line yAxisId="price" type="monotone" dataKey="ma_50" stroke="#a78bfa" strokeWidth={1.5} dot={false} strokeDasharray="6 3" />
              </ComposedChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 20, marginTop: 10, fontSize: '0.78rem' }}>
              {[
                { color: '#00d4ff', label: 'Price' },
                { color: '#f59e0b', label: 'MA 20' },
                { color: '#a78bfa', label: 'MA 50' },
                { color: 'rgba(124,58,237,0.5)', label: 'Volume' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-muted)' }}>
                  <div style={{ width: 24, height: 2, background: l.color, borderRadius: 1 }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          {/* RSI Chart */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div className="glass" style={{ padding: 20 }}>
              <h4 style={{ margin: '0 0 14px', fontWeight: 700, color: 'var(--color-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>RSI (14)</h4>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#0d1429', border: '1px solid rgba(99,179,237,0.2)', borderRadius: 6, fontSize: '0.75rem' }} />
                  <Area type="monotone" dataKey="rsi" stroke="#f59e0b" strokeWidth={2} fill="rgba(245,158,11,0.1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="glass" style={{ padding: 20 }}>
              <h4 style={{ margin: '0 0 14px', fontWeight: 700, color: 'var(--color-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>MACD</h4>
              <ResponsiveContainer width="100%" height={140}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" hide />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#0d1429', border: '1px solid rgba(99,179,237,0.2)', borderRadius: 6, fontSize: '0.75rem' }} />
                  <Bar dataKey="macd_hist" fill="rgba(0,212,255,0.3)" radius={[2,2,0,0]} />
                  <Line type="monotone" dataKey="macd" stroke="#00d4ff" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="macd_signal" stroke="#f97316" strokeWidth={1.5} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bollinger Bands */}
          <div className="glass" style={{ padding: 24 }}>
            <h4 style={{ margin: '0 0 14px', fontWeight: 700 }}>Bollinger Bands</h4>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v.toFixed(0)}`} />
                <Tooltip contentStyle={{ background: '#0d1429', border: '1px solid rgba(99,179,237,0.2)', borderRadius: 6, fontSize: '0.75rem' }} />
                <Area type="monotone" dataKey="bb_upper" stroke="rgba(124,58,237,0.5)" fill="rgba(124,58,237,0.05)" strokeWidth={1} />
                <Area type="monotone" dataKey="bb_lower" stroke="rgba(124,58,237,0.5)" fill="rgba(124,58,237,0.05)" strokeWidth={1} />
                <Line type="monotone" dataKey="close" stroke="#00d4ff" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="bb_mid" stroke="rgba(255,255,255,0.3)" strokeWidth={1} dot={false} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
