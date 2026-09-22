"use client";
/**
 * QuantAdv - Quantitative Trading Platform
 * Copyright (C) 2026 John Varghese (J0X)
 * AGPL-3.0 License
 *
 * Autonomous Bot Command Center.
 * Inspired by Hummingbot & OctoBot.
 * Manages automated algorithmic execution loops (Grid, DCA, Breakout, Council Auto-Pilot)
 * with real-time lifecycle controls, P&L attribution, and activity audit logs.
 */

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, Play, Pause, Square, Trash2, Plus, RefreshCw, Activity,
  CheckCircle2, X, Shield, Sliders, Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/services/api'
import { useAppStore } from '@/store/useAppStore'
import { formatCurrency } from '@/utils/currency'

export interface BotData {
  id: string
  name: string
  bot_type: string
  symbol: string
  allocated_capital: float
  status: 'RUNNING' | 'PAUSED' | 'STOPPED'
  mode: string
  broker_id: string
  realized_pnl: number
  unrealized_pnl: number
  total_trades: number
  win_trades: number
  win_rate: number
  last_signal: string
  parameters: Record<string, any>
  activity_log: string[]
  created_at: string
  last_run_timestamp?: string
}

interface AutonomousBotManagerModalProps {
  isOpen: boolean
  onClose: () => void
  initialDeployPreset?: {
    name: string
    bot_type: string
    symbol: string
    parameters?: Record<string, any>
  } | null
}

