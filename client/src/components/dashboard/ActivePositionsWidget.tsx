/**
 * QuantAdv - Quantitative Trading Platform
 * Copyright (C) 2026 John Varghese (J0X)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
"use client";

import { usePositions } from "@/hooks/useDashboardData";
import { useAppStore } from "@/store/useAppStore";
import { formatCurrency, formatCurrencyCompact } from "@/utils/currency";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronRight, Zap } from "lucide-react";
import Link from "next/link";

export default function ActivePositionsWidget() {
  const { data: positions, isLoading } = usePositions();
  const { currency } = useAppStore();

  if (isLoading || !positions) {
    return (
      <div className="p-1.5 rounded-2xl bg-muted/40 ring-1 ring-border/60 h-full">
        <Card className="border-0 shadow-none bg-card rounded-xl h-full flex flex-col">
          <CardHeader>
            <CardTitle>Active Positions</CardTitle>
            <CardDescription>Current algorithmic holdings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/3 bg-muted rounded" />
                  <div className="h-3 w-1/4 bg-muted rounded" />
                </div>
                <div className="h-4 w-1/4 bg-muted rounded" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayPositions = positions.slice(0, 5);
  const hasMore = positions.length > 5;

  return (
    <div className="p-1.5 rounded-2xl bg-muted/40 ring-1 ring-border/60 h-full flex flex-col">
      <Card className="border-0 shadow-none bg-card rounded-xl flex-1 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle>Active Positions</CardTitle>
            <CardDescription>Current algorithmic holdings</CardDescription>
          </div>
          <Button variant="ghost" size="icon" render={<Link href="/trading" />}><ChevronRight className="h-5 w-5" /></Button>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {displayPositions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <p className="text-muted-foreground mb-4">No active positions. Deploy a strategy or place a trade to get started.</p>
              <Button render={<Link href="/trading" />}><Zap className="mr-2 h-4 w-4" /> Start Trading</Button>
            </div>
          ) : (
            <div className="space-y-4 flex-1">
              {displayPositions.map((pos) => {
                const currentVal = pos.quantity * pos.current_price;
                const isPositive = pos.unrealized_pnl >= 0;
                return (
                  <div key={pos.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarFallback className="bg-muted text-xs font-medium text-muted-foreground">
                          {pos.symbol.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{pos.symbol}</p>
                        <p className="text-xs text-muted-foreground">
                          {pos.quantity} @ {formatCurrencyCompact(pos.entry_price, currency)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-medium">{formatCurrency(currentVal, currency)}</p>
                      <p className={`text-xs font-mono font-medium ${isPositive ? "text-chart-2" : "text-chart-3"}`}>
                        {isPositive ? "+" : ""}{formatCurrencyCompact(pos.unrealized_pnl, currency)}
                      </p>
                    </div>
                  </div>
                );
              })}
              {hasMore && (
                <Button variant="link" className="w-full text-muted-foreground mt-2" render={<Link href="/trading" />}>
                  View all {positions.length} positions
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
