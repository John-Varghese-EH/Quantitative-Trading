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

import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Search, RefreshCw, Star, Download, X, ArrowRight } from 'lucide-react'
import { LightweightChart } from '@/components/LightweightChart'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAppStore } from '@/store/useAppStore'
import { formatCurrency, formatCurrencyCompact } from '@/utils/currency'
import { useAuth } from '@/contexts/AuthContext'
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'BTC-USD', 'ETH-USD', 'SPY', 'AMZN', 'META']
const TIME_RANGES = [
  { id: '1D', label: '1 Day', days: 1, interval: '15m' }, // ~43 candles
  { id: '1W', label: '1 Week', days: 7, interval: '1h' }, // ~87 candles
  { id: '1M', label: '1 Month', days: 30, interval: '90m' }, // ~237 candles
  { id: '1Y', label: '1 Year', days: 365, interval: '1d' }, // ~251 candles
]

interface SearchResult {
  symbol: string
  shortname?: string
  longname?: string
  exchange?: string
  typeDisp?: string
}

export default function MarketDataPage() {
  const { user } = useAuth()
  const { currency } = useAppStore()
  const [symbol, setSymbol] = useState('AAPL')
  const [timeRange, setTimeRange] = useState('1W')
  const [watchlist, setWatchlist] = useState<string[]>([])
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Chart Display Toggles
  const [showVolume, setShowVolume] = useState(true)
  const [showMA, setShowMA] = useState(true)
  const [showMA50, setShowMA50] = useState(false)
  const [showMA200, setShowMA200] = useState(false)
  const [showBB, setShowBB] = useState(false)

  const activeSymbol = symbol

  // Fetch watchlist on mount
  useState(() => {
    if (user?.uid) {
      getDoc(doc(db, 'users', user.uid)).then(snap => {
        if (snap.exists()) setWatchlist(snap.data().watchlist || [])
      })
    }
  })

  // ── Search with debounce ──────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowSearchDropdown(false)
      return
    }
    setShowSearchDropdown(true)
    const delay = setTimeout(() => {
      setIsSearching(true)
      axios.get(`/api/market/search?q=${encodeURIComponent(searchQuery)}`)
        .then(r => {
          const results = (r.data.results || []).slice(0, 8)
          setSearchResults(results)
        })
        .catch(() => setSearchResults([]))
        .finally(() => setIsSearching(false))
    }, 280)
    return () => clearTimeout(delay)
  }, [searchQuery])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectSearchResult = useCallback((result: SearchResult) => {
    setSymbol(result.symbol)
    setSearchQuery('')
    setShowSearchDropdown(false)
    setHighlightedIndex(-1)
    toast.success(`Switched to ${result.symbol}`)
  }, [])

  // Keyboard navigation for search
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSearchDropdown || searchResults.length === 0) {
      if (e.key === 'Enter' && searchQuery.trim()) {
        setSymbol(searchQuery.trim().toUpperCase())
        setSearchQuery('')
        setShowSearchDropdown(false)
      }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && highlightedIndex < searchResults.length) {
        selectSearchResult(searchResults[highlightedIndex])
      } else if (searchQuery.trim()) {
        setSymbol(searchQuery.trim().toUpperCase())
        setSearchQuery('')
        setShowSearchDropdown(false)
      }
    } else if (e.key === 'Escape') {
      setShowSearchDropdown(false)
      setHighlightedIndex(-1)
    }
  }, [showSearchDropdown, searchResults, highlightedIndex, searchQuery, selectSearchResult])

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
    } catch {
      toast.error('Failed to update watchlist')
    }
  }

  const exportCsv = () => {
    if (!data?.data || data.data.length === 0) return toast.error('No data to export');
    const headers = Object.keys(data.data[0]).join(',');
    const csvRows = data.data.map((r: any) => Object.values(r).join(','));
    const blob = new Blob([headers + '\n' + csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSymbol}_${timeRange}_data.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Data fetching ─────────────────────────────────────────────────
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['ohlcv', activeSymbol, timeRange],
    queryFn: () => {
      const range = TIME_RANGES.find(r => r.id === timeRange) || TIME_RANGES[1];
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - range.days);
      const startStr = start.toISOString().split('T')[0];
      if (range.days === 1) end.setDate(end.getDate() + 1);
      const endStr = end.toISOString().split('T')[0];
      return axios.get(`/api/market/ohlcv?symbol=${activeSymbol}&interval=${range.interval}&start=${startStr}&end=${endStr}`).then(r => r.data);
    },
    placeholderData: undefined, // Don't show stale data from a different timeRange
  })

  const { data: quote } = useQuery({
    queryKey: ['quote', activeSymbol],
    queryFn: () => axios.get(`/api/market/quote?symbol=${activeSymbol}`).then(r => r.data),
    refetchInterval: 30_000,
  })

  // ── Chart data transforms ────────────────────────────────────────
  // IMPORTANT: Derive isIntraday from the API response, NOT from the UI state.
  // This prevents a race condition where timeRange updates instantly but data
  // still holds the previous query's results, causing wrong time formatting.
  const dataInterval = data?.interval || 'unknown';
  const isIntraday = ['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h'].includes(dataInterval);

  const formatTime = (dateStr: string) => {
    if (!dateStr) return 0;
    // If the date already looks like YYYY-MM-DD (no 'T'), it's daily
    if (!isIntraday || !dateStr.includes('T')) return dateStr.split('T')[0];
    return Math.floor(new Date(dateStr).getTime() / 1000);
  };

  const chartDataRecharts = (data?.data || []).slice(-120).map((d: any) => ({
    ...d,
    date: isIntraday && d.date?.includes?.('T')
      ? new Date(d.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : (d.date?.length > 10 ? d.date?.slice(5, 10) : d.date?.slice(5)),
  }))

  const candlestickData = (data?.data || []).map((d: any) => ({
    time: formatTime(d.date),
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close,
  }))

  const volumeData = (data?.data || []).map((d: any) => ({
    time: formatTime(d.date),
    value: d.volume,
    color: d.close >= d.open ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'
  }))

  const ma20Data = (data?.data || []).filter((d: any) => d.ma_20).map((d: any) => ({
    time: formatTime(d.date),
    value: d.ma_20
  }))

  const ma50Data = (data?.data || []).filter((d: any) => d.ma_50).map((d: any) => ({
    time: formatTime(d.date),
    value: d.ma_50
  }))

  const ma200Data = (data?.data || []).filter((d: any) => d.ma_200).map((d: any) => ({
    time: formatTime(d.date),
    value: d.ma_200
  }))

  const bbUpperData = (data?.data || []).filter((d: any) => d.bb_upper).map((d: any) => ({
    time: formatTime(d.date),
    value: d.bb_upper
  }))

  const bbLowerData = (data?.data || []).filter((d: any) => d.bb_lower).map((d: any) => ({
    time: formatTime(d.date),
    value: d.bb_lower
  }))

  // Helper for highlighting matched text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim() || !text) return text
    const idx = text.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{text.slice(idx, idx + query.length)}</span>
        {text.slice(idx + query.length)}
      </>
    )
  }

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
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {SYMBOLS.map(s => (
            <button key={s} onClick={() => { setSymbol(s); setSearchQuery('') }} style={{
              padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '0.82rem',
              background: symbol === s ? 'var(--color-text)' : 'transparent',
              color: symbol === s ? 'var(--color-bg)' : 'var(--color-muted)',
              transition: 'all 0.15s',
            }}>{s}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 'auto' }}>
          {/* ── Search with Autocomplete ── */}
          <div ref={searchRef} style={{ position: 'relative', width: 260 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', zIndex: 2 }} />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setShowSearchDropdown(false) }}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', zIndex: 2,
                  padding: 2, display: 'flex', alignItems: 'center',
                }}
              ><X size={14} /></button>
            )}
            <input
              ref={inputRef}
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setHighlightedIndex(-1) }}
              onFocus={() => { if (searchQuery.trim()) setShowSearchDropdown(true) }}
              onKeyDown={handleSearchKeyDown}
              className="input-field"
              placeholder="Search by name or symbol..."
              style={{ paddingLeft: 32, paddingRight: 28, width: '100%', fontSize: '0.85rem' }}
            />

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {showSearchDropdown && searchQuery.trim() !== '' && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-glass-border)',
                    borderRadius: 10,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
                    zIndex: 200,
                    maxHeight: 360,
                    overflowY: 'auto',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  {isSearching ? (
                    <div style={{ padding: '20px 16px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <div className="spinner" style={{ width: 16, height: 16 }} />
                      <span style={{ fontSize: '0.82rem', color: 'var(--color-muted)' }}>Searching markets...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      <div style={{ padding: '8px 14px 4px', fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                      </div>
                      {searchResults.map((res, idx) => (
                        <div
                          key={`${res.symbol}-${idx}`}
                          onClick={() => selectSearchResult(res)}
                          style={{
                            padding: '10px 14px',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            cursor: 'pointer',
                            transition: 'background 0.12s',
                            background: idx === highlightedIndex ? 'var(--color-glass-hover)' : 'transparent',
                            borderLeft: idx === highlightedIndex ? '2px solid var(--color-primary)' : '2px solid transparent',
                          }}
                          onMouseEnter={() => setHighlightedIndex(idx)}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                              <span style={{ fontWeight: 700, fontSize: '0.88rem', fontFamily: 'monospace' }}>
                                {highlightMatch(res.symbol, searchQuery)}
                              </span>
                              {res.exchange && (
                                <span style={{ fontSize: '0.65rem', color: 'var(--color-muted)', background: 'var(--color-glass-light)', padding: '1px 6px', borderRadius: 4 }}>
                                  {res.exchange}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {highlightMatch(res.longname || res.shortname || '', searchQuery)}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 12 }}>
                            {res.typeDisp && (
                              <span style={{
                                fontSize: '0.65rem', fontWeight: 600,
                                padding: '2px 8px', borderRadius: 4,
                                background: res.typeDisp === 'Equity' ? 'rgba(16,185,129,0.1)' : res.typeDisp === 'ETF' ? 'rgba(59,130,246,0.1)' : res.typeDisp === 'Cryptocurrency' ? 'rgba(245,158,11,0.1)' : 'rgba(148,163,184,0.1)',
                                color: res.typeDisp === 'Equity' ? '#10b981' : res.typeDisp === 'ETF' ? '#3b82f6' : res.typeDisp === 'Cryptocurrency' ? '#f59e0b' : 'var(--color-muted)',
                              }}>
                                {res.typeDisp}
                              </span>
                            )}
                            <ArrowRight size={12} style={{ color: 'var(--color-muted)', opacity: idx === highlightedIndex ? 1 : 0, transition: 'opacity 0.15s' }} />
                          </div>
                        </div>
                      ))}
                      <div style={{ padding: '6px 14px 8px', fontSize: '0.68rem', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: 6, borderTop: '1px solid var(--color-glass-border)' }}>
                        <kbd style={{ background: 'var(--color-glass-light)', padding: '1px 5px', borderRadius: 3, fontSize: '0.65rem', fontFamily: 'monospace' }}>↑↓</kbd> navigate
                        <kbd style={{ background: 'var(--color-glass-light)', padding: '1px 5px', borderRadius: 3, fontSize: '0.65rem', fontFamily: 'monospace', marginLeft: 6 }}>↵</kbd> select
                        <kbd style={{ background: 'var(--color-glass-light)', padding: '1px 5px', borderRadius: 3, fontSize: '0.65rem', fontFamily: 'monospace', marginLeft: 6 }}>esc</kbd> close
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: '20px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: 6 }}>No results for &ldquo;{searchQuery}&rdquo;</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', opacity: 0.7 }}>Try searching by ticker symbol or company name</div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Time Range Selector */}
          <div style={{ display: 'flex', gap: 2, background: 'var(--color-surface)', borderRadius: 8, padding: 2, border: '1px solid var(--color-glass-border)' }}>
            {TIME_RANGES.map(t => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id)}
                style={{
                  padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.78rem', transition: 'all 0.15s',
                  background: timeRange === t.id ? 'var(--color-text)' : 'transparent',
                  color: timeRange === t.id ? 'var(--color-bg)' : 'var(--color-muted)',
                }}
              >{t.id}</button>
            ))}
          </div>

          <button onClick={() => refetch()} className="btn-secondary" style={{ padding: '8px 14px' }} title="Refresh">
            <RefreshCw size={14} />
          </button>
          <button onClick={exportCsv} className="btn-secondary" style={{ padding: '8px 14px' }} title="Export CSV">
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Quote Card */}
      {quote && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: 20, marginBottom: 20, display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: 4 }}>
              {quote.symbol} {quote.name && `- ${quote.name}`}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>{formatCurrency(quote.price, currency)}</div>
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
            { l: 'Change', v: `${quote.change >= 0 ? '+' : ''}${formatCurrency(Math.abs(quote.change), currency)}`, pos: quote.change >= 0 },
            { l: 'Change %', v: `${quote.change_pct >= 0 ? '+' : ''}${quote.change_pct?.toFixed(2)}%`, pos: quote.change_pct >= 0 },
            { l: 'Volume', v: formatCurrencyCompact(quote.volume, currency), pos: true },
            { l: 'High', v: formatCurrency(quote.high, currency), pos: true },
            { l: 'Low', v: formatCurrency(quote.low, currency), pos: true },
          ].map((item) => (
            <div key={item.l}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: 4 }}>{item.l}</div>
              <div style={{ fontWeight: 700, color: item.l === 'Change' || item.l === 'Change %' ? (item.pos ? 'var(--color-success)' : 'var(--color-danger)') : 'var(--color-text)' }}>
                {item.v}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {(isLoading || isFetching) ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>
      ) : (
        <>
          {/* Price Chart */}
          <div className="glass" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: 16, gap: 12 }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>
                {quote?.name ? `${activeSymbol} (${quote.name})` : activeSymbol} - Advanced Chart
                <span style={{ fontWeight: 400, color: 'var(--color-muted)', fontSize: '0.85rem', marginLeft: 12 }}>{data?.count} candles</span>
              </h3>
              
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowVolume(!showVolume)} className={`btn-secondary ${showVolume ? 'active' : ''}`} style={{ padding: '4px 10px', fontSize: '0.75rem', background: showVolume ? 'var(--color-primary)' : 'transparent', color: showVolume ? 'var(--color-bg)' : 'var(--color-text)' }}>Volume</button>
                <button onClick={() => setShowMA(!showMA)} className={`btn-secondary ${showMA ? 'active' : ''}`} style={{ padding: '4px 10px', fontSize: '0.75rem', background: showMA ? 'var(--color-primary)' : 'transparent', color: showMA ? 'var(--color-bg)' : 'var(--color-text)' }}>MA 20</button>
                <button onClick={() => setShowMA50(!showMA50)} className={`btn-secondary ${showMA50 ? 'active' : ''}`} style={{ padding: '4px 10px', fontSize: '0.75rem', background: showMA50 ? 'var(--color-primary)' : 'transparent', color: showMA50 ? 'var(--color-bg)' : 'var(--color-text)' }}>MA 50</button>
                <button onClick={() => setShowMA200(!showMA200)} className={`btn-secondary ${showMA200 ? 'active' : ''}`} style={{ padding: '4px 10px', fontSize: '0.75rem', background: showMA200 ? 'var(--color-primary)' : 'transparent', color: showMA200 ? 'var(--color-bg)' : 'var(--color-text)' }}>MA 200</button>
                <button onClick={() => setShowBB(!showBB)} className={`btn-secondary ${showBB ? 'active' : ''}`} style={{ padding: '4px 10px', fontSize: '0.75rem', background: showBB ? 'var(--color-primary)' : 'transparent', color: showBB ? 'var(--color-bg)' : 'var(--color-text)' }}>BB</button>
              </div>
            </div>
            
            <LightweightChart 
              symbol={activeSymbol}
              data={candlestickData} 
              volumeData={showVolume ? volumeData : undefined}
              maData={showMA ? ma20Data : undefined}
              ma50Data={showMA50 ? ma50Data : undefined}
              ma200Data={showMA200 ? ma200Data : undefined}
              bbUpperData={showBB ? bbUpperData : undefined}
              bbLowerData={showBB ? bbLowerData : undefined}
            />
            <div style={{ display: 'flex', gap: 20, marginTop: 10, fontSize: '0.78rem' }}>
              {[
                { color: '#00d4ff', label: 'Price' },
                { color: '#f59e0b', label: 'MA 20', show: showMA },
                { color: '#f59e0b', label: 'MA 50', show: showMA50 },
                { color: '#ef4444', label: 'MA 200', show: showMA200 },
                { color: 'rgba(124,58,237,0.5)', label: 'Bollinger Bands', show: showBB },
                { color: 'rgba(38,166,154,0.5)', label: 'Volume', show: showVolume },
              ].filter(l => l.show !== false).map((l, i) => (
                <div key={`${l.label}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-muted)' }}>
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

        </>
      )}
    </div>
  )
}
