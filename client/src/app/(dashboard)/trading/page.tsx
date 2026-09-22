"use client";
/**
 * QuantAdv - Quantitative Trading Platform
 * Copyright (C) 2026 John Varghese (J0X)
 * AGPL-3.0 License
 *
 * Dual-Mode Trading Experience:
 * - Novice Mode: 1-Click Bots, Prompt-to-Strategy AI Copilot, 5-Agent Council Deliberation, Paper Portfolio.
 * - Quant Pro Mode: Execution Terminal, Pre-Trade Compliance Firewall, Custom Parameter Backtests, Deep Metrics.
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Activity, Play, Bot, ShieldAlert, Sparkles,
  RefreshCw, DollarSign,
  Shield, Compass, Cpu, Sliders, ArrowUpRight,
  Radar, BarChart2, Layers, X
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { LightweightChart } from '@/components/LightweightChart'
import { XaiWaterfallOverlay } from '@/components/XaiWaterfallOverlay'
import { AutonomousBotManagerModal } from '@/components/AutonomousBotManagerModal'

import api from '@/services/api'
import toast from 'react-hot-toast'
import { useAppStore } from '@/store/useAppStore'
import { formatCurrency, formatCurrencyCompact } from '@/utils/currency'

const STRATEGIES = [
  { id: 'buy_and_hold', name: 'Buy and Hold', color: '#00d4ff', desc: 'Buy on day 1, hold to end' },
  { id: 'ma_crossover', name: 'MA Crossover', color: '#10b981', desc: 'Short vs long moving average' },
  { id: 'mean_reversion', name: 'Mean Reversion', color: '#f59e0b', desc: 'Trade on z-score deviations' },
  { id: 'momentum', name: 'Momentum', color: '#7c3aed', desc: 'Follow price momentum' },
  { id: 'ai_prediction', name: 'AI Prediction Strategy', color: '#f97316', desc: 'Machine learning model signals' },
  { id: 'ai_council_consensus', name: '5-Agent Council Consensus', color: '#ec4899', desc: 'Multi-Agent Council with Red Team audit' },
]

const NOVICE_PRESET_BOTS = [
  {
    id: 'breakout_hunter',
    name: 'AI Breakout Hunter',
    tag: 'Trend Following',
    symbol: 'NVDA',
    desc: 'Catches explosive price expansions with 2x ATR volatility stop loss.',
    winRate: '68%',
    risk: 'Moderate',
    expectedReturn: '+24.6%',
    color: '#3b82f6',
  },
  {
    id: 'mean_reversion_dip',
    name: 'Mean Reversion Dip Buyer',
    tag: 'Oversold Bounce',
    symbol: 'AAPL',
    desc: 'Buys high-conviction pullbacks when RSI < 30 and fundamentals remain intact.',
    winRate: '72%',
    risk: 'Low',
    expectedReturn: '+18.2%',
    color: '#10b981',
  },
  {
    id: 'crypto_momentum',
    name: 'Crypto Volatility Scalper',
    tag: 'High Beta',
    symbol: 'BTC-USD',
    desc: 'Trades rapid momentum shifts on BTC/ETH with tight trailing stops.',
    winRate: '61%',
    risk: 'High',
    expectedReturn: '+41.5%',
    color: '#f59e0b',
  },
  {
    id: 'safe_rebalancer',
    name: 'Macro Blue-Chip Shield',
    tag: 'Defensive',
    symbol: 'SPY',
    desc: 'Adversarial-protected trend follower that hedges during macro stress periods.',
    winRate: '79%',
    risk: 'Very Low',
    expectedReturn: '+12.8%',
    color: '#8b5cf6',
  },
]

const POPULAR_SYMBOLS = ['AAPL', 'NVDA', 'MSFT', 'TSLA', 'GOOGL', 'BTC-USD', 'SPY', 'RELIANCE.NS']

export default function TradingPage() {
  const queryClient = useQueryClient()
  const { currency, tradingMode, setTradingMode } = useAppStore()

  // State for Council & Prompt-to-strategy
  const [councilSymbol, setCouncilSymbol] = useState('NVDA')
  const [userPrompt, setUserPrompt] = useState('')
  const [compiledStrategy, setCompiledStrategy] = useState<any>(null)

  // State for Pro Backtest & Order execution
  const [strategy, setStrategy] = useState('ma_crossover')
  const [symbol, setSymbol] = useState('AAPL')
  const [startDate, setStartDate] = useState('2023-01-01')
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10))
  const [capital, setCapital] = useState(10000)
  const [result, setResult] = useState<any>(null)

  // Order terminal state
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY')
  const [orderQty, setOrderQty] = useState(10)
  const [orderType, setOrderType] = useState('MARKET')
  const [orderJurisdiction, setOrderJurisdiction] = useState('GLOBAL')

  // 1. Fetch Paper Trading Account Summary
  const { data: paperSummary, refetch: refetchPaper } = useQuery({
    queryKey: ['paper-summary'],
    queryFn: () => api.get('/trading/paper/summary').then(r => r.data),
    refetchInterval: 15000,
  })

  // 2. Fetch Compliance Firewall Status
  const { data: complianceStatus, refetch: refetchCompliance } = useQuery({
    queryKey: ['compliance-status'],
    queryFn: () => api.get('/trading/compliance/status').then(r => r.data),
    refetchInterval: 30000,
  })

  // Scanner state
  const [scannerMarket, setScannerMarket] = useState<'ALL' | 'US' | 'IN' | 'CRYPTO'>('ALL')
  const [scannerSignal, setScannerSignal] = useState<'ALL' | 'BREAKOUT' | 'VOLUME_SURGE' | 'OVERSOLD_DIP' | 'MOMENTUM_RUN'>('ALL')

  // Pro View Tabs
  const [proChartTab, setProChartTab] = useState<'chart' | 'backtest' | 'council_xai' | 'options'>('chart')

  // Autonomous Bot & Options Modals
  const [isBotModalOpen, setIsBotModalOpen] = useState(false)
  const [deployPreset, setDeployPreset] = useState<any>(null)
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false)

  // 3. Fetch Backtest History
  const { data: history } = useQuery({
    queryKey: ['backtest-history'],
    queryFn: () => api.get('/trading/backtest/history').then(r => r.data.history),
  })

  // 3b. Fetch Market Scanner Opportunities
  const { data: scanData, isFetching: isScanning, refetch: refetchScan } = useQuery({
    queryKey: ['market-scan', scannerMarket, scannerSignal],
    queryFn: () => api.get(`/trading/scanner/scan?market=${scannerMarket}&signal=${scannerSignal}`).then(r => r.data),
    refetchInterval: 30000,
  })

  // 3c. Fetch Pro Candlestick OHLCV Data
  const { data: ohlcvData, isLoading: isOhlcvLoading } = useQuery({
    queryKey: ['trading-ohlcv', symbol],
    queryFn: () => {
      const end = new Date().toISOString().split('T')[0]
      const start = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0]
      return api.get(`/market/ohlcv?symbol=${symbol}&interval=1d&start=${start}&end=${end}`).then(r => r.data)
    },
    enabled: tradingMode === 'pro',
  })

  // Candlestick transforms
  const candlestickData = (ohlcvData?.data || []).map((d: any) => ({
    time: d.date?.split('T')[0] || d.date,
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close,
  }))

  const volumeData = (ohlcvData?.data || []).map((d: any) => ({
    time: d.date?.split('T')[0] || d.date,
    value: d.volume,
    color: d.close >= d.open ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)',
  }))

  const ma20Data = (ohlcvData?.data || []).filter((d: any) => d.ma_20).map((d: any) => ({
    time: d.date?.split('T')[0] || d.date,
    value: d.ma_20,
  }))

  const ma50Data = (ohlcvData?.data || []).filter((d: any) => d.ma_50).map((d: any) => ({
    time: d.date?.split('T')[0] || d.date,
    value: d.ma_50,
  }))

  // 4. AI Council Deliberation Mutation
  const councilMutation = useMutation({
    mutationFn: (sym: string) => api.get(`/trading/council/deliberate?symbol=${sym}`).then(r => r.data),
    onSuccess: () => toast.success('5-Agent Council deliberation complete!'),
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Council deliberation failed'),
  })

  // 5. Prompt to Strategy Mutation
  const promptMutation = useMutation({
    mutationFn: (promptText: string) => api.post('/trading/council/prompt-to-strategy', { prompt: promptText }).then(r => r.data),
    onSuccess: (data) => {
      setCompiledStrategy(data)
      toast.success('Strategy successfully synthesized by AI!')
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Strategy compilation failed'),
  })

  // 6. Backtest Mutation
  const backtestMutation = useMutation({
    mutationFn: (body: any) => api.post('/trading/backtest', body),
    onSuccess: (res) => {
      setResult(res.data)
      queryClient.invalidateQueries({ queryKey: ['backtest-history'] })
      toast.success('Backtest complete!')
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Backtest failed'),
  })

  // 7. Order Execution Mutation
  const executeOrderMutation = useMutation({
    mutationFn: (payload: any) => api.post('/trading/order/execute', payload).then(r => r.data),
    onSuccess: (data) => {
      if (data.status === 'REJECTED_BY_COMPLIANCE') {
        toast.error(`Compliance Rejection: ${data.rejection_reasons.join(', ')}`, { duration: 5000 })
      } else {
        toast.success(`Order approved & executed (${data.execution_mode} Mode)!`)
        refetchPaper()
      }
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Order execution failed'),
  })

  // 8. Panic Kill Switch Mutation
  const panicMutation = useMutation({
    mutationFn: () => api.post('/trading/panic').then(r => r.data),
    onSuccess: (data) => {
      toast.error(`🛑 KILL-SWITCH ENGAGED! ${data.closed_positions_count} positions liquidated.`, { duration: 6000 })
      refetchPaper()
      refetchCompliance()
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Panic trigger failed'),
  })

  // 9. Reset Paper Account Mutation
  const resetPaperMutation = useMutation({
    mutationFn: () => api.post('/trading/paper/reset', null, { params: { initial_cash: 100000 } }).then(r => r.data),
    onSuccess: () => {
      toast.success('Paper account reset to $100,000')
      refetchPaper()
    },
  })

  const handleRunBacktest = () => {
    backtestMutation.mutate({
      symbol,
      strategy,
      start_date: startDate,
      end_date: endDate,
      initial_capital: capital,
    })
  }

  const activeStrategyObj = STRATEGIES.find(s => s.id === strategy)

  return (
    <div className="space-y-6">
      {/* ─── Top Header with Mode Selector & Kill Switch ──────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Trading <span className="gradient-text">Engine</span>
            </h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
              tradingMode === 'novice' 
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' 
                : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
            }`}>
              {tradingMode === 'novice' ? '🌱 Novice Mode' : '⚡ Quant Pro Mode'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {tradingMode === 'novice'
              ? 'Autonomous AI assistance, 1-click bot deployment, and plain-English strategies.'
              : 'Institutional execution terminal, pre-trade compliance firewall, and deep quant analytics.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Mode Switcher Toggle */}
          <div className="glass p-1 flex items-center rounded-xl border border-border">
            <button
              onClick={() => setTradingMode('novice')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                tradingMode === 'novice' ? 'bg-blue-600 text-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Compass size={14} /> Novice View
            </button>
            <button
              onClick={() => setTradingMode('pro')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                tradingMode === 'pro' ? 'bg-purple-600 text-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sliders size={14} /> Quant Pro
            </button>
          </div>

          {/* Paper Portfolio Quick Glance */}
          {paperSummary && (
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl glass border border-border text-xs">
              <div>
                <span className="text-muted-foreground text-[10px] block uppercase">Paper Equity</span>
                <span className="font-bold text-foreground">{formatCurrency(paperSummary.portfolio_value, currency)}</span>
              </div>
              <div className={`font-semibold ${paperSummary.total_pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {paperSummary.total_pnl >= 0 ? '+' : ''}{paperSummary.total_pnl_pct}%
              </div>
            </div>
          )}

          {/* Emergency Panic Kill Switch */}
          <button
            onClick={() => {
              if (confirm('EMERGENCY: Halt all trading and liquidate open positions immediately?')) {
                panicMutation.mutate()
              }
            }}
            disabled={panicMutation.isPending}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-foreground border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <ShieldAlert size={14} />
            {panicMutation.isPending ? 'Halting…' : 'Panic Stop'}
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* NOVICE MODE: SIMPLIFIED, INTUITIVE, AI-ASSISTED                     */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {tradingMode === 'novice' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          {/* 1. 1-Click Battle-Tested Bots */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Bot size={18} className="text-blue-400" /> 1-Click Automated Bots
                </h2>
                <p className="text-xs text-muted-foreground">Pre-configured, battle-tested algorithmic bots ready for instant paper deployment.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBotModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-foreground border border-blue-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Bot size={14} /> Bot Fleet Command Center
                </button>
                <button
                  type="button"
                  onClick={() => setIsOptionsModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-foreground border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Layers size={14} /> Options & Sentiment
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {NOVICE_PRESET_BOTS.map((bot) => (
                <div key={bot.id} className="glass p-4 rounded-xl flex flex-col justify-between hover:border-blue-500/30 transition-all group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
                        {bot.tag}
                      </span>
                      <span className="text-xs font-extrabold text-blue-400">{bot.symbol}</span>
                    </div>
                    <h3 className="font-bold text-sm text-foreground group-hover:text-blue-400 transition-colors">{bot.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{bot.desc}</p>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border text-[11px]">
                      <div>
                        <span className="text-muted-foreground block">Win Rate</span>
                        <span className="font-bold text-emerald-400">{bot.winRate}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Risk Level</span>
                        <span className="font-medium text-muted-foreground">{bot.risk}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setDeployPreset({
                        name: bot.name,
                        bot_type: bot.id.includes('breakout') ? 'BREAKOUT' : bot.id.includes('dip') ? 'MEAN_REVERSION' : bot.id.includes('grid') ? 'GRID' : 'DCA',
                        symbol: bot.symbol,
                      })
                      setIsBotModalOpen(true)
                    }}
                    className="mt-4 w-full py-2 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-foreground border border-blue-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Play size={13} /> Deploy Autonomous Bot
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 1b. Live Market Opportunity Radar (Real-Time Scanner) */}
          <div className="glass p-5 rounded-2xl border border-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Radar size={18} className="text-amber-400 animate-pulse" />
                  <h2 className="text-base font-bold text-foreground">Live Market Opportunity Radar</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Real-Time Scanner
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Algorithmic scanner screening US Equities, Indian Equities (NSE), and Crypto for institutional volume & breakout triggers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => refetchScan()}
                  disabled={isScanning}
                  className="px-2.5 py-1 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground text-xs flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw size={13} className={isScanning ? 'animate-spin' : ''} />
                  {isScanning ? 'Scanning…' : 'Scan Now'}
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border text-xs">
              {/* Market Universe Tabs */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground mr-1">Market:</span>
                {[
                  { id: 'ALL', label: 'All Markets' },
                  { id: 'US', label: '🇺🇸 US Equities' },
                  { id: 'IN', label: '🇮🇳 India (NSE)' },
                  { id: 'CRYPTO', label: '🪙 Crypto' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setScannerMarket(m.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      scannerMarket === m.id 
                        ? 'bg-blue-600 text-foreground shadow-sm' 
                        : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Signal Filter */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-muted-foreground mr-1">Signal:</span>
                {[
                  { id: 'ALL', label: 'All' },
                  { id: 'BREAKOUT', label: 'Breakouts' },
                  { id: 'VOLUME_SURGE', label: 'Volume Surges' },
                  { id: 'OVERSOLD_DIP', label: 'Oversold Dips' },
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => setScannerSignal(s.id as any)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                      scannerSignal === s.id 
                        ? 'bg-white/20 text-foreground font-bold' 
                        : 'bg-muted/50 text-muted-foreground hover:text-muted-foreground'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Candidate Cards */}
            {scanData?.candidates && scanData.candidates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {scanData.candidates.slice(0, 6).map((c: any) => (
                  <div key={c.symbol} className="p-3.5 rounded-xl bg-muted/50 border border-border hover:border-blue-500/30 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-foreground">{c.symbol}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                            {c.market}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-xs text-foreground">${c.price.toFixed(2)}</span>
                          <span className={`text-[11px] font-semibold ml-1.5 ${
                            c.change_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {c.change_pct >= 0 ? '+' : ''}{c.change_pct}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          c.signal_type === 'BREAKOUT' ? 'bg-amber-500/20 text-amber-300' :
                          c.signal_type === 'VOLUME_SURGE' ? 'bg-purple-500/20 text-purple-300' :
                          c.signal_type === 'OVERSOLD_DIP' ? 'bg-emerald-500/20 text-emerald-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {c.tag}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">
                          {c.volume_surge_ratio}x Vol
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">
                          RSI {c.rsi}
                        </span>
                      </div>

                      <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3">
                        {c.notes}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                      <button
                        onClick={() => {
                          setCouncilSymbol(c.symbol)
                          councilMutation.mutate(c.symbol)
                          toast.success(`AI Council deliberating on ${c.symbol}…`)
                        }}
                        className="py-1.5 px-2 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-foreground text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Cpu size={12} /> Council
                      </button>
                      <button
                        onClick={() => executeOrderMutation.mutate({
                          symbol: c.symbol,
                          side: 'BUY',
                          quantity: 10,
                          order_type: 'MARKET',
                          strategy_id: `Scanner ${c.tag}`,
                        })}
                        className="py-1.5 px-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-foreground text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Play size={12} /> Paper Buy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground text-xs">
                {isScanning ? 'Scanning markets for anomalies…' : 'No prominent breakout triggers in current filter. Try selecting "All Markets".'}
              </div>
            )}
          </div>

          {/* 2. Prompt-to-Strategy AI Copilot & 5-Agent Council Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Prompt-to-Strategy AI Copilot */}
            <div className="glass p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={18} className="text-amber-400" />
                  <h2 className="text-base font-bold text-foreground">Prompt-to-Strategy AI Copilot</h2>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Describe your trading idea in plain English. The AI synthesizes the logic into a compliant algorithmic strategy.
                </p>

                <div className="space-y-3">
                  <textarea
                    className="w-full h-24 p-3 rounded-xl bg-black/30 border border-border text-xs sm:text-sm text-foreground placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none"
                    placeholder="e.g., Buy Apple whenever RSI is below 30 and the 50-day moving average is pointing upwards, with a 2% stop loss..."
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                  />

                  {/* Suggestions pills */}
                  <div className="flex items-center gap-2 flex-wrap text-[11px]">
                    <span className="text-muted-foreground">Try:</span>
                    <button
                      type="button"
                      onClick={() => setUserPrompt("Buy tech stocks when RSI < 32 and volume increases by 1.5x, risk 1.5% max")}
                      className="px-2 py-1 rounded-md bg-muted/50 hover:bg-muted text-muted-foreground transition-colors"
                    >
                      RSI Dip + Volume Surge
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserPrompt("Momentum breakout strategy above 20-day high with trailing 2% stop loss")}
                      className="px-2 py-1 rounded-md bg-muted/50 hover:bg-muted text-muted-foreground transition-colors"
                    >
                      Breakout Channel
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border">
                <button
                  onClick={() => promptMutation.mutate(userPrompt || "Buy tech breakouts with 2% stop loss")}
                  disabled={promptMutation.isPending}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-foreground font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
                >
                  <Sparkles size={15} />
                  {promptMutation.isPending ? 'Synthesizing Strategy…' : 'Compile Strategy with AI'}
                </button>

                {compiledStrategy && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-xl bg-muted/50 text-xs space-y-2 border border-border">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{compiledStrategy.strategy_name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300">
                        {compiledStrategy.estimated_complexity}
                      </span>
                    </div>
                    <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                      {compiledStrategy.compiled_rules?.map((r: string, idx: number) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>
            </div>

            {/* 5-Agent Council Live Deliberation */}
            <div className="glass p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Cpu size={18} className="text-purple-400" />
                    <h2 className="text-base font-bold text-foreground">5-Agent AI Council</h2>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Red-Team Protected
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Technical, Fundamental, Sentiment, Adversarial Red-Team, and Chief Risk Officer agents deliberate on any ticker.
                </p>

                {/* Symbol selector */}
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    className="flex-1 p-2.5 rounded-xl bg-black/30 border border-border text-xs sm:text-sm text-foreground font-semibold uppercase tracking-wider focus:outline-none focus:border-purple-500/50"
                    placeholder="Ticker (e.g. AAPL, NVDA, RELIANCE.NS)"
                    value={councilSymbol}
                    onChange={(e) => setCouncilSymbol(e.target.value)}
                  />
                  <button
                    onClick={() => councilMutation.mutate(councilSymbol)}
                    disabled={councilMutation.isPending}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-foreground font-semibold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <Activity size={14} />
                    {councilMutation.isPending ? 'Deliberating…' : 'Consult Council'}
                  </button>
                </div>

                {/* Quick select ticker badges */}
                <div className="flex items-center gap-1.5 flex-wrap mb-3">
                  {POPULAR_SYMBOLS.slice(0, 5).map(sym => (
                    <button
                      key={sym}
                      onClick={() => {
                        setCouncilSymbol(sym)
                        councilMutation.mutate(sym)
                      }}
                      className="px-2 py-0.5 rounded bg-muted/50 hover:bg-muted text-[11px] text-muted-foreground transition-colors"
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>

              {/* Council Result Preview with Deep XAI & SHAP Waterfall */}
              {councilMutation.data && (
                <div className="mt-3">
                  <XaiWaterfallOverlay
                    decision={councilMutation.data}
                    onExecuteOrder={(payload) => executeOrderMutation.mutate(payload)}
                    isExecuting={executeOrderMutation.isPending}
                    embedded={true}
                  />
                </div>
              )}
            </div>
          </div>

          {/* 3. Paper Trading Portfolio & Open Positions */}
          <div className="glass p-5 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <DollarSign size={18} className="text-emerald-400" /> Active Paper Trading Portfolio
                </h2>
                <p className="text-xs text-muted-foreground">Risk-free execution sandbox with realistic fee & slippage modeling.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => refetchPaper()}
                  className="p-1.5 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground text-xs transition-colors"
                  title="Refresh Portfolio"
                >
                  <RefreshCw size={14} />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Reset paper balance back to $100,000?')) resetPaperMutation.mutate()
                  }}
                  className="px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground text-xs font-semibold transition-colors"
                >
                  Reset Balance
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-muted/50 border border-border">
                <span className="text-[10px] text-muted-foreground block uppercase">Total Portfolio Value</span>
                <span className="text-base sm:text-lg font-bold text-foreground">
                  {formatCurrency(paperSummary?.portfolio_value || 100000, currency)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-muted/50 border border-border">
                <span className="text-[10px] text-muted-foreground block uppercase">Available Cash</span>
                <span className="text-base sm:text-lg font-bold text-foreground">
                  {formatCurrency(paperSummary?.cash || 100000, currency)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-muted/50 border border-border">
                <span className="text-[10px] text-muted-foreground block uppercase">Realized P&L</span>
                <span className={`text-base sm:text-lg font-bold ${
                  (paperSummary?.realized_pnl || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {formatCurrency(paperSummary?.realized_pnl || 0, currency)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-muted/50 border border-border">
                <span className="text-[10px] text-muted-foreground block uppercase">Open Positions</span>
                <span className="text-base sm:text-lg font-bold text-blue-400">
                  {paperSummary?.open_positions_count || 0} active
                </span>
              </div>
            </div>

            {/* Open Positions Table */}
            {paperSummary?.open_positions?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] text-muted-foreground uppercase border-b border-border">
                    <tr>
                      <th className="pb-2">Symbol</th>
                      <th className="pb-2">Qty</th>
                      <th className="pb-2">Avg Entry</th>
                      <th className="pb-2">Current</th>
                      <th className="pb-2">Unrealized P&L</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {paperSummary.open_positions.map((pos: any) => (
                      <tr key={pos.symbol} className="hover:bg-muted/50">
                        <td className="py-2.5 font-bold text-foreground">{pos.symbol}</td>
                        <td className="py-2.5 text-muted-foreground">{pos.quantity}</td>
                        <td className="py-2.5 text-muted-foreground">{formatCurrency(pos.entry_price, currency)}</td>
                        <td className="py-2.5 text-muted-foreground">{formatCurrency(pos.current_price, currency)}</td>
                        <td className={`py-2.5 font-semibold ${pos.unrealized_pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {pos.unrealized_pnl >= 0 ? '+' : ''}{formatCurrency(pos.unrealized_pnl, currency)} ({pos.unrealized_pnl_pct}%)
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => executeOrderMutation.mutate({
                              symbol: pos.symbol,
                              side: 'SELL',
                              quantity: pos.quantity,
                              order_type: 'MARKET',
                              strategy_id: 'Manual Close',
                            })}
                            className="px-2.5 py-1 rounded bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-foreground text-[11px] font-semibold transition-colors"
                          >
                            Close
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground text-xs">
                No active open positions in paper account. Deploy a bot or consult the AI Council above to open one!
              </div>
            )}
          </div>

        </motion.div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* QUANT PRO MODE: ADVANCED CONFIG, COMPLIANCE, IN-DEPTH CHARTS        */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {tradingMode === 'pro' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          {/* Pre-Trade Compliance & Legal Firewall Status Bar */}
          <div className="glass p-4 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-purple-400 shrink-0" />
              <div>
                <span className="font-bold text-foreground block">Pre-Trade Legal Compliance Firewall Active</span>
                <span className="text-muted-foreground text-[11px]">
                  SEC Rule 15c3-5 Fat-Finger Guards · SEBI IST Circuit Collars · MiFID II Rate Throttling
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                complianceStatus?.kill_switch_active 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {complianceStatus?.kill_switch_active ? 'KILL-SWITCH ENGAGED' : 'FIREWALL: PASSING'}
              </span>
              <span className="text-[11px] text-muted-foreground">
                Max Daily Loss Cap: {complianceStatus?.max_daily_loss_limit || '5%'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">

            {/* Left Column: Pro Config & Order Terminal */}
            <div className="space-y-5">

              {/* Order Execution Terminal */}
              <div className="glass p-5 rounded-2xl border border-border">
                <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                  <ArrowUpRight size={16} className="text-blue-400" /> Pro Execution Terminal
                </h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderSide('BUY')}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        orderSide === 'BUY' ? 'bg-emerald-600 text-foreground shadow-md' : 'bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      BUY / LONG
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderSide('SELL')}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        orderSide === 'SELL' ? 'bg-rose-600 text-foreground shadow-md' : 'bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      SELL / SHORT
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">Symbol</label>
                    <input
                      type="text"
                      className="w-full p-2.5 rounded-lg bg-black/30 border border-border text-xs text-foreground font-bold uppercase focus:outline-none focus:border-blue-500/50"
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1">Quantity</label>
                      <input
                        type="number"
                        className="w-full p-2.5 rounded-lg bg-black/30 border border-border text-xs text-foreground focus:outline-none focus:border-blue-500/50"
                        value={orderQty}
                        onChange={(e) => setOrderQty(Number(e.target.value))}
                        min={1}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1">Type</label>
                      <select
                        className="w-full p-2.5 rounded-lg bg-black/30 border border-border text-xs text-foreground focus:outline-none focus:border-blue-500/50"
                        value={orderType}
                        onChange={(e) => setOrderType(e.target.value)}
                      >
                        <option value="MARKET">Market</option>
                        <option value="LIMIT">Limit</option>
                        <option value="STOP_LOSS">Stop Loss</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">Compliance Jurisdiction</label>
                    <select
                      className="w-full p-2.5 rounded-lg bg-black/30 border border-border text-xs text-foreground focus:outline-none focus:border-blue-500/50"
                      value={orderJurisdiction}
                      onChange={(e) => setOrderJurisdiction(e.target.value)}
                    >
                      <option value="GLOBAL">Global Standards</option>
                      <option value="US">US (SEC 15c3-5 & FINRA PDT)</option>
                      <option value="IN">India (SEBI Circuit Limits & IST Hours)</option>
                      <option value="EU">EU/UK (MiFID II RTS 6 Throttles)</option>
                    </select>
                  </div>

                  <button
                    onClick={() => executeOrderMutation.mutate({
                      symbol,
                      side: orderSide,
                      quantity: orderQty,
                      order_type: orderType,
                      jurisdiction: orderJurisdiction,
                      strategy_id: 'Pro Manual Terminal',
                    })}
                    disabled={executeOrderMutation.isPending}
                    className={`w-full py-2.5 rounded-xl text-foreground font-bold text-xs transition-all shadow-md mt-2 ${
                      orderSide === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                    }`}
                  >
                    Submit {orderSide} Order to Compliance
                  </button>
                </div>
              </div>

              {/* Strategy Backtest Controls */}
              <div className="glass p-5 rounded-2xl border border-border">
                <h3 className="font-bold text-sm text-foreground mb-3">Backtest Strategy Parameters</h3>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    {STRATEGIES.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setStrategy(s.id)}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all ${
                          strategy === s.id 
                            ? 'border-blue-500/50 bg-blue-500/10' 
                            : 'border-border hover:border-border'
                        }`}
                      >
                        <div className="font-bold text-foreground">{s.name}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{s.desc}</div>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1">Start Date</label>
                      <input
                        type="date"
                        className="w-full p-2 rounded-lg bg-black/30 border border-border text-xs text-foreground"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1">End Date</label>
                      <input
                        type="date"
                        className="w-full p-2 rounded-lg bg-black/30 border border-border text-xs text-foreground"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">Capital ({currency})</label>
                    <input
                      type="number"
                      className="w-full p-2 rounded-lg bg-black/30 border border-border text-xs text-foreground"
                      value={capital}
                      onChange={e => setCapital(Number(e.target.value))}
                      min={100}
                    />
                  </div>

                  <button
                    onClick={handleRunBacktest}
                    disabled={backtestMutation.isPending}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md disabled:opacity-50"
                  >
                    <Play size={14} />
                    {backtestMutation.isPending ? 'Backtesting…' : 'Execute Historical Backtest'}
                  </button>
                </div>
              </div>

              {/* Recent Backtests History */}
              <div className="glass p-5 rounded-2xl border border-border">
                <h4 className="font-bold text-xs text-foreground uppercase tracking-wider mb-3">Recent Backtests</h4>
                {(!history || history.length === 0) ? (
                  <p className="text-muted-foreground text-xs text-center py-2">No previous backtests</p>
                ) : (
                  <div className="space-y-2">
                    {history.slice(0, 4).map((h: any) => (
                      <div key={h.id} className="p-2.5 rounded-xl bg-muted/50 border border-border flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-foreground">{h.symbol} · {h.strategy}</div>
                          <div className="text-[10px] text-muted-foreground">Win: {h.win_rate}% · {h.total_trades} trades</div>
                        </div>
                        <div className={`font-bold ${h.total_return >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {h.total_return >= 0 ? '+' : ''}{h.total_return?.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Pro Analytics & Equity Curve */}
            <div>
              {/* Pro Right View Tabs */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setProChartTab('chart')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    proChartTab === 'chart'
                      ? 'bg-blue-600 text-foreground shadow-md'
                      : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <BarChart2 size={14} /> Candlestick Chart ({symbol})
                </button>
                <button
                  type="button"
                  onClick={() => setProChartTab('backtest')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    proChartTab === 'backtest'
                      ? 'bg-blue-600 text-foreground shadow-md'
                      : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Activity size={14} /> Backtest Equity Curve {result ? `(${result.symbol})` : ''}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProChartTab('council_xai')
                    if (!councilMutation.data || councilMutation.data.symbol !== symbol) {
                      councilMutation.mutate(symbol)
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    proChartTab === 'council_xai'
                      ? 'bg-purple-600 text-foreground shadow-md'
                      : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Cpu size={14} /> AI Council & SHAP XAI ({symbol})
                </button>
                <button
                  type="button"
                  onClick={() => setProChartTab('options')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    proChartTab === 'options'
                      ? 'bg-purple-600 text-foreground shadow-md'
                      : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Layers size={14} /> Options Chain & Greeks ({symbol})
                </button>
              </div>

              {/* Tab 1: Live Candlestick Chart */}
              {proChartTab === 'chart' && (
                <div className="glass p-5 rounded-2xl border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                        {symbol} · Institutional Candlestick Feed
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        High-precision candles with EMA 20 (blue), EMA 50 (amber), and Volume Histogram.
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1" />
                      <span className="text-muted-foreground font-semibold">Active Feed</span>
                    </div>
                  </div>

                  {candlestickData.length > 0 ? (
                    <div className="min-h-[400px]">
                      <LightweightChart
                        symbol={symbol}
                        data={candlestickData}
                        volumeData={volumeData}
                        maData={ma20Data}
                        ma50Data={ma50Data}
                      />
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
                      {isOhlcvLoading ? 'Loading live market candle data…' : 'No candlestick data available for this symbol.'}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Backtest Equity Curve */}
              {proChartTab === 'backtest' && !result && !backtestMutation.isPending && (
                <div className="glass p-12 text-center rounded-2xl border border-border flex flex-col items-center justify-center min-h-[400px]">
                  <Activity size={56} className="text-slate-600 mb-3" />
                  <h3 className="text-muted-foreground font-medium text-sm">Select strategy parameters and execute a backtest</h3>
                  <p className="text-xs text-slate-600 max-w-sm mt-1">
                    Simulates realistic execution across tick-level historical data with commissions and slippage.
                  </p>
                </div>
              )}

              {proChartTab === 'backtest' && backtestMutation.isPending && (
                <div className="glass p-12 text-center rounded-2xl border border-border flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <span className="text-xs text-muted-foreground">Crunching quantitative strategy metrics…</span>
                </div>
              )}

              {proChartTab === 'backtest' && result && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {/* Metric Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { l: 'Total Return', v: `${result.total_return >= 0 ? '+' : ''}${result.total_return?.toFixed(2)}%`, color: result.total_return >= 0 ? 'text-emerald-400' : 'text-rose-400' },
                      { l: 'Sharpe Ratio', v: result.sharpe_ratio?.toFixed(2), color: 'text-foreground' },
                      { l: 'Max Drawdown', v: `${result.max_drawdown?.toFixed(2)}%`, color: 'text-rose-400' },
                      { l: 'Win Rate', v: `${result.win_rate?.toFixed(1)}%`, color: 'text-emerald-400' },
                      { l: 'Final Value', v: formatCurrency(result.final_value, currency), color: 'text-foreground' },
                      { l: 'Total Trades', v: result.total_trades, color: 'text-foreground' },
                      { l: 'CAGR', v: `${result.cagr?.toFixed(2)}%`, color: 'text-amber-400' },
                      { l: 'Initial Capital', v: formatCurrency(result.initial_capital, currency), color: 'text-muted-foreground' },
                    ].map(stat => (
                      <div key={stat.l} className="glass p-3 rounded-xl border border-border">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide block">{stat.l}</span>
                        <span className={`text-base font-extrabold ${stat.color}`}>{stat.v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Equity Curve Chart */}
                  <div className="glass p-5 rounded-2xl border border-border">
                    <h3 className="font-bold text-sm text-foreground mb-3">
                      Equity Curve · {activeStrategyObj?.name} on {result.symbol}
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={result.equity_curve}>
                        <defs>
                          <linearGradient id="eqGradPro" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={activeStrategyObj?.color || '#3b82f6'} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={activeStrategyObj?.color || '#3b82f6'} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={v => formatCurrencyCompact(v, currency)} />
                        <Tooltip
                          contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: '0.8rem' }}
                          formatter={(v: any) => [formatCurrency(v, currency), 'Portfolio Value']}
                        />
                        <Area type="monotone" dataKey="value" stroke={activeStrategyObj?.color || '#3b82f6'} strokeWidth={2} fill="url(#eqGradPro)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Trade Log */}
                  {result.trade_log?.length > 0 && (
                    <div className="glass p-5 rounded-2xl border border-border">
                      <h4 className="font-bold text-sm text-foreground mb-3">Trade Execution Audit</h4>
                      <div className="overflow-x-auto max-h-60">
                        <table className="w-full text-left text-xs">
                          <thead className="text-[11px] text-muted-foreground uppercase border-b border-border">
                            <tr>
                              <th className="pb-2">Date</th>
                              <th className="pb-2">Type</th>
                              <th className="pb-2">Price</th>
                              <th className="pb-2">Shares</th>
                              <th className="pb-2">P&L</th>
                              <th className="pb-2">ROI</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {result.trade_log.slice(-15).reverse().map((t: any, i: number) => (
                              <tr key={i} className="hover:bg-muted/50">
                                <td className="py-2 text-muted-foreground text-[11px]">{t.date}</td>
                                <td className="py-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    t.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                                  }`}>
                                    {t.type}
                                  </span>
                                </td>
                                <td className="py-2 text-foreground">{formatCurrency(t.price, currency)}</td>
                                <td className="py-2 text-muted-foreground">{t.shares}</td>
                                <td className={`py-2 font-semibold ${t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {t.pnl !== undefined ? `${t.pnl >= 0 ? '+' : ''}${formatCurrency(Math.abs(t.pnl), currency)}` : '-'}
                                </td>
                                <td className={`py-2 font-semibold ${t.roi >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {t.roi !== undefined ? `${t.roi >= 0 ? '+' : ''}${t.roi?.toFixed(2)}%` : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tab 3: AI Council & SHAP Attribution */}
              {proChartTab === 'council_xai' && (
                <div className="glass p-5 rounded-2xl border border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                        <Cpu size={16} className="text-purple-400" /> Explainable AI & SHAP Attribution · {symbol}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Multi-agent quantitative consensus with feature attribution, counterfactual stress-testing, and dynamic risk limits.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => councilMutation.mutate(symbol)}
                      disabled={councilMutation.isPending}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-foreground font-semibold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <RefreshCw size={13} className={councilMutation.isPending ? 'animate-spin' : ''} />
                      {councilMutation.isPending ? 'Deliberating…' : 'Re-Deliberate'}
                    </button>
                  </div>

                  {councilMutation.isPending ? (
                    <div className="h-64 flex flex-col items-center justify-center text-xs text-muted-foreground gap-2">
                      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      <span>5-Agent Council deliberating on {symbol}…</span>
                    </div>
                  ) : councilMutation.data ? (
                    <XaiWaterfallOverlay
                      decision={councilMutation.data}
                      onExecuteOrder={(payload) => executeOrderMutation.mutate(payload)}
                      isExecuting={executeOrderMutation.isPending}
                      embedded={false}
                    />
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-center text-xs text-muted-foreground">
                      <Cpu size={40} className="text-slate-600 mb-2" />
                      <p>No deliberation loaded yet for {symbol}.</p>
                      <button
                        onClick={() => councilMutation.mutate(symbol)}
                        className="mt-3 px-3 py-1.5 rounded-lg bg-purple-600 text-foreground font-semibold text-xs"
                      >
                        Consult Council on {symbol}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

        </motion.div>
      )}

      {/* Autonomous Bot Command Center Modal */}
      <AutonomousBotManagerModal
        isOpen={isBotModalOpen}
        onClose={() => {
          setIsBotModalOpen(false)
          setDeployPreset(null)
        }}
        initialDeployPreset={deployPreset}
      />



    </div>
  )
}
