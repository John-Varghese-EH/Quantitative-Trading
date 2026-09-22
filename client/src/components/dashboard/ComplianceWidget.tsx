/**
 * QuantAdv - Quantitative Trading Platform
 * Copyright (C) 2026 John Varghese (J0X)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import React from "react";
import { ShieldAlert, ShieldCheck, ShieldBan, Shield, Globe, MapPin, Network, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useComplianceStatus } from "@/hooks/useDashboardData";

function DoubleBezel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-1.5 rounded-2xl bg-muted/40 ring-1 ring-border/60 ${className}`}>{children}</div>;
}

export default function ComplianceWidget() {
  const { data: status, isLoading } = useComplianceStatus();

  return (
    <DoubleBezel>
      <Card className="border-0 shadow-none bg-card rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Compliance Firewall
            </div>
            {status && (
              <HoverCard>
                <HoverCardTrigger className="cursor-help">
                  <span className="text-xs font-mono font-bold bg-primary/10 px-2 py-1 rounded-md text-primary flex items-center gap-1 border border-primary/20 hover:bg-primary/20 transition-colors">
                    <Globe className="w-3 h-3" /> {status.jurisdiction}
                  </span>
                </HoverCardTrigger>
                <HoverCardContent className="w-72 text-xs font-sans text-left normal-case text-foreground">
                  <strong className="block mb-1">Jurisdiction: {status.jurisdiction}</strong>
                  <div className="space-y-1 mt-2 text-muted-foreground">
                    {status.jurisdiction === 'US' && (
                      <>
                        <p>• SEC Rule 15c3-5 (Market Access)</p>
                        <p>• FINRA PDT Rule (Pattern Day Trader)</p>
                      </>
                    )}
                    {status.jurisdiction === 'IN' && (
                      <>
                        <p>• SEBI Circuit Limits (Max 10-20% daily)</p>
                        <p>• IST Market Hours enforcement</p>
                      </>
                    )}
                    {status.jurisdiction === 'EU' && (
                      <>
                        <p>• MiFID II RTS 6 (Order Throttling)</p>
                        <p>• ESMA Leverage Limits</p>
                      </>
                    )}
                    {status.jurisdiction === 'GLOBAL' && (
                      <>
                        <p>• Baseline Risk Limits</p>
                        <p>• Max Daily Drawdown: 5%</p>
                      </>
                    )}
                  </div>
                </HoverCardContent>
              </HoverCard>
            )}
          </CardTitle>
          <CardDescription>Pre-trade risk & regulatory management</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-16 bg-muted/50 rounded-xl animate-pulse" />
              <div className="h-24 bg-muted/50 rounded-lg animate-pulse" />
            </div>
          ) : status ? (
            <div className="space-y-4">
              {/* Regional Status & Static IP Indicator */}
              <div className={`p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between border ${
                status.static_ip_bound 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-destructive/10 border-destructive/20 text-destructive'
              }`}>
                <div className="flex items-center gap-3">
                  {status.static_ip_bound ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                  <div>
                    <div className="font-bold text-sm">Static IP Status</div>
                    <div className="text-xs opacity-80 mt-0.5 flex items-center gap-1">
                      <Network className="w-3 h-3" /> {status.static_ip_bound ? status.static_ip_address : 'UNBOUND'}
                    </div>
                  </div>
                </div>
                <div className="mt-3 sm:mt-0 text-right">
                  <div className="text-xs font-mono opacity-80 uppercase tracking-widest mb-1">Active Rules</div>
                  <div className="font-bold text-xl leading-none">{status.firewall_rules_active}</div>
                </div>
              </div>

              {/* Real-time Event Log */}
              <div className="bg-muted/30 p-3 rounded-lg border border-border/40">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Recent Interventions
                </div>
                <div className="space-y-2">
                  {status.recent_interventions?.length > 0 ? (
                    status.recent_interventions.map((log: any) => (
                      <div key={log.id} className="flex flex-col gap-1 text-xs border-l-2 pl-2 py-0.5 border-primary/50">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold">{log.rule}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            log.action === 'REJECT' ? 'bg-destructive/20 text-destructive' : 'bg-amber-500/20 text-amber-500'
                          }`}>
                            {log.action}
                          </span>
                        </div>
                        <span className="text-muted-foreground line-clamp-1">{log.details}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-muted-foreground text-center py-2">No recent interventions.</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <ShieldAlert className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Compliance engine offline.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </DoubleBezel>
  );
}
