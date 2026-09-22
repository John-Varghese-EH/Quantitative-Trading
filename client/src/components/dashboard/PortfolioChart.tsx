/**
 * QuantAdv - Quantitative Trading Platform
 * Copyright (C) 2026 John Varghese (J0X)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
"use client";

import { usePortfolioHistory } from "@/hooks/useDashboardData";
import { useAppStore } from "@/store/useAppStore";
import { formatCurrencyCompact } from "@/utils/currency";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function PortfolioChart() {
  const { data, isLoading } = usePortfolioHistory(30);
  const { currency } = useAppStore();

  if (isLoading || !data) {
    return (
      <div className="p-1.5 rounded-2xl bg-muted/40 ring-1 ring-border/60 h-[400px] animate-pulse">
        <Card className="border-0 shadow-none bg-card rounded-xl h-full" />
      </div>
    );
  }

  const { history, initial, current } = data;
  const isPositive = current >= initial;
  const returnPct = initial > 0 ? ((current - initial) / initial) * 100 : 0;

  if (history.length === 0) {
    return (
      <div className="p-1.5 rounded-2xl bg-muted/40 ring-1 ring-border/60 h-[400px]">
        <Card className="border-0 shadow-none bg-card rounded-xl h-full flex flex-col items-center justify-center text-center p-6">
          <p className="text-muted-foreground mb-4">No portfolio history yet. Execute your first trade to start tracking.</p>
          <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Place Trade</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-1.5 rounded-2xl bg-muted/40 ring-1 ring-border/60 min-h-[400px] h-full">
      <Card className="border-0 shadow-none bg-card rounded-xl h-full flex flex-col">
        <CardHeader className="flex flex-row items-start justify-between pb-2 shrink-0">
          <div>
            <CardTitle>Portfolio Growth</CardTitle>
            <CardDescription>30-day historical performance</CardDescription>
          </div>
          <Badge variant="outline" className={isPositive ? "bg-chart-2/20 text-chart-2 border-chart-2/30" : "bg-chart-3/20 text-chart-3 border-chart-3/30"}>
            {isPositive ? "+" : ""}{returnPct.toFixed(2)}%
          </Badge>
        </CardHeader>
        <CardContent className="flex-1 min-h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="currentColor" className="text-foreground" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="currentColor" className="text-foreground" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(val) => {
                  const date = new Date(val);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                tickFormatter={(val) => formatCurrencyCompact(val, currency)}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-card text-card-foreground shadow-sm rounded-lg p-3 ring-1 ring-border">
                        {label && <p className="text-sm font-medium mb-1 text-muted-foreground">{new Date(label as string | number).toLocaleDateString()}</p>}
                        <p className="text-lg font-bold font-mono">{formatCurrencyCompact(payload[0].value as number, currency)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--foreground))" 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
