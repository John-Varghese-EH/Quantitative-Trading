/**
 * QuantAdv - Quantitative Trading Platform
 * Copyright (C) 2026 John Varghese (J0X)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import React from "react";
import Link from "next/link";
import { Brain, BarChart3, Radar, Bot, Layers, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  { label: "AI Council", icon: Brain, href: "/ai-prediction" },
  { label: "Run Backtest", icon: BarChart3, href: "/trading" },
  { label: "Market Scanner", icon: Radar, href: "/market" },
  { label: "Deploy Bot", icon: Bot, href: "/trading" },
  { label: "Options Chain", icon: Layers, href: "/trading" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export default function QuickActionsBar() {
  return (
    <div className="bg-muted/20 rounded-xl p-3 border border-border/50">
      <div className="flex overflow-x-auto pb-1 lg:pb-0 lg:grid lg:grid-cols-6 gap-2 snap-x scrollbar-hide">
        {actions.map((action, i) => (
          <Button
            key={i}
            variant="outline"
            className="flex-col h-auto py-3 px-4 min-w-[100px] snap-center gap-2 hover:bg-muted/50 hover:border-border transition-all group"
            render={<Link href={action.href} />}
          >
            <action.icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-xs font-medium text-foreground/80 group-hover:text-foreground transition-colors">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
