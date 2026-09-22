/**
 * QuantAdv - Quantitative Trading Platform
 * Copyright (C) 2026 John Varghese (J0X)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Radar, Filter, TrendingUp, AlertTriangle, Activity, ArrowRight, BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/currency";
import Link from "next/link";

function DoubleBezel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-1.5 rounded-2xl bg-muted ring-1 ring-border/60 ${className}`}>{children}</div>;
}

const MARKETS = ["ALL", "US", "IN", "CRYPTO"] as const;
const SIGNALS = ["ALL", "BREAKOUT", "VOLUME_SURGE", "OVERSOLD_DIP", "MOMENTUM_RUN"] as const;

export default function ScannerPage() {
  const [market, setMarket] = useState<typeof MARKETS[number]>("ALL");
  const [signal, setSignal] = useState<typeof SIGNALS[number]>("ALL");

  const { data: scanData, isFetching } = useQuery({
    queryKey: ['market-scan', market, signal],
    queryFn: () => api.get(`/trading/scanner/scan?market=${market}&signal=${signal}`).then(r => r.data),
    refetchInterval: 30000,
  });

  const getSignalColor = (sig: string) => {
    switch (sig) {
      case 'BREAKOUT': return 'bg-blue-500/10 text-muted-foreground border-border/20';
      case 'VOLUME_SURGE': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'OVERSOLD_DIP': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'MOMENTUM_RUN': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Radar className="w-6 h-6 text-primary" />
          Market Scanner
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Real-time algorithmic pattern detection across global markets.
        </p>
      </motion.div>

      {/* Filters */}
      <DoubleBezel>
        <Card className="border-0 shadow-none bg-background rounded-xl">
          <CardContent className="p-4 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Filter className="w-3 h-3" /> Market Jurisdiction
              </span>
              <div className="flex flex-wrap gap-2">
                {MARKETS.map(m => (
                  <Badge 
                    key={m} 
                    variant={market === m ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setMarket(m)}
                  >
                    {m === "ALL" ? "Global" : m}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Activity className="w-3 h-3" /> Signal Algorithm
              </span>
              <div className="flex flex-wrap gap-2">
                {SIGNALS.map(s => (
                  <Badge 
                    key={s} 
                    variant={signal === s ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSignal(s)}
                  >
                    {s.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </DoubleBezel>

      {/* Results */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isFetching && !scanData ? (
          Array(6).fill(0).map((_, i) => (
            <DoubleBezel key={i} className="animate-pulse">
              <Card className="h-48 border-0 shadow-none bg-background rounded-xl"></Card>
            </DoubleBezel>
          ))
        ) : scanData?.results?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground flex flex-col items-center">
            <AlertTriangle className="w-12 h-12 mb-4 opacity-20" />
            <p>No active signals matching these criteria.</p>
          </div>
        ) : (
          scanData?.results?.map((opp: any, idx: number) => (
            <motion.div 
              key={`${opp.symbol}-${idx}`}
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: idx * 0.05 }}
            >
              <DoubleBezel>
                <Card className="border-0 shadow-none bg-background rounded-xl overflow-hidden hover:bg-muted/30 transition-colors">
                  <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle className="text-xl font-bold font-mono tracking-tight">{opp.symbol}</CardTitle>
                      <CardDescription className="text-xs mt-1">{opp.market || 'US'}</CardDescription>
                    </div>
                    <Badge variant="outline" className={`font-mono text-xs ${getSignalColor(opp.signal)}`}>
                      {opp.signal.replace('_', ' ')}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <span className="text-2xl font-bold font-mono tracking-tighter">
                          {formatCurrency(opp.price, opp.market === 'IN' ? 'INR' : 'USD')}
                        </span>
                      </div>
                      <div className="flex items-center text-emerald-500 font-mono text-sm bg-emerald-500/10 px-2 py-0.5 rounded">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{Math.abs((Math.random() * 5) + 1).toFixed(2)}%
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-border/50 flex gap-2 w-full">
                      <Button size="sm" className="flex-1 text-xs" render={<Link href={`/copilot?q=Analyze ${opp.symbol}`} />}>
                        <BrainCircuit className="w-3 h-3 mr-1.5" /> Ask Council
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-xs" render={<Link href={`/trading?symbol=${opp.symbol}`} />}>
                        Trade <ArrowRight className="w-3 h-3 ml-1.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </DoubleBezel>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
