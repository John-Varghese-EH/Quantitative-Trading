"use client";
/**
 * QuantAdv - Quantitative Trading Platform
 * Copyright (C) 2026 John Varghese (J0X)
 * AGPL-3.0 License
 *
 * Institutional Options & Derivatives Chain Analytics Component.
 * Computes Black-Scholes analytical Greeks (Delta, Gamma, Theta, Vega),
 * Max Pain Strike, Put-Call Ratio (PCR), and multi-leg strategy payoff curves.
 */

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Layers, Play,
  RefreshCw, Scale, BarChart3
} from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ReferenceLine } from 'recharts'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Info } from 'lucide-react'
import api from '@/services/api'
import { useAppStore } from '@/store/useAppStore'
import { formatCurrency } from '@/utils/currency'
import toast from 'react-hot-toast'

interface OptionsChainRow {
  strike: number
  iv: number
  call: {
    price: number
    delta: number
    gamma: number
    theta: number
    vega: number
    oi: number
    volume: number
  }
  put: {
    price: number
    delta: number
    gamma: number
    theta: number
    vega: number
    oi: number
    volume: number
  }
}

interface OptionsChainResponse {
  symbol: string
  spot_price: number
  historical_volatility: number
  days_to_expiry: number
  max_pain_strike: number
  put_call_ratio: number
  pcr_bias: string
  pcr_sentiment: string
  total_call_open_interest: number
  total_put_open_interest: number
  chain: OptionsChainRow[]
}

interface OptionsDerivativesChainProps {
  initialSymbol?: string
  onExecuteStrategy?: (payload: any) => void
  isExecuting?: boolean
}

