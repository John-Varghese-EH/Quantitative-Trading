/**
 * QuantAdv - Quantitative Trading Platform
 * Copyright (C) 2026 John Varghese (J0X)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
"use client";

import { useDashboardStats } from "@/hooks/useDashboardData";
import { useAppStore } from "@/store/useAppStore";
import { formatCurrency } from "@/utils/currency";
import { DollarSign, TrendingUp, TrendingDown, Target, Brain, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

export default function MetricsRow() {
  const { data: stats, isLoading } = useDashboardStats();
  const { currency } = useAppStore();

  if (isLoading || !stats) {
    return (
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-1.5 rounded-2xl bg-muted/40 ring-1 ring-border/60 animate-pulse">
            <Card className="border-0 shadow-none bg-card rounded-xl h-[104px]" />
          </div>
        ))}
      </div>
    );
  }

  const pnlIsPositive = stats.daily_pnl >= 0;
  
  const metrics = [
    {
      title: "Total Portfolio Value",
      icon: DollarSign,
      value: formatCurrency(stats.portfolio_value, currency),
      subtitle: `${stats.daily_pnl_pct >= 0 ? "+" : ""}${stats.daily_pnl_pct.toFixed(2)}% today`,
      valueColor: "text-foreground"
    },
    {
      title: "Daily P&L",
      icon: pnlIsPositive ? TrendingUp : TrendingDown,
      value: `${pnlIsPositive ? "+" : ""}${formatCurrency(stats.daily_pnl, currency)}`,
      subtitle: "Past 24 hours",
      valueColor: pnlIsPositive ? "text-chart-2" : "text-chart-3"
    },
    {
      title: "Win Rate",
      icon: Target,
      value: `${stats.win_rate.toFixed(1)}%`,
      subtitle: `${stats.total_trades} trades executed`,
      valueColor: "text-foreground"
    },
    {
      title: "AI Confidence",
      icon: Brain,
      value: `${stats.ai_confidence.toFixed(1)}%`,
      subtitle: `${stats.ready_models} models ready`,
      valueColor: "text-foreground"
    },
    {
      title: "Risk Score",
      icon: Shield,
      value: `${stats.risk_score}/100`,
      subtitle: "Market volatility index",
      valueColor: stats.risk_score < 30 ? "text-chart-2" : stats.risk_score <= 60 ? "text-yellow-500" : "text-chart-3"
    },
    {
      title: "Best Strategy",
      icon: TrendingUp,
      value: `+${stats.best_strategy_return.toFixed(2)}%`,
      subtitle: "Top backtest return",
      valueColor: "text-chart-2"
    }
  ];

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {metrics.map((metric, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="p-1.5 rounded-2xl bg-muted/40 ring-1 ring-border/60"
        >
          <Card className="border-0 shadow-none bg-card rounded-xl h-full flex flex-col justify-between p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">{metric.title}</span>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <div className={`text-2xl font-semibold font-mono ${metric.valueColor}`}>
                {metric.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{metric.subtitle}</div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
