/**
 * QuantAdv - Quantitative Trading Platform
 * Copyright (C) 2026 John Varghese (J0X)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
"use client";

import { useTradeHistory } from "@/hooks/useDashboardData";
import { useAppStore } from "@/store/useAppStore";
import { formatCurrencyCompact } from "@/utils/currency";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import Link from "next/link";

function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
}

export default function RecentTradesWidget() {
  const { data: trades, isLoading } = useTradeHistory(8);
  const { currency } = useAppStore();

  if (isLoading || !trades) {
    return (
      <div className="p-1.5 rounded-2xl bg-muted/40 ring-1 ring-border/60 h-full">
        <Card className="border-0 shadow-none bg-card rounded-xl h-full flex flex-col">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest closed trades</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center animate-pulse">
                <div className="flex space-x-3 items-center">
                  <div className="h-6 w-12 bg-muted rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 w-16 bg-muted rounded" />
                    <div className="h-3 w-20 bg-muted rounded" />
                  </div>
                </div>
                <div className="space-y-2 items-end flex flex-col">
                  <div className="h-4 w-14 bg-muted rounded" />
                  <div className="h-3 w-10 bg-muted rounded" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-1.5 rounded-2xl bg-muted/40 ring-1 ring-border/60 h-full flex flex-col">
      <Card className="border-0 shadow-none bg-card rounded-xl flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest closed trades</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {trades.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <p className="text-muted-foreground mb-4">No trade history yet. Run a backtest or execute a trade.</p>
              <Button render={<Link href="/trading" />}><Play className="mr-2 h-4 w-4" /> Run Backtest</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {trades.map((trade) => {
                const isPositive = trade.profit_loss >= 0;
                return (
                  <div key={trade.id} className="flex justify-between items-center">
                    <div className="flex space-x-3 items-center">
                      <Badge variant="outline" className={`w-12 justify-center font-mono text-[10px] uppercase ${trade.side === "BUY" ? "border-chart-2/40 text-chart-2" : "border-chart-3/40 text-chart-3"}`}>
                        {trade.side}
                      </Badge>
                      <div>
                        <p className="font-semibold text-sm">{trade.symbol}</p>
                        <p className="text-xs text-muted-foreground">{trade.strategy}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-mono text-sm font-medium ${isPositive ? "text-chart-2" : "text-chart-3"}`}>
                        {isPositive ? "+" : ""}{formatCurrencyCompact(trade.profit_loss, currency)}
                      </p>
                      <div className="flex items-center justify-end space-x-2">
                        <span className={`text-[10px] font-mono ${isPositive ? "text-chart-2" : "text-chart-3"}`}>
                          {isPositive ? "+" : ""}{trade.roi_percent.toFixed(2)}%
                        </span>
                        <span className="text-[10px] text-muted-foreground">{getRelativeTime(trade.closed_at)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