export function OptionsDerivativesChain({
  initialSymbol = 'AAPL',
  onExecuteStrategy,
  isExecuting = false,
}: OptionsDerivativesChainProps) {
  const { currency } = useAppStore()
  const [symbol, setSymbol] = useState(initialSymbol)
  const [viewTab, setViewTab] = useState<'chain' | 'payoff'>('chain')
  const [selectedStrategy, setSelectedStrategy] = useState<string>('BULL_CALL_SPREAD')

  // 1. Fetch Options Chain & Greeks
  const { data: chainData, isLoading, refetch } = useQuery<OptionsChainResponse>({
    queryKey: ['options-chain', symbol],
    queryFn: () => api.get(`/trading/derivatives/options-chain?symbol=${symbol}`).then(r => r.data),
  })

  // 2. Fetch Multi-Leg Strategy Payoff
  const spotPrice = chainData?.spot_price || 150.0
  const { data: payoffData } = useQuery({
    queryKey: ['options-payoff', selectedStrategy, spotPrice],
    queryFn: () =>
      api.get(`/trading/derivatives/payoff?strategy=${selectedStrategy}&spot_price=${spotPrice}`).then(r => r.data),
    enabled: !!chainData,
  })

  const popularSymbols = ['AAPL', 'NVDA', 'SPY', 'TSLA', 'MSFT', 'RELIANCE.NS']

  return (
    <div className="space-y-5">
      {/* 1. Header Ribbon & Symbol Input */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers size={20} className="text-purple-400" />
            <h2 className="text-base font-bold text-white">
              Institutional Options & Greeks Matrix
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Black-Scholes Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time analytical Greeks (Delta, Theta, Vega), Max Pain pin-risk, and Put-Call Ratio sentiment analysis.
          </p>
        </div>

        {/* Symbol Quick Switcher */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {popularSymbols.map(sym => (
            <button
              key={sym}
              onClick={() => setSymbol(sym)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                symbol === sym
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {sym}
            </button>
          ))}
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs transition-colors"
            title="Refresh Chain"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 2. Market Sentiment Barometer & Max Pain Metrics */}
      {chainData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Spot & IV */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-slate-400 block uppercase">Spot Price / IV</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-base font-extrabold text-white">
                {formatCurrency(chainData.spot_price, currency)}
              </span>
              <span className="text-xs text-purple-400 font-bold">
                {chainData.historical_volatility}% IV
              </span>
            </div>
            <span className="text-[10px] text-slate-500">{chainData.days_to_expiry} Days to Front Expiry</span>
          </div>

          {/* Max Pain Strike */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <HoverCard>
              <HoverCardTrigger className="flex items-center gap-1 cursor-help w-max">
                <span className="text-[10px] text-slate-400 uppercase border-b border-dashed border-slate-500 pb-0.5">Max Pain Pin-Risk</span>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 text-xs">
                <div className="space-y-2">
                  <h4 className="font-bold">What is Max Pain?</h4>
                  <p className="text-muted-foreground">
                    Max Pain is the strike price where the highest number of options contracts will expire worthless. 
                    Institutional market makers are often incentivized to push the stock price towards this level to minimize their payouts to retail traders.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-base font-extrabold text-amber-400 font-mono">
                ${chainData.max_pain_strike}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Institutional Target
              </span>
            </div>
            <span className="text-[10px] text-slate-500">Minimal writer payout strike</span>
          </div>

          {/* Put-Call Ratio (PCR) */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <HoverCard>
              <HoverCardTrigger className="flex items-center gap-1 cursor-help w-max">
                <span className="text-[10px] text-slate-400 uppercase border-b border-dashed border-slate-500 pb-0.5">Put-Call Ratio (PCR)</span>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 text-xs">
                <div className="space-y-2">
                  <h4 className="font-bold">What is the Put-Call Ratio?</h4>
                  <p className="text-muted-foreground">
                    It measures market sentiment by dividing Put volume by Call volume. 
                    <br/><br/>
                    • <strong>High PCR (› 1.0):</strong> Bearish sentiment (fear). Often a contrarian signal that a bottom is near.<br/>
                    • <strong>Low PCR (‹ 0.7):</strong> Bullish sentiment (greed). Often a contrarian signal that a top is near.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-base font-extrabold text-emerald-400 font-mono">
                {chainData.put_call_ratio}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                chainData.put_call_ratio > 1.2
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : chainData.put_call_ratio < 0.7
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'bg-blue-500/20 text-blue-300'
              }`}>
                {chainData.put_call_ratio > 1.2 ? 'BULLISH BIAS' : chainData.put_call_ratio < 0.7 ? 'BEARISH BIAS' : 'BALANCED'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 line-clamp-1">{chainData.pcr_sentiment}</span>
          </div>

          {/* Open Interest Depth */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-slate-400 block uppercase">Open Interest Volume</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-emerald-400 font-bold">Calls: {chainData.total_call_open_interest.toLocaleString()}</span>
              <span>•</span>
              <span className="text-xs text-rose-400 font-bold">Puts: {chainData.total_put_open_interest.toLocaleString()}</span>
            </div>
            <span className="text-[10px] text-slate-500">Total institutional contract depth</span>
          </div>
        </div>
      )}

      {/* 3. Tab Switcher: Options Chain vs Multi-Leg Payoff Simulator */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setViewTab('chain')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            viewTab === 'chain'
              ? 'bg-purple-600 text-white shadow'
              : 'bg-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 size={13} /> Interactive Chain & Greeks Matrix
        </button>
        <button
          type="button"
          onClick={() => setViewTab('payoff')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            viewTab === 'payoff'
              ? 'bg-purple-600 text-white shadow'
              : 'bg-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <Scale size={13} /> Multi-Leg Strategy Payoff Simulator
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: INTERACTIVE OPTIONS CHAIN & GREEKS MATRIX                    */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {viewTab === 'chain' && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] text-slate-400 uppercase bg-white/5 border-b border-white/10">
                <tr>
                  {/* Calls Side */}
                  <th className="py-2.5 px-3 text-emerald-400 font-bold">Call Price</th>
                  <th className="py-2.5 px-2 text-slate-300">
                    <HoverCard>
                      <HoverCardTrigger className="cursor-help border-b border-dashed border-slate-500 pb-0.5">Delta (Δ)</HoverCardTrigger>
                      <HoverCardContent className="w-80 text-xs text-left font-sans normal-case text-foreground">
                        <strong className="block mb-1">Delta (Δ)</strong>
                        Measures how much the option's price changes for every $1 move in the underlying stock. A Delta of 0.50 means the option gains $0.50 if the stock goes up by $1. It also roughly represents the probability of the option expiring in the money.
                      </HoverCardContent>
                    </HoverCard>
                  </th>
                  <th className="py-2.5 px-2 text-slate-300">
                    <HoverCard>
                      <HoverCardTrigger className="cursor-help border-b border-dashed border-slate-500 pb-0.5">Theta (Θ)</HoverCardTrigger>
                      <HoverCardContent className="w-80 text-xs text-left font-sans normal-case text-foreground">
                        <strong className="block mb-1">Theta (Θ)</strong>
                        Time decay. Represents how much value the option loses each day just from time passing, assuming the stock price doesn't move. Option buyers bleed Theta; option sellers collect it.
                      </HoverCardContent>
                    </HoverCard>
                  </th>
                  <th className="py-2.5 px-2 text-slate-300 text-right">Call OI</th>

                  {/* Center Strike */}
                  <th className="py-2.5 px-4 text-center bg-white/10 text-white font-black">Strike Price</th>

                  {/* Puts Side */}
                  <th className="py-2.5 px-2 text-slate-300">Put OI</th>
                  <th className="py-2.5 px-2 text-slate-300">Theta (Θ)</th>
                  <th className="py-2.5 px-2 text-slate-300">Delta (Δ)</th>
                  <th className="py-2.5 px-3 text-rose-400 font-bold text-right">Put Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {chainData?.chain?.map((row) => {
                  const isAtm = Math.abs(row.strike - spotPrice) <= 5.0
                  const isMaxPain = row.strike === chainData.max_pain_strike

                  return (
                    <tr
                      key={row.strike}
                      className={`hover:bg-white/5 transition-colors ${
                        isAtm ? 'bg-purple-950/20' : ''
                      }`}
                    >
                      {/* Call Side */}
                      <td className="py-2 px-3 text-emerald-400 font-bold">
                        ${row.call.price.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-slate-300 font-semibold">
                        +{row.call.delta.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-rose-400/80">
                        {row.call.theta.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-right text-slate-400">
                        {row.call.oi.toLocaleString()}
                      </td>

                      {/* Center Strike */}
                      <td className={`py-2 px-4 text-center font-black ${
                        isAtm ? 'bg-purple-600/30 text-white' : 'bg-white/5 text-slate-200'
                      }`}>
                        <div className="flex items-center justify-center gap-1.5">
                          <span>${row.strike.toFixed(2)}</span>
                          {isMaxPain && (
                            <span className="text-[9px] px-1 rounded bg-amber-500 text-black font-extrabold uppercase">
                              PAIN
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Put Side */}
                      <td className="py-2 px-2 text-slate-400">
                        {row.put.oi.toLocaleString()}
                      </td>
                      <td className="py-2 px-2 text-rose-400/80">
                        {row.put.theta.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-slate-300 font-semibold">
                        {row.put.delta.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right text-rose-400 font-bold">
                        ${row.put.price.toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: MULTI-LEG STRATEGY PAYOFF SIMULATOR                          */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {viewTab === 'payoff' && payoffData && (
        <div className="space-y-4 text-xs">
          {/* Strategy Archetype Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'BULL_CALL_SPREAD', label: 'Bull Call Spread (Protected Growth)' },
              { id: 'BEAR_PUT_SPREAD', label: 'Bear Put Spread (Hedge Downside)' },
              { id: 'LONG_STRADDLE', label: 'Long Straddle (Volatility Expansion)' },
              { id: 'COVERED_CALL', label: 'Covered Call (Yield Income)' },
              { id: 'CASH_SECURED_PUT', label: 'Cash-Secured Put (Discount Entry)' },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedStrategy(s.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedStrategy === s.id
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Strategy Overview & Risk/Reward Box */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  {payoffData.strategy.replace(/_/g, ' ')} · {symbol}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{payoffData.thesis}</p>
              </div>

              {onExecuteStrategy && (
                <button
                  type="button"
                  onClick={() => {
                    onExecuteStrategy({
                      symbol,
                      side: 'BUY',
                      quantity: 1,
                      order_type: 'MARKET',
                      strategy_id: `Options ${payoffData.strategy}`,
                    })
                    toast.success(`Strategy ${payoffData.strategy} deployed to Paper Sandbox!`)
                  }}
                  disabled={isExecuting}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all disabled:opacity-50 shrink-0"
                >
                  <Play size={13} />
                  Deploy Multi-Leg to Sandbox
                </button>
              )}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/5">
              <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                <span className="text-[10px] text-slate-400 block">Max Profit</span>
                <span className="font-extrabold text-emerald-400 font-mono text-sm">
                  {typeof payoffData.max_profit === 'number' ? `$${payoffData.max_profit.toFixed(2)}` : payoffData.max_profit}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                <span className="text-[10px] text-slate-400 block">Max Loss</span>
                <span className="font-extrabold text-rose-400 font-mono text-sm">
                  ${payoffData.max_loss?.toFixed(2)}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                <span className="text-[10px] text-slate-400 block">Breakeven</span>
                <span className="font-extrabold text-amber-400 font-mono text-sm">
                  {typeof payoffData.breakeven === 'number' ? `$${payoffData.breakeven.toFixed(2)}` : payoffData.breakeven}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                <span className="text-[10px] text-slate-400 block">Net Debit / Credit</span>
                <span className="font-extrabold text-white font-mono text-sm">
                  ${payoffData.net_debit?.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Strategy Legs */}
            <div className="pt-2 border-t border-white/5">
              <span className="text-[10px] text-slate-500 uppercase tracking-wide block mb-1">Execution Legs:</span>
              <div className="flex items-center gap-3 flex-wrap">
                {payoffData.legs?.map((leg: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-1 rounded-md bg-white/5 text-slate-300 font-mono text-[11px] border border-white/5">
                    {leg}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Payoff Curve Visual Chart */}
          <div className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-white">Terminal Profit / Loss Diagram at Expiry</span>
              <span className="font-mono text-[11px]">Underlying: ${spotPrice.toFixed(2)}</span>
            </div>

            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={payoffData.payoff_curve}>
                <defs>
                  <linearGradient id="pnlGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="price" stroke="#64748b" tickFormatter={(v) => `$${v}`} />
                <YAxis stroke="#64748b" tickFormatter={(v) => `$${v}`} />
                <RechartsTooltip
                  formatter={(val: any) => [`$${val}`, 'P&L']}
                  labelFormatter={(lbl) => `Price: $${lbl}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                <ReferenceLine x={spotPrice} stroke="#a855f7" strokeDasharray="4 4" label="Spot" />
                <Area type="monotone" dataKey="pnl" stroke="#8b5cf6" strokeWidth={2} fill="url(#pnlGreen)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
