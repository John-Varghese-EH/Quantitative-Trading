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
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Search, RefreshCw, Star } from 'lucide-react'
import { LightweightChart } from '@/components/LightweightChart'
import api from '@/services/api'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

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
  const { user } = useAuth()
  const [symbol, setSymbol] = useState('AAPL')
  const [interval, setInterval] = useState('1d')
  const [customSymbol, setCustomSymbol] = useState('')
  const [watchlist, setWatchlist] = useState<string[]>([])

  const activeSymbol = customSymbol || symbol

  // Fetch watchlist on mount
  useState(() => {
    if (user?.uid) {
      getDoc(doc(db, 'users', user.uid)).then(snap => {
        if (snap.exists()) setWatchlist(snap.data().watchlist || [])
      })
    }
  })

  const toggleWatchlist = async () => {
    if (!user?.uid) return toast.error("Please login to save watchlists")
    const isWatched = watchlist.includes(activeSymbol)
    const newWatchlist = isWatched ? watchlist.filter(s => s !== activeSymbol) : [...watchlist, activeSymbol]
    setWatchlist(newWatchlist)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        watchlist: isWatched ? arrayRemove(activeSymbol) : arrayUnion(activeSymbol)
      })
      toast.success(isWatched ? 'Removed from watchlist' : 'Added to watchlist')
    } catch (e) {
      toast.error('Failed to update watchlist')
    }
  }

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['ohlcv', activeSymbol, interval],
    queryFn: () => axios.get(`/api/market/ohlcv?symbol=${activeSymbol}&interval=${interval}`).then(r => r.data),
  })

  const { data: quote } = useQuery({
    queryKey: ['quote', activeSymbol],
    queryFn: () => axios.get(`/api/market/quote?symbol=${activeSymbol}`).then(r => r.data),
    refetchInterval: 30_000,
  })

  const chartDataRecharts = (data?.data || []).slice(-120).map((d: any, i: number) => ({
    ...d,
    date: d.date?.slice(5, 10),
  }))

  const candlestickData = (data?.data || []).map((d: any) => ({
    time: d.date.split('T')[0],
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close,
  }))

  const volumeData = (data?.data || []).map((d: any) => ({
    time: d.date.split('T')[0],
    value: d.volume,
    color: d.close >= d.open ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'
  }))

  const ma20Data = (data?.data || []).filter((d: any) => d.ma_20).map((d: any) => ({
    time: d.date.split('T')[0],
    value: d.ma_20
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
      <div className="glass" style={{ padding: '12px 20px', marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {SYMBOLS.map(s => (
            <button key={s} onClick={() => { setSymbol(s); setCustomSymbol('') }} style={{
              padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '0.82rem',
              background: (customSymbol ? false : symbol === s) ? 'var(--color-text)' : 'transparent',
              color: (customSymbol ? false : symbol === s) ? 'var(--color-bg)' : 'var(--color-muted)',
              transition: 'all 0.15s',
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
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: 20, marginBottom: 20, display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: 4 }}>
              {quote.symbol} {quote.name && `— ${quote.name}`}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>${quote.price?.toLocaleString()}</div>
              <button onClick={toggleWatchlist} style={{
                background: watchlist.includes(activeSymbol) ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                border: `1px solid ${watchlist.includes(activeSymbol) ? '#f59e0b' : 'var(--color-border)'}`,
                color: watchlist.includes(activeSymbol) ? '#f59e0b' : 'var(--color-muted)',
                borderRadius: 6, padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.15s'
              }}>
                <Star size={14} fill={watchlist.includes(activeSymbol) ? '#f59e0b' : 'none'} />
                {watchlist.includes(activeSymbol) ? 'Saved' : 'Watch'}
              </button>
            </div>
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
          {/* Price Chart */}
          <div className="glass" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontWeight: 700 }}>
              {quote?.name ? `${activeSymbol} (${quote.name})` : activeSymbol} — Advanced Chart
              <span style={{ fontWeight: 400, color: 'var(--color-muted)', fontSize: '0.85rem', marginLeft: 12 }}>{data?.count} candles</span>
            </h3>
            
            <LightweightChart 
              data={candlestickData} 
              volumeData={volumeData}
              maData={ma20Data}
            />
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
                <AreaChart data={chartDataRecharts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-glass-border)', borderRadius: 6, fontSize: '0.75rem' }} />
                  <Area type="monotone" dataKey="rsi" stroke="#f59e0b" strokeWidth={2} fill="rgba(245,158,11,0.1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="glass" style={{ padding: 20 }}>
              <h4 style={{ margin: '0 0 14px', fontWeight: 700, color: 'var(--color-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>MACD</h4>
              <ResponsiveContainer width="100%" height={140}>
                <ComposedChart data={chartDataRecharts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" hide />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-glass-border)', borderRadius: 6, fontSize: '0.75rem' }} />
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
              <AreaChart data={chartDataRecharts}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v.toFixed(0)}`} />
                <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-glass-border)', borderRadius: 6, fontSize: '0.75rem' }} />
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
