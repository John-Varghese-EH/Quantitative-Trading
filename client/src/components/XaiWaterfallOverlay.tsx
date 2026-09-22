"use client";
/**
 * QuantAdv - Quantitative Trading Platform
 * Copyright (C) 2026 John Varghese (J0X)
 * AGPL-3.0 License
 *
 * Explainable AI (XAI) Signal Overlay & SHAP Waterfall Attribution Component
 * Demystifies Multi-Agent AI Council decisions with transparent feature contributions,
 * divergent SHAP attribution bars, and adversarial stress-testing logs.
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cpu, CheckCircle2, AlertTriangle,
  Info, Maximize2, X, Scale, ShieldAlert,
  Play, Activity
} from 'lucide-react'
import { formatCurrency } from '@/utils/currency'
import { useAppStore } from '@/store/useAppStore'

export interface XaiFeatureItem {
  feature: string
  category?: string
  shap_value: number
  direction: 'POSITIVE' | 'NEGATIVE' | 'BULLISH' | 'BEARISH'
  description: string
}

export interface AgentOpinionItem {
  agent_name: string
  role: string
  stance: string
  confidence: number
  summary: string
  key_factors?: string[]
  metrics?: Record<string, any>
}

export interface CouncilDecisionData {
  symbol: string
  timestamp?: string
  final_verdict: string
  overall_confidence: number
  consensus_score: number
  suggested_action: string
  risk_level: string
  recommended_position_pct: number
  suggested_stop_loss?: number
  suggested_take_profit?: number
  risk_reward_ratio: number
  red_team_warnings: string[]
  compliance_passed: boolean
  explanation: string
  xai_waterfall: XaiFeatureItem[]
  base_value?: number
  agent_opinions: AgentOpinionItem[]
}

interface XaiWaterfallOverlayProps {
  decision: CouncilDecisionData
  onExecuteOrder?: (payload: any) => void
  isExecuting?: boolean
  initialTab?: 'waterfall' | 'votes' | 'risk'
  embedded?: boolean
}

export function XaiWaterfallOverlay({
  decision,
  onExecuteOrder,
  isExecuting = false,
  initialTab = 'waterfall',
  embedded = false,
}: XaiWaterfallOverlayProps) {
  const { currency } = useAppStore()
  const [activeTab, setActiveTab] = useState<'waterfall' | 'votes' | 'risk'>(initialTab)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const waterfall = decision.xai_waterfall || []
  const opinions = decision.agent_opinions || []

  // Compute positive & negative cumulative forces
  const positiveSum = waterfall
    .filter(f => f.shap_value > 0)
    .reduce((acc, f) => acc + f.shap_value, 0)
  const negativeSum = waterfall
    .filter(f => f.shap_value < 0)
    .reduce((acc, f) => acc + f.shap_value, 0)

  // Max absolute SHAP value for scaling bars (minimum 0.3 to prevent tiny divisions)
  const maxAbsShap = Math.max(
    0.35,
    ...waterfall.map(f => Math.abs(f.shap_value))
  )

  const verdictColor = decision.final_verdict.includes('BUY')
    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    : decision.final_verdict.includes('SELL')
    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'

  const content = (isExpanded: boolean) => (
    <div className="space-y-4">
      {/* 1. Header Summary Ribbon */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-black/40 to-blue-950/40 border border-purple-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">{decision.symbol}</span>
              <span className={`text-xs font-black px-2.5 py-0.5 rounded-md border ${verdictColor}`}>
                {decision.final_verdict.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400">
                Score: <strong className="text-white">{decision.consensus_score > 0 ? `+${decision.consensus_score}` : decision.consensus_score}</strong>
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl line-clamp-2">
              {decision.explanation}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs shrink-0">
            <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-center min-w-[75px]">
              <span className="text-[10px] text-slate-400 block">Confidence</span>
              <span className="font-extrabold text-white">{(decision.overall_confidence * 100).toFixed(0)}%</span>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-center min-w-[75px]">
              <span className="text-[10px] text-slate-400 block">R / R Ratio</span>
              <span className="font-extrabold text-emerald-400">{decision.risk_reward_ratio}:1</span>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-center min-w-[75px]">
              <span className="text-[10px] text-slate-400 block">Rec. Size</span>
              <span className="font-extrabold text-blue-400">{decision.recommended_position_pct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('waterfall')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'waterfall'
                ? 'bg-purple-600 text-white shadow'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Activity size={13} /> SHAP Feature Waterfall ({waterfall.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('votes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'votes'
                ? 'bg-purple-600 text-white shadow'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Cpu size={13} /> 5-Agent Council Matrix ({opinions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('risk')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'risk'
                ? 'bg-purple-600 text-white shadow'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert size={13} /> CRO & Red Team Audit
          </button>
        </div>

        {!isExpanded && embedded && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 px-2 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 transition-colors"
          >
            <Maximize2 size={12} /> Expand Deep Inspection
          </button>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: SHAP WATERFALL DECOMPOSITION                                 */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'waterfall' && (
        <div className="space-y-4">
          {/* Methodology Callout */}
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-2.5 text-xs text-blue-300">
            <Info size={16} className="shrink-0 mt-0.5 text-blue-400" />
            <div>
              <span className="font-semibold text-white">Shapley Additive Explanations (SHAP):</span> Each bar below represents the quantitative feature's mathematical pull on the council consensus. Green bars pushed toward a <strong className="text-emerald-300">BUY</strong>, while red bars exerted friction, downward pull, or <strong className="text-rose-300">Red Team skepticism</strong>.
            </div>
          </div>

          {/* Aggregate Force Gauge */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Bullish Signals</span>
              <span className="text-sm font-bold text-emerald-400">+{positiveSum.toFixed(3)}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Bearish / Red Team</span>
              <span className="text-sm font-bold text-rose-400">{negativeSum.toFixed(3)}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Net AI Conviction</span>
              <span className={`text-sm font-black ${decision.consensus_score >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {decision.consensus_score > 0 ? `+${decision.consensus_score}` : decision.consensus_score}
              </span>
            </div>
          </div>

          {/* Divergent SHAP Waterfall Bars */}
          <div className="space-y-2.5 pt-1">
            {/* Axis Header */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase px-2">
              <span>Feature & Category</span>
              <div className="flex items-center gap-10">
                <span className="text-rose-400">◀ Bearish Friction (-0.5)</span>
                <span className="text-slate-400 font-bold">Neutral (0.0)</span>
                <span className="text-emerald-400">Bullish Push (+0.5) ▶</span>
              </div>
            </div>

            {waterfall.map((item, idx) => {
              const isPositive = item.shap_value >= 0
              const absVal = Math.abs(item.shap_value)
              const barWidthPct = Math.min(100, Math.round((absVal / maxAbsShap) * 100))

              return (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/[0.08] border border-white/5 transition-all text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{item.feature}</span>
                      {item.category && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                        isPositive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isPositive ? `+${item.shap_value.toFixed(3)}` : item.shap_value.toFixed(3)}
                    </span>
                  </div>

                  {/* Divergent Track */}
                  <div className="relative h-4 bg-black/40 rounded-full overflow-hidden border border-white/10 flex">
                    {/* Left half (Negative) */}
                    <div className="w-1/2 h-full flex justify-end items-center pr-0.5">
                      {!isPositive && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${barWidthPct}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.05 }}
                          className="h-2.5 rounded-l-full bg-gradient-to-l from-rose-500 to-amber-500"
                        />
                      )}
                    </div>

                    {/* Center Divider */}
                    <div className="w-[2px] h-full bg-slate-400/50 z-10" />

                    {/* Right half (Positive) */}
                    <div className="w-1/2 h-full flex justify-start items-center pl-0.5">
                      {isPositive && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${barWidthPct}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.05 }}
                          className="h-2.5 rounded-r-full bg-gradient-to-r from-emerald-500 to-teal-400"
                        />
                      )}
                    </div>
                  </div>

                  {/* Context Explanation */}
                  <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                    {item.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: 5-AGENT COUNCIL OPINION MATRIX                               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'votes' && (
        <div className="space-y-3">
          {opinions.map((op, idx) => {
            const isBull = op.stance === 'BULLISH' || op.stance === 'APPROVED'
            const isCaution = op.stance === 'CAUTION'
            const isBear = op.stance === 'BEARISH'

            const badgeStyle = isBull
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : isCaution
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : isBear
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              : 'bg-slate-500/20 text-slate-300 border-slate-500/30'

            return (
              <motion.div
                key={op.agent_name || idx}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className="p-3.5 rounded-xl bg-white/5 hover:bg-white/[0.08] border border-white/10 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{op.agent_name}</span>
                      <span className="text-[11px] text-slate-400">({op.role})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] border ${badgeStyle}`}>
                      {op.stance}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Conf: {(op.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed text-xs">
                  {op.summary}
                </p>

                {op.key_factors && op.key_factors.length > 0 && (
                  <div className="pt-1 border-t border-white/5">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide block mb-1">Key Factors & Signals:</span>
                    <ul className="space-y-1 text-[11px] text-slate-400 list-disc list-inside">
                      {op.key_factors.map((kf, kfIdx) => (
                        <li key={kfIdx}>{kf}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: CRO & ADVERSARIAL RED TEAM AUDIT                            */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'risk' && (
        <div className="space-y-4 text-xs">
          {/* Red Team Flags */}
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
              <ShieldAlert size={16} /> Adversarial Red Team Audit (QuantAdv Signature)
            </div>
            <p className="text-slate-300 text-xs">
              Our adversarial agent actively attacks the strategy, seeking out bull traps, volume wash-outs, earnings volatility hazards, and regime shift traps.
            </p>

            {decision.red_team_warnings && decision.red_team_warnings.length > 0 ? (
              <div className="space-y-1.5 pt-2">
                {decision.red_team_warnings.map((w, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-rose-200 text-xs p-2 rounded-lg bg-rose-950/30 border border-rose-500/20">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5 text-rose-400" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
                <CheckCircle2 size={15} />
                <span>Passed all adversarial stress tests without high-severity warnings.</span>
              </div>
            )}
          </div>

          {/* CRO Execution Collar */}
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-3">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
              <Scale size={16} /> Chief Risk Officer (CRO) Parameters
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-400 block">Stop-Loss Collar</span>
                <span className="font-extrabold text-rose-400 text-sm">
                  {decision.suggested_stop_loss ? formatCurrency(decision.suggested_stop_loss, currency) : 'N/A'}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-400 block">Take-Profit Target</span>
                <span className="font-extrabold text-emerald-400 text-sm">
                  {decision.suggested_take_profit ? formatCurrency(decision.suggested_take_profit, currency) : 'N/A'}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-400 block">Max Position Sizing</span>
                <span className="font-extrabold text-blue-400 text-sm">
                  {decision.recommended_position_pct}%
                </span>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-400 block">Risk / Reward</span>
                <span className="font-extrabold text-white text-sm">
                  {decision.risk_reward_ratio}:1
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              * Enforced under Pre-Trade Compliance Rule SEC 15c3-5 and SEBI dynamic price collars.
            </p>
          </div>
        </div>
      )}

      {/* 3. Action Execution CTA */}
      {onExecuteOrder && (
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            Action: <strong className="text-white">{decision.suggested_action}</strong>
          </span>
          <button
            type="button"
            onClick={() => onExecuteOrder({
              symbol: decision.symbol,
              side: decision.final_verdict.includes('SELL') ? 'SELL' : 'BUY',
              quantity: 10,
              order_type: 'MARKET',
              stop_loss: decision.suggested_stop_loss,
              take_profit: decision.suggested_take_profit,
              strategy_id: 'AI Council XAI Deliberation',
            })}
            disabled={isExecuting}
            className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50"
          >
            <Play size={13} />
            {isExecuting ? 'Routing Order…' : `Execute Council ${decision.final_verdict.includes('SELL') ? 'SELL' : 'BUY'} (${decision.symbol})`}
          </button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Inline Embedded Card */}
      {content(false)}

      {/* Deep Inspection Fullscreen Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto glass p-6 rounded-2xl border border-white/20 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                    <Cpu size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      Deep Explainable AI (XAI) & SHAP Waterfall Analysis
                    </h2>
                    <p className="text-xs text-slate-400">
                      Transparent quantitative feature attribution powered by 5-Agent Council deliberation
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {content(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
