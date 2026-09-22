"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, Variants } from 'framer-motion';
import { 
  DollarSign, TrendingUp, TrendingDown, Brain, Activity, 
  Zap, Briefcase, Newspaper, 
  ChevronRight, Server, Shield, 
  CreditCard
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/services/api';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency, formatCurrencyCompact } from '@/utils/currency';
import Link from 'next/link';

// UI components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const ANIM_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({ 
    opacity: 1, y: 0, 
    transition: { delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] } 
  }),
};

// Double Bezel Wrapper for Premium Look
function DoubleBezel({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`p-1.5 rounded-2xl bg-muted/40 ring-1 ring-border/60 ${className}`}>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const { currency } = useAppStore();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then(r => r.data),
    refetchInterval: 60_000,
  });

  const { data: portfolio } = useQuery({
    queryKey: ['portfolio-history'],
    queryFn: () => api.get('/dashboard/portfolio-history?days=30').then(r => r.data),
  });

  const { data: holdings } = useQuery({
    queryKey: ['portfolio-holdings'],
    queryFn: () => api.get('/portfolio/positions').then(r => r.data.positions.map((p: any) => ({
      symbol: p.symbol,
      shares: p.quantity,
      avg_price: p.entry_price,
      current_price: p.current_price,
      pnl: p.unrealized_pnl,
      pnl_pct: p.unrealized_pnl_pct
    }))).catch(() => []),
  });

  const { data: news } = useQuery({
    queryKey: ['news-feed'],
    queryFn: () => api.get('/news/feed').then(r => r.data.articles),
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    );
  }

  const portfolioValue = stats?.portfolio_value || 0;
  const dailyPnl = stats?.daily_pnl || 0;
  const dailyPnlPct = stats?.daily_pnl_pct || 0;
  const isPositive = dailyPnl >= 0;

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10">
      
      {/* Top Header / Actions */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Overview
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-chart-2" />
            Algorithmic Sandbox Active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden md:flex bg-muted/30">
            <Newspaper className="mr-2 h-4 w-4" /> Market Report
          </Button>
          <Button size="sm" render={<Link href="/trading" />} className="bg-foreground text-background hover:bg-foreground/90 font-bold">
            <Zap className="mr-2 h-4 w-4" /> Trade Terminal
          </Button>
        </div>
      </motion.div>

      {/* 4-Card Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { 
            title: "Total Portfolio Value", 
            value: formatCurrency(portfolioValue, currency), 
            change: `${isPositive ? '+' : ''}${dailyPnlPct}% from yesterday`,
            icon: <DollarSign className="h-4 w-4 text-muted-foreground" />
          },
          { 
            title: "Daily Profit/Loss", 
            value: `${isPositive ? '+' : ''}${formatCurrency(Math.abs(dailyPnl), currency)}`, 
            change: isPositive ? "Bullish trend active" : "Bearish pressure",
            icon: isPositive ? <TrendingUp className="h-4 w-4 text-chart-2" /> : <TrendingDown className="h-4 w-4 text-chart-3" />
          },
          { 
            title: "Model Confidence", 
            value: `${stats?.ai_confidence ?? 0}%`, 
            change: "Across 14 active predictions",
            icon: <Brain className="h-4 w-4 text-chart-4" />
          },
          { 
            title: "Active Positions", 
            value: stats?.open_positions ?? 0, 
            change: `${stats?.total_trades ?? 0} total trades executed`,
            icon: <Briefcase className="h-4 w-4 text-muted-foreground" />
          }
        ].map((metric, i) => (
          <motion.div key={metric.title} custom={i} variants={ANIM_VARIANTS} initial="hidden" animate="visible">
            <DoubleBezel>
              <Card className="border-0 shadow-none bg-card rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </CardTitle>
                  {metric.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono tracking-tight">{metric.value}</div>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">
                    {metric.change}
                  </p>
                </CardContent>
              </Card>
            </DoubleBezel>
          </motion.div>
        ))}
      </div>

      {/* Main Charts & Data Row */}
      <div className="grid gap-4 md:gap-8 lg:grid-cols-7">
        
        {/* Main Chart (Col Span 4) */}
        <motion.div custom={4} variants={ANIM_VARIANTS} initial="hidden" animate="visible" className="lg:col-span-4">
          <DoubleBezel className="h-full">
            <Card className="border-0 shadow-none bg-card rounded-xl h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Portfolio Growth</CardTitle>
                <CardDescription>30-day historical performance</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 min-h-[300px] pl-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={portfolio?.history || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--foreground)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="var(--foreground)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis 
                      dataKey="date" 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500 }}
                      tickFormatter={(v) => v.slice(5)} 
                      dy={10} 
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500 }}
                      tickFormatter={(v) => formatCurrencyCompact(v, currency)} 
                    />
                    <Tooltip 
                      contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}
                      itemStyle={{ color: 'var(--foreground)', fontWeight: 700 }}
                      formatter={(v: any) => [formatCurrency(v, currency), 'Value']} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="var(--foreground)" 
                      strokeWidth={2} 
                      fill="url(#chartGrad)" 
                      activeDot={{ r: 5, fill: 'var(--foreground)', strokeWidth: 0 }} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </DoubleBezel>
        </motion.div>

        {/* Recent Positions (Col Span 3) */}
        <motion.div custom={5} variants={ANIM_VARIANTS} initial="hidden" animate="visible" className="lg:col-span-3">
          <DoubleBezel className="h-full">
            <Card className="border-0 shadow-none bg-card rounded-xl h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold">Active Positions</CardTitle>
                    <CardDescription>Current algorithmic holdings</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" render={<Link href="/trading" />}>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                {(!holdings || holdings.length === 0) ? (
                  <div className="flex h-[200px] items-center justify-center text-sm font-medium text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
                    No active positions.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {holdings.slice(0, 5).map((h: any) => (
                      <div key={h.symbol} className="flex items-center">
                        <Avatar className="h-9 w-9 rounded-md border border-border">
                          <AvatarFallback className="bg-muted font-mono text-xs font-bold rounded-md text-foreground">
                            {h.symbol.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-bold leading-none">{h.symbol}</p>
                          <p className="text-xs font-medium text-muted-foreground">
                            {h.shares} shares @ {formatCurrency(h.avg_price, currency)}
                          </p>
                        </div>
                        <div className="ml-auto text-right space-y-1">
                          <p className="text-sm font-bold font-mono text-foreground">
                            {formatCurrency(h.shares * h.current_price, currency)}
                          </p>
                          <p className={`text-xs font-bold ${h.pnl >= 0 ? 'text-chart-2' : 'text-chart-3'}`}>
                            {h.pnl >= 0 ? '+' : ''}{(h.pnl_pct || 0).toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </DoubleBezel>
        </motion.div>
      </div>

      {/* Bottom Grid for News & System Status */}
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
        <motion.div custom={6} variants={ANIM_VARIANTS} initial="hidden" animate="visible">
          <DoubleBezel>
            <Card className="border-0 shadow-none bg-card rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Market Intelligence</CardTitle>
                <CardDescription>Latest signals and news analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(news || []).slice(0, 3).map((article: any, i: number) => {
                    const isBullish = article.impact === 'bullish';
                    return (
                      <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/40 transition-colors border border-transparent hover:border-border">
                        <div className={`mt-0.5 w-8 h-8 rounded-md flex items-center justify-center shrink-0 border ${isBullish ? 'bg-chart-2/10 border-chart-2/20 text-chart-2' : 'bg-chart-3/10 border-chart-3/20 text-chart-3'}`}>
                          {isBullish ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[0.65rem] px-1.5 py-0 rounded-sm font-bold border-border text-muted-foreground">
                              {article.source}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium leading-snug text-foreground">{article.title}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </DoubleBezel>
        </motion.div>

        <motion.div custom={7} variants={ANIM_VARIANTS} initial="hidden" animate="visible">
          <DoubleBezel className="h-full">
            <Card className="border-0 shadow-none bg-card rounded-xl h-full flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-lg font-bold">System Status</CardTitle>
                <CardDescription>Infrastructure and API health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Trading Engine', status: 'Online', icon: <Server size={14} /> },
                    { label: 'Market Data Feed', status: 'Online', icon: <Activity size={14} /> },
                    { label: 'Risk Management', status: 'Active', icon: <Shield size={14} /> },
                    { label: 'Execution Gateway', status: 'Online', icon: <CreditCard size={14} /> },
                  ].map((sys) => (
                    <div key={sys.label} className="p-3 border border-border rounded-lg bg-background flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-muted-foreground font-medium text-xs">
                        {sys.icon} {sys.label}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                        <span className="w-2 h-2 rounded-full bg-chart-2" />
                        {sys.status}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </DoubleBezel>
        </motion.div>
      </div>
    </div>
  );
}
