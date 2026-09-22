/**
 * QuantAdv - Quantitative Trading Platform
 * Copyright (C) 2026 John Varghese (J0X)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import React from "react";
import { Radar, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMarketScanner } from "@/hooks/useDashboardData";
import { formatCurrency } from "@/utils/currency";
import { useAppStore } from "@/store/useAppStore";

function DoubleBezel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-1.5 rounded-2xl bg-muted/40 ring-1 ring-border/60 ${className}`}>{children}</div>;
}

export default function MarketScannerWidget() {
  const { data: candidates, isLoading } = useMarketScanner("ALL", "ALL");
  const { currency } = useAppStore();

  const getSignalBadge = (signal: string) => {
    switch (signal) {
      case "BREAKOUT": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "VOLUME_SURGE": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "OVERSOLD_DIP": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "MOMENTUM_RUN": return "bg-chart-2/10 text-chart-2 border-chart-2/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const formatSignal = (signal: string) => {
    return signal.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const sortedCandidates = candidates ? [...candidates].sort((a, b) => b.score - a.score).slice(0, 5) : [];

  return (
    <DoubleBezel>
      <Card className="border-0 shadow-none bg-card rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Radar className="w-5 h-5 text-primary" />
            Market Scanner
          </CardTitle>
          <CardDescription>Real-time opportunity detection</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : sortedCandidates.length > 0 ? (
            <div className="space-y-2">
              {sortedCandidates.map((candidate) => (
                <div key={`${candidate.symbol}-${candidate.signal_type}`} className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-sm font-mono w-14">{candidate.symbol}</div>
                    <Badge variant="outline" className={`text-[10px] py-0 h-5 px-1.5 whitespace-nowrap ${getSignalBadge(candidate.signal_type)}`}>
                      {formatSignal(candidate.signal_type)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-mono">{formatCurrency(candidate.price, currency)}</span>
                      <span className={`text-[10px] font-mono flex items-center ${candidate.change_pct >= 0 ? 'text-chart-2' : 'text-chart-3'}`}>
                        {candidate.change_pct >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                        {Math.abs(candidate.change_pct * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden flex-shrink-0">
                      <div 
                        className={`h-full rounded-full ${candidate.score > 80 ? 'bg-chart-2' : candidate.score > 60 ? 'bg-blue-500' : 'bg-muted-foreground'}`}
                        style={{ width: `${candidate.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Radar className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No scanner signals right now. Markets may be closed or conditions are quiet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </DoubleBezel>
  );
}
