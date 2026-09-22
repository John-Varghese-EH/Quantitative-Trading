/**
 * QuantAdv - Quantitative Trading Platform
 * Copyright (C) 2026 John Varghese (J0X)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DashboardStats {
  portfolio_value: number;
  daily_pnl: number;
  daily_pnl_pct: number;
  ai_confidence: number;
  model_accuracy: number;
  risk_score: number;
  open_positions: number;
  total_trades: number;
  win_rate: number;
  total_models: number;
  ready_models: number;
  total_attacks: number;
  best_strategy_return: number;
}

export interface PortfolioHistory {
  history: Array<{ date: string; value: number }>;
  initial: number;
  current: number;
}

export interface Position {
  id: string;
  symbol: string;
  strategy: string;
  side: string;
  entry_price: number;
  current_price: number;
  quantity: number;
  unrealized_pnl: number;
  unrealized_pnl_pct?: number;
  opened_at: string;
}

export interface Trade {
  id: string;
  symbol: string;
  strategy: string;
  side: string;
  entry_price: number;
  exit_price: number;
  quantity: number;
  profit_loss: number;
  roi_percent: number;
  status: string;
  opened_at: string;
  closed_at: string;
}

export interface NewsArticle {
  title: string;
  source: string;
  impact: 'bullish' | 'bearish' | 'neutral';
  url?: string;
  published_at?: string;
}

export interface Bot {
  id: string;
  name: string;
  bot_type: string;
  symbol: string;
  status: 'RUNNING' | 'PAUSED' | 'STOPPED';
  mode: string;
  capital: number;
  pnl: number;
  pnl_pct: number;
  trades_executed: number;
  created_at: string;
}

export interface ScannerCandidate {
  symbol: string;
  signal_type: string;
  price: number;
  change_pct: number;
  volume_ratio: number;
  score: number;
  reason: string;
}

export interface ComplianceStatus {
  status: string;
  jurisdiction: string;
  static_ip_bound: boolean;
  static_ip_address: string;
  firewall_rules_active: number;
  recent_interventions: any[];
}

// ─── Hooks ──────────────────────────────────────────────────────────────────

/** Core dashboard stats — refreshes every 60s */
export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then(r => r.data),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

/** 30-day portfolio history chart data */
export function usePortfolioHistory(days = 30) {
  return useQuery<PortfolioHistory>({
    queryKey: ['portfolio-history', days],
    queryFn: () => api.get(`/dashboard/portfolio-history?days=${days}`).then(r => r.data),
    staleTime: 5 * 60_000,
  });
}

/** Open positions with real-time unrealized P&L */
export function usePositions() {
  return useQuery<Position[]>({
    queryKey: ['portfolio-positions'],
    queryFn: () =>
      api
        .get('/portfolio/positions')
        .then(r => r.data.positions)
        .catch(() => []),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

/** Recent closed trades */
export function useTradeHistory(limit = 10) {
  return useQuery<Trade[]>({
    queryKey: ['trade-history', limit],
    queryFn: () =>
      api
        .get(`/portfolio/history?limit=${limit}`)
        .then(r => r.data.trades)
        .catch(() => []),
    staleTime: 60_000,
  });
}

/** News feed with sentiment tagging */
export function useNewsFeed() {
  return useQuery<NewsArticle[]>({
    queryKey: ['news-feed'],
    queryFn: () =>
      api
        .get('/news/feed')
        .then(r => r.data.articles)
        .catch(() => []),
    staleTime: 5 * 60_000,
  });
}

/** Active autonomous trading bots */
export function useBots() {
  return useQuery<Bot[]>({
    queryKey: ['bots-list'],
    queryFn: () =>
      api
        .get('/trading/bots/list')
        .then(r => r.data.bots)
        .catch(() => []),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

/** Market scanner candidates */
export function useMarketScanner(market = 'ALL', signal = 'ALL') {
  return useQuery<ScannerCandidate[]>({
    queryKey: ['market-scanner', market, signal],
    queryFn: () =>
      api
        .get(`/trading/scanner/scan?market=${market}&signal=${signal}`)
        .then(r => r.data.candidates)
        .catch(() => []),
    staleTime: 2 * 60_000,
  });
}

/** Pre-trade compliance firewall status */
export function useComplianceStatus() {
  return useQuery<ComplianceStatus>({
    queryKey: ['compliance-status'],
    queryFn: () =>
      api
        .get('/trading/compliance/status')
        .then(r => r.data)
        .catch(() => null),
    staleTime: 60_000,
  });
}
