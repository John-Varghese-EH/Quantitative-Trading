/**
 * QuantAdv - Quantitative Trading Platform
 * Copyright (C) 2026 John Varghese (J0X)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import React from "react";
import { Plus, Bot as BotIcon, Activity, Pause, Square } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBots } from "@/hooks/useDashboardData";
import { formatCurrency } from "@/utils/currency";
import { useAppStore } from "@/store/useAppStore";
import Link from "next/link";

function DoubleBezel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-1.5 rounded-2xl bg-muted/40 ring-1 ring-border/60 ${className}`}>{children}</div>;
}

export default function ActiveBotsWidget() {
  const { data: bots, isLoading } = useBots();
  const { currency } = useAppStore();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "RUNNING": return <Activity className="w-3 h-3 text-chart-2 mr-1" />;
      case "PAUSED": return <Pause className="w-3 h-3 text-amber-500 mr-1" />;
      case "STOPPED": return <Square className="w-3 h-3 text-muted-foreground mr-1" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RUNNING": return "bg-chart-2/10 text-chart-2 hover:bg-chart-2/20 border-chart-2/20";
      case "PAUSED": return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20";
      case "STOPPED": return "bg-muted text-muted-foreground hover:bg-muted/80 border-border";
      default: return "";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "RUNNING": return "Live";
      case "PAUSED": return "Paused";
      case "STOPPED": return "Stopped";
      default: return status;
    }
  };

  return (
    <DoubleBezel>
      <Card className="border-0 shadow-none bg-card rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BotIcon className="w-5 h-5 text-primary" />
              Autonomous Bots
            </CardTitle>
            <CardDescription>AI-powered trading agents</CardDescription>
          </div>
          <Button variant="ghost" size="icon" render={<Link href="/trading" />}>
            <Plus className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : bots && bots.length > 0 ? (
            <div className="space-y-3">
              {bots.slice(0, 4).map((bot) => (
                <div key={bot.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/10 hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{bot.name}</span>
                      <Badge variant="outline" className="text-xs py-0 h-5 font-mono bg-background">
                        {bot.symbol}
                      </Badge>
                      <Badge variant="outline" className={`text-[10px] py-0 h-5 px-1.5 ${bot.mode === 'LIVE' ? 'border-chart-2/50 text-chart-2' : 'border-blue-500/50 text-blue-500'}`}>
                        {bot.mode}
                      </Badge>
                    </div>
                    <Badge variant="outline" className={`text-xs py-0 h-5 w-fit border-0 pl-0 ${getStatusColor(bot.status)} bg-transparent`}>
                      {getStatusIcon(bot.status)}
                      {getStatusText(bot.status)}
                    </Badge>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className={`text-sm font-mono font-medium ${bot.pnl >= 0 ? 'text-chart-2' : 'text-chart-3'}`}>
                      {bot.pnl >= 0 ? '+' : ''}{formatCurrency(bot.pnl, currency)}
                    </span>
                    <span className={`text-xs font-mono ${bot.pnl_pct >= 0 ? 'text-chart-2/80' : 'text-chart-3/80'}`}>
                      {bot.pnl_pct >= 0 ? '+' : ''}{(bot.pnl_pct * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <BotIcon className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground mb-4">No bots deployed yet. Create an autonomous bot to automate your strategies.</p>
              <Button size="sm" render={<Link href="/trading" />}>
                <Plus className="w-4 h-4 mr-2" />
                Deploy Bot
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </DoubleBezel>
  );
}
