/**
 * QuantAdv - Quantitative Trading Platform
 * Copyright (C) 2026 John Varghese (J0X)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, BookOpen, Compass, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";

export function QuickStartWizard() {
  const [isVisible, setIsVisible] = useState(false);
  const { tradingMode } = useAppStore();

  useEffect(() => {
    // Only show if the user hasn't dismissed it before
    const hasDismissed = localStorage.getItem("quantadv_wizard_dismissed");
    if (!hasDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("quantadv_wizard_dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0, scale: 0.95 }}
          animate={{ opacity: 1, height: "auto", scale: 1 }}
          exit={{ opacity: 0, height: 0, scale: 0.95 }}
          className="mb-6 overflow-hidden"
        >
          <div className="relative p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-black border border-blue-500/30">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="flex-1 space-y-2">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="text-amber-400" size={20} />
                  Welcome to QuantAdv
                </h2>
                <p className="text-sm text-slate-300">
                  Ready to deploy algorithmic strategies? You are currently in{" "}
                  <strong className="text-white">
                    {tradingMode === "novice" ? "Novice Mode" : "Quant Pro Mode"}
                  </strong>
                  . Let's get you started.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Link
                  href="/trading"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <Compass size={16} />
                  Explore Trading Engine
                </Link>
                <Link
                  href="/settings"
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <ShieldCheck size={16} />
                  Configure Compliance
                </Link>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                  <Compass size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Dual-Mode UI</h4>
                  <p className="text-xs text-slate-400">
                    Switch between Novice (AI-assisted) and Pro (Execution terminal) in the Trading page.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 shrink-0">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Contextual Tooltips</h4>
                  <p className="text-xs text-slate-400">
                    Hover over underlined metrics like "Max Pain" or "Delta" to learn what they mean.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Safety First</h4>
                  <p className="text-xs text-slate-400">
                    Your Paper Portfolio is protected by a multi-region Compliance Firewall.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
