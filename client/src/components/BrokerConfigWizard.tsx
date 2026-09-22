"use client";
/**
 * QuantAdv - Quantitative Trading Platform
 * Copyright (C) 2026 John Varghese (J0X)
 * AGPL-3.0 License
 *
 * Multi-Broker Auto-Config Wizard & Connectivity Gateway
 * Supports Indian Equities (Zerodha, Angel One, Upstox, Dhan via OpenAlgo),
 * US Equities & Options (Alpaca Markets), Crypto (Binance/CCXT), and Paper Simulator.
 */

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Key, Shield, CheckCircle2, XCircle, ExternalLink,
  RefreshCw, Eye, EyeOff, Zap, Server, ChevronDown, ChevronUp,
  Lock
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/services/api'
import { useAppStore } from '@/store/useAppStore'
import { formatCurrency } from '@/utils/currency'

interface BrokerMeta {
  id: string
  name: string
  region: string
  category: string
  docsUrl: string
  fields: string[]
  is_connected?: boolean
  account_id?: string
  last_tested?: string
  masked_key?: string
}

export function BrokerConfigWizard() {
  const queryClient = useQueryClient()
  const { currency } = useAppStore()

  // Region filter state
  const [regionFilter, setRegionFilter] = useState<'ALL' | 'IN' | 'US' | 'CRYPTO' | 'SIM'>('ALL')
  // Expanded broker ID for accordion config
  const [expandedBrokerId, setExpandedBrokerId] = useState<string | null>('paper')
  // Form credentials state keyed by broker ID
  const [credentials, setCredentials] = useState<Record<string, Record<string, any>>>({})
  // Password visibility state
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({})
  // Test results state keyed by broker ID
  const [testResults, setTestResults] = useState<Record<string, any>>({})

  // 1. Fetch brokers list from backend
  const { data: brokers = [], isLoading, refetch } = useQuery<BrokerMeta[]>({
    queryKey: ['brokers-list'],
    queryFn: () => api.get('/trading/brokers/list').then(r => r.data.brokers || []),
  })

  // 2. Configure broker mutation
  const configureMutation = useMutation({
    mutationFn: (payload: { broker_id: string; credentials: Record<string, any> }) =>
      api.post('/trading/brokers/configure', payload).then(r => r.data),
    onSuccess: (data, vars) => {
      toast.success(`${vars.broker_id.toUpperCase()} credentials encrypted & saved!`)
      queryClient.invalidateQueries({ queryKey: ['brokers-list'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to save credentials')
    },
  })

  // 3. Test broker connection mutation
  const testMutation = useMutation({
    mutationFn: (broker_id: string) =>
      api.post(`/trading/brokers/test?broker_id=${broker_id}`).then(r => r.data),
    onSuccess: (data, broker_id) => {
      setTestResults(prev => ({ ...prev, [broker_id]: data }))
      if (data.status === 'CONNECTED') {
        toast.success(`Connected to ${data.broker}! Latency: ${data.latency_ms}ms`)
      } else {
        toast.error(`Connection check: ${data.message || data.status}`)
      }
      queryClient.invalidateQueries({ queryKey: ['brokers-list'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Ping handshake failed')
    },
  })

  const handleInputChange = (brokerId: string, field: string, val: any) => {
    setCredentials(prev => ({
      ...prev,
      [brokerId]: {
        ...(prev[brokerId] || {}),
        [field]: val,
      },
    }))
  }

  const togglePasswordVisibility = (fieldKey: string) => {
    setShowSecret(prev => ({ ...prev, [fieldKey]: !prev[fieldKey] }))
  }

  // Filter brokers
  const filteredBrokers = brokers.filter(b => {
    if (regionFilter === 'ALL') return true
    if (regionFilter === 'IN') return b.region === 'IN'
    if (regionFilter === 'US') return b.region === 'US'
    if (regionFilter === 'CRYPTO') return b.region === 'CRYPTO'
    if (regionFilter === 'SIM') return b.id === 'paper' || b.region === 'ALL'
    return true
  })

  const getRegionBadge = (region: string) => {
    switch (region) {
      case 'IN':
        return { label: '🇮🇳 India (NSE/BSE)', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' }
      case 'US':
        return { label: '🇺🇸 US Equities & Crypto', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' }
      case 'CRYPTO':
        return { label: '🪙 Global Crypto', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' }
      default:
        return { label: '🧪 Simulated Sandbox', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
    }
  }

  const getComplianceNote = (id: string, region: string) => {
    if (id === 'paper') {
      return '100% Free Simulated Sandbox · Real-Time Slippage (0.05%) & Fee Modeling · Zero Financial Risk'
    }
    if (region === 'IN') {
      return 'SEBI Regulated · Zero-Brokerage Direct Bridge via OpenAlgo · Non-Custodial Multi-Account'
    }
    if (region === 'US') {
      return 'SEC Rule 15c3-5 Fat-Finger Guards · FINRA Member SIPC Protected · Fractional Shares Supported'
    }
    return 'HMAC-SHA256 Encrypted Signatures · IP-Whitelisted Rest API · Non-Custodial Execution'
  }

  const formatFieldName = (f: string) => {
    switch (f) {
      case 'api_key': return 'API Key'
      case 'secret_key':
      case 'api_secret':
      case 'client_secret': return 'API Secret Key'
      case 'client_id': return 'Client ID / UCC'
      case 'access_token': return 'Access Token'
      case 'totp': return 'TOTP 2FA Secret Key'
      case 'password': return 'Portal Password'
      case 'redirect_uri': return 'Redirect URI'
      case 'is_paper': return 'Paper / Sandbox Mode'
      case 'testnet': return 'Testnet Mode'
      default: return f.replace('_', ' ').toUpperCase()
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Security Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Key size={20} className="text-blue-400" /> Multi-Broker Auto-Config Gateway
          </h2>
          <p className="text-xs text-slate-400">
            Connect verified institutional broker APIs or deploy with our built-in high-fidelity paper trading engine.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          Refresh Status
        </button>
      </div>

      {/* Security & Regulatory Firewall Guarantee */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-black/40 border border-blue-500/20 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-blue-300">
          <Shield size={16} className="text-blue-400" />
          <span>Non-Custodial Security & Regulatory Compliance Guarantee</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          All API secrets are encrypted locally and stored in protected memory. We strictly enforce
          <strong> Zero-Withdrawal permission policies</strong>—your API credentials should only permit trade execution
          and position reading. Pre-trade compliance firewalls (SEC 15c3-5 notional caps, SEBI circuit limits, and MiFID II RTS 6 throttles)
          automatically intercept every order prior to transmission.
        </p>
      </div>

      {/* 2. Region Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'ALL', label: `All Connectors (${brokers.length})` },
          { id: 'IN', label: '🇮🇳 Indian Equities (NSE/BSE via OpenAlgo)' },
          { id: 'US', label: '🇺🇸 US Equities (Alpaca)' },
          { id: 'CRYPTO', label: '🪙 Crypto (Binance)' },
          { id: 'SIM', label: '🧪 Paper Sandbox' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setRegionFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
              regionFilter === tab.id
                ? 'bg-blue-600 text-white shadow'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Broker Connectors List */}
      <div className="space-y-4">
        {filteredBrokers.map(broker => {
          const isExpanded = expandedBrokerId === broker.id
          const regionBadge = getRegionBadge(broker.region)
          const complianceNote = getComplianceNote(broker.id, broker.region)
          const testRes = testResults[broker.id]
          const isTesting = testMutation.isPending && testMutation.variables === broker.id
          const isSaving = configureMutation.isPending && configureMutation.variables?.broker_id === broker.id

          return (
            <div
              key={broker.id}
              className={`rounded-2xl border transition-all ${
                broker.is_connected
                  ? 'bg-white/[0.03] border-emerald-500/20'
                  : 'bg-white/[0.02] border-white/10'
              }`}
            >
              {/* Summary Bar */}
              <div
                onClick={() => setExpandedBrokerId(isExpanded ? null : broker.id)}
                className="p-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl border flex items-center justify-center ${
                      broker.id === 'paper'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : broker.region === 'IN'
                        ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                        : broker.region === 'US'
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    }`}
                  >
                    <Server size={20} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-white">{broker.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${regionBadge.color}`}>
                        {regionBadge.label}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-400">
                        {broker.category}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {complianceNote}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto text-xs shrink-0">
                  {/* Connection Status Badge */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        broker.is_connected ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
                      }`}
                    />
                    <span
                      className={`font-semibold ${
                        broker.is_connected ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      {broker.is_connected ? 'Active & Ready' : 'Not Configured'}
                    </span>
                  </div>

                  {broker.account_id && (
                    <span className="text-[10px] px-2 py-1 rounded bg-black/40 text-slate-300 font-mono">
                      {broker.account_id}
                    </span>
                  )}

                  <div className="p-1 rounded-lg bg-white/5 text-slate-400">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
              </div>

              {/* Accordion Setup Form */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-5 border-t border-white/5 bg-black/20 rounded-b-2xl space-y-4"
                  >
                    {/* Setup Guidance */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-white/5 text-xs text-slate-300 border border-white/5">
                      <div className="flex items-center gap-2">
                        <Lock size={14} className="text-purple-400" />
                        <span>
                          Configure {broker.name} credentials to route algorithmic signals directly to exchange order books.
                        </span>
                      </div>
                      {broker.docsUrl && (
                        <a
                          href={broker.docsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold text-[11px]"
                        >
                          Official Docs <ExternalLink size={12} />
                        </a>
                      )}
                    </div>

                    {/* Form Fields if broker has inputs */}
                    {broker.fields && broker.fields.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {broker.fields.map(field => {
                          const fieldKey = `${broker.id}_${field}`
                          const isSecret = field.includes('secret') || field.includes('key') || field.includes('password') || field.includes('totp')
                          const isBoolean = field === 'is_paper' || field === 'testnet'
                          const isShowing = showSecret[fieldKey]

                          if (isBoolean) {
                            return (
                              <div key={field} className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10 md:col-span-2">
                                <div>
                                  <span className="text-xs font-bold text-white block">{formatFieldName(field)}</span>
                                  <span className="text-[11px] text-slate-400">Route orders to simulated testnet sandbox environment.</span>
                                </div>
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                  checked={credentials[broker.id]?.[field] ?? true}
                                  onChange={e => handleInputChange(broker.id, field, e.target.checked)}
                                />
                              </div>
                            )
                          }

                          return (
                            <div key={field}>
                              <label className="text-[11px] text-slate-400 font-medium block mb-1">
                                {formatFieldName(field)}
                              </label>
                              <div className="relative">
                                <input
                                  type={isSecret && !isShowing ? 'password' : 'text'}
                                  placeholder={`Enter ${formatFieldName(field)}`}
                                  value={credentials[broker.id]?.[field] || ''}
                                  onChange={e => handleInputChange(broker.id, field, e.target.value)}
                                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500/50"
                                />
                                {isSecret && (
                                  <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility(fieldKey)}
                                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                                  >
                                    {isShowing ? <EyeOff size={14} /> : <Eye size={14} />}
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                        QuantAdv Paper Simulator requires zero external API keys! It operates out of the box with institutional order-matching, realistic 0.05% slippage, and persistent account state.
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        {broker.fields && broker.fields.length > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              configureMutation.mutate({
                                broker_id: broker.id,
                                credentials: credentials[broker.id] || {},
                              })
                            }
                            disabled={isSaving}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                          >
                            <Lock size={13} />
                            {isSaving ? 'Encrypting & Saving…' : 'Save & Encrypt Keys'}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => testMutation.mutate(broker.id)}
                          disabled={isTesting}
                          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                        >
                          <Zap size={13} className="text-amber-400" />
                          {isTesting ? 'Pinging Gateway…' : 'Test Handshake & Ping'}
                        </button>
                      </div>

                      {broker.masked_key && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          Active Key: <strong className="text-slate-200">{broker.masked_key}</strong>
                        </span>
                      )}
                    </div>

                    {/* Live Ping Test Feedback Banner */}
                    {testRes && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                          testRes.status === 'CONNECTED'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold">
                            {testRes.status === 'CONNECTED' ? (
                              <CheckCircle2 size={16} className="text-emerald-400" />
                            ) : (
                              <XCircle size={16} className="text-rose-400" />
                            )}
                            <span>Handshake Status: {testRes.status}</span>
                          </div>

                          {testRes.latency_ms !== undefined && (
                            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-black/40 font-bold">
                              Latency: {testRes.latency_ms} ms
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-300">
                          {testRes.message}
                        </p>

                        {testRes.margin_available !== undefined && (
                          <div className="pt-1 text-[11px] text-slate-400 flex items-center gap-2">
                            <span>Available Trading Margin:</span>
                            <strong className="text-white font-mono">
                              {formatCurrency(testRes.margin_available, currency)}
                            </strong>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