export function AutonomousBotManagerModal({
  isOpen,
  onClose,
  initialDeployPreset = null,
}: AutonomousBotManagerModalProps) {
  const queryClient = useQueryClient()
  const { currency } = useAppStore()

  // Tab: 'active_bots' | 'deploy_new'
  const [activeTab, setActiveTab] = useState<'active_bots' | 'deploy_new'>(
    initialDeployPreset ? 'deploy_new' : 'active_bots'
  )

  // Deploy form state
  const [deployName, setDeployName] = useState(initialDeployPreset?.name || 'Custom Algorithmic Bot')
  const [deployType, setDeployType] = useState(initialDeployPreset?.bot_type || 'BREAKOUT')
  const [deploySymbol, setDeploySymbol] = useState(initialDeployPreset?.symbol || 'NVDA')
  const [deployCapital, setDeployCapital] = useState(10000)
  const [deployMode, setDeployMode] = useState('PAPER')

  // Expanded log bot ID
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)

  // 1. Fetch bots
  const { data: bots = [], isLoading, refetch } = useQuery<BotData[]>({
    queryKey: ['trading-bots-list'],
    queryFn: () => api.get('/trading/bots/list').then(r => r.data.bots || []),
    enabled: isOpen,
    refetchInterval: isOpen ? 10000 : false,
  })

  // 2. Toggle bot mutation
  const toggleMutation = useMutation({
    mutationFn: (botId: string) => api.post(`/trading/bots/${botId}/toggle`).then(r => r.data),
    onSuccess: (data) => {
      toast.success(`Bot is now ${data.bot.status}`)
      queryClient.invalidateQueries({ queryKey: ['trading-bots-list'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Failed to toggle bot'),
  })

  // 3. Iterate bot cycle mutation
  const iterateMutation = useMutation({
    mutationFn: (botId: string) => api.post(`/trading/bots/${botId}/iterate`).then(r => r.data),
    onSuccess: (data) => {
      toast.success(data.action || 'Cycle executed')
      queryClient.invalidateQueries({ queryKey: ['trading-bots-list'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Cycle iteration failed'),
  })

  // 4. Stop bot mutation
  const stopMutation = useMutation({
    mutationFn: (botId: string) => api.post(`/trading/bots/${botId}/stop`).then(r => r.data),
    onSuccess: () => {
      toast.success('Bot stopped permanently')
      queryClient.invalidateQueries({ queryKey: ['trading-bots-list'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Failed to stop bot'),
  })

  // 5. Delete bot mutation
  const deleteMutation = useMutation({
    mutationFn: (botId: string) => api.delete(`/trading/bots/${botId}`).then(r => r.data),
    onSuccess: () => {
      toast.success('Bot removed')
      queryClient.invalidateQueries({ queryKey: ['trading-bots-list'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Failed to delete bot'),
  })

  // 6. Deploy bot mutation
  const deployMutation = useMutation({
    mutationFn: (payload: any) => api.post('/trading/bots/create', payload).then(r => r.data),
    onSuccess: (data) => {
      toast.success(`Deployed ${data.bot.name} successfully!`)
      queryClient.invalidateQueries({ queryKey: ['trading-bots-list'] })
      setActiveTab('active_bots')
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Deployment failed'),
  })

  const handleDeploySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    deployMutation.mutate({
      name: deployName,
      bot_type: deployType,
      symbol: deploySymbol.toUpperCase(),
      capital: deployCapital,
      mode: deployMode,
      broker_id: 'paper',
      parameters: {
        risk_per_trade_pct: 2.0,
        trailing_stop_pct: 2.5,
      },
    })
  }

  // Aggregate Metrics
  const activeCount = bots.filter(b => b.status === 'RUNNING').length
  const totalPnl = bots.reduce((acc, b) => acc + (b.realized_pnl || 0), 0)
  const totalTrades = bots.reduce((acc, b) => acc + (b.total_trades || 0), 0)
  const totalWins = bots.reduce((acc, b) => acc + (b.win_trades || 0), 0)
  const aggregateWinRate = totalTrades > 0 ? ((totalWins / totalTrades) * 100).toFixed(1) : '0.0'

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto glass p-6 rounded-2xl border border-white/20 shadow-2xl space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg">
              <Bot size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Autonomous Bot Command Center
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Hummingbot & OctoBot Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Deploy, monitor, and stress-test autonomous quantitative trading algorithms in paper sandbox or live exchange mode.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Global Statistics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-slate-400 block uppercase">Active Running Bots</span>
            <span className="text-base font-extrabold text-blue-400">
              {activeCount} / {bots.length} Active
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-slate-400 block uppercase">Total Realized P&L</span>
            <span className={`text-base font-extrabold ${totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl, currency)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-slate-400 block uppercase">Aggregate Win Rate</span>
            <span className="text-base font-extrabold text-emerald-400">
              {aggregateWinRate}%
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-slate-400 block uppercase">Algorithmic Trades Filled</span>
            <span className="text-base font-extrabold text-white">
              {totalTrades} executions
            </span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('active_bots')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'active_bots'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Activity size={14} /> Active Bot Fleet ({bots.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('deploy_new')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'deploy_new'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Plus size={14} /> Deploy New Bot
            </button>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs transition-colors flex items-center gap-1"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline text-[11px]">Sync Fleet</span>
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB 1: ACTIVE BOT FLEET                                             */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === 'active_bots' && (
          <div className="space-y-3">
            {bots.map((bot) => {
              const isRunning = bot.status === 'RUNNING'
              const isPaused = bot.status === 'PAUSED'
              const isStopped = bot.status === 'STOPPED'
              const isLogOpen = expandedLogId === bot.id

              return (
                <div
                  key={bot.id}
                  className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 transition-all space-y-3"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl border flex items-center justify-center ${
                        isRunning
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : isPaused
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-slate-500/10 border-slate-500/30 text-slate-400'
                      }`}>
                        <Bot size={20} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm text-white">{bot.name}</h3>
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">
                            {bot.symbol}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400">
                            {bot.bot_type}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            bot.mode === 'LIVE' ? 'bg-rose-500/20 text-rose-400' : 'bg-purple-500/20 text-purple-300'
                          }`}>
                            {bot.mode} MODE
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                          <span>Allocated: <strong className="text-white">{formatCurrency(bot.allocated_capital, currency)}</strong></span>
                          <span>•</span>
                          <span>Signal: <strong className="text-emerald-400">{bot.last_signal}</strong></span>
                          <span>•</span>
                          <span>Last Active: {bot.last_run_timestamp || 'Just now'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats & Action Controls */}
                    <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                      <div className="text-right text-xs">
                        <span className="text-[10px] text-slate-400 block">Realized P&L</span>
                        <span className={`font-bold ${bot.realized_pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {bot.realized_pnl >= 0 ? '+' : ''}{formatCurrency(bot.realized_pnl, currency)} ({bot.win_rate}%)
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        {!isStopped && (
                          <button
                            type="button"
                            onClick={() => toggleMutation.mutate(bot.id)}
                            disabled={toggleMutation.isPending}
                            className={`p-2 rounded-xl transition-all ${
                              isRunning
                                ? 'bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-white'
                                : 'bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white'
                            }`}
                            title={isRunning ? 'Pause Bot' : 'Resume Bot'}
                          >
                            {isRunning ? <Pause size={14} /> : <Play size={14} />}
                          </button>
                        )}

                        {!isStopped && (
                          <button
                            type="button"
                            onClick={() => iterateMutation.mutate(bot.id)}
                            disabled={iterateMutation.isPending}
                            className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white transition-all"
                            title="Run Execution Cycle Now"
                          >
                            <Zap size={14} />
                          </button>
                        )}

                        {!isStopped && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Stop ${bot.name} permanently?`)) stopMutation.mutate(bot.id)
                            }}
                            className="p-2 rounded-xl bg-slate-500/20 hover:bg-slate-500 text-slate-300 hover:text-white transition-all"
                            title="Stop Bot"
                          >
                            <Square size={14} />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete ${bot.name}?`)) deleteMutation.mutate(bot.id)
                          }}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 transition-all"
                          title="Delete Bot"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Log Drawer */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <button
                      type="button"
                      onClick={() => setExpandedLogId(isLogOpen ? null : bot.id)}
                      className="hover:text-white transition-colors flex items-center gap-1 font-semibold"
                    >
                      <Sliders size={12} />
                      {isLogOpen ? 'Hide Execution Logs' : `View Execution Logs (${bot.activity_log?.length || 0})`}
                    </button>

                    <div className="flex items-center gap-1 text-[10px]">
                      <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                      <span className="uppercase font-bold tracking-wider">{bot.status}</span>
                    </div>
                  </div>

                  {/* Activity Log Drawer */}
                  <AnimatePresence>
                    {isLogOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-xs font-mono"
                      >
                        {bot.activity_log?.length > 0 ? (
                          bot.activity_log.map((log, idx) => (
                            <div key={idx} className="text-slate-300 flex items-start gap-2">
                              <span className="text-slate-500">[{idx + 1}]</span>
                              <span>{log}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-slate-500 text-[11px]">No activity logs recorded yet.</span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB 2: DEPLOY NEW AUTONOMOUS BOT                                    */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === 'deploy_new' && (
          <form onSubmit={handleDeploySubmit} className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 flex items-center gap-2.5">
              <Shield size={18} className="shrink-0 text-blue-400" />
              <span>
                All algorithmic bots run through the <strong>Pre-Trade Compliance Firewall</strong>. Orders that exceed daily loss limits (5%), fat-finger collars, or SEBI IST trading hours are automatically protected.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Bot Strategy Name</label>
                <input
                  type="text"
                  value={deployName}
                  onChange={(e) => setDeployName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Algorithm Archetype</label>
                <select
                  value={deployType}
                  onChange={(e) => setDeployType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="BREAKOUT">Trend Breakout Hunter (ATR Volatility Trails)</option>
                  <option value="MEAN_REVERSION">Mean Reversion Dip Buyer (RSI & Bollinger)</option>
                  <option value="GRID">Institutional Grid Maker (Oscillation Ladder)</option>
                  <option value="DCA">Smart Volatility DCA (Accumulation Dips)</option>
                  <option value="COUNCIL_AUTOPILOT">5-Agent Council Auto-Pilot (Consensus Driven)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Target Symbol / Asset</label>
                <input
                  type="text"
                  value={deploySymbol}
                  onChange={(e) => setDeploySymbol(e.target.value.toUpperCase())}
                  placeholder="e.g. NVDA, AAPL, BTC-USD, RELIANCE.NS"
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono uppercase focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Allocated Capital</label>
                <input
                  type="number"
                  value={deployCapital}
                  onChange={(e) => setDeployCapital(Number(e.target.value))}
                  min={100}
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Execution Sandbox Mode</label>
                <select
                  value={deployMode}
                  onChange={(e) => setDeployMode(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="PAPER">Paper Trading Sandbox (100% Risk-Free Simulation)</option>
                  <option value="LIVE">Live Exchange Broker Execution</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('active_bots')}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={deployMutation.isPending}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                <CheckCircle2 size={14} />
                {deployMutation.isPending ? 'Deploying Algorithm…' : 'Deploy Autonomous Bot'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  )
}
