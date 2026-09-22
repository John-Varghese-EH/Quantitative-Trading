/**
 * QuantAdv - Quantitative Trading Platform
 * Copyright (C) 2026 John Varghese (J0X)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  MetricsRow,
  PortfolioChart,
  ActivePositionsWidget,
  RecentTradesWidget,
  ActiveBotsWidget,
  MarketScannerWidget,
  ComplianceWidget,
  QuickActionsBar,
  QuickStartWizard,
} from "@/components/dashboard";

// ─── Animation variants ─────────────────────────────────────────────────────
const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  return (
    <div className="space-y-5 pb-8">
      {/* ── Section: Quick Start Wizard ───────────────────────────── */}
      <QuickStartWizard />

      {/* ── Section: Header ──────────────────────────────────────────── */}
      <motion.div {...fadeIn} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Command center for your quantitative operations
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Section: Quick Actions ────────────────────────────────────── */}
      <motion.div {...fadeIn} transition={{ delay: 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
        <QuickActionsBar />
      </motion.div>

      {/* ── Section: KPI Metrics ──────────────────────────────────────── */}
      <motion.div {...fadeIn} transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
        <MetricsRow />
      </motion.div>

      {/* ── Section: Portfolio Chart + Positions ──────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-5">
        <motion.div
          className="lg:col-span-3"
          {...fadeIn}
          transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <PortfolioChart />
        </motion.div>
        <motion.div
          className="lg:col-span-2"
          {...fadeIn}
          transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <ActivePositionsWidget />
        </motion.div>
      </div>

      {/* ── Section: Bots + Scanner + Compliance ──────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-3">
        <motion.div {...fadeIn} transition={{ delay: 0.25, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
          <ActiveBotsWidget />
        </motion.div>
        <motion.div {...fadeIn} transition={{ delay: 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
          <MarketScannerWidget />
        </motion.div>
        <motion.div {...fadeIn} transition={{ delay: 0.35, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
          <ComplianceWidget />
        </motion.div>
      </div>

      {/* ── Section: Recent Trades ────────────────────────────────────── */}
      <motion.div {...fadeIn} transition={{ delay: 0.4, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
        <RecentTradesWidget />
      </motion.div>
    </div>
  );
}
