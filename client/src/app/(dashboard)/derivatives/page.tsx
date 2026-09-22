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
import { motion } from "framer-motion";
import { Layers, Activity, Search, AlertCircle } from "lucide-react";
import { OptionsDerivativesChain } from "@/components/OptionsDerivativesChain";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function DoubleBezel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-1.5 rounded-2xl bg-muted/40 ring-1 ring-border/60 ${className}`}>{children}</div>;
}

export default function DerivativesPage() {
  const [symbol, setSymbol] = useState("SPY");
  const [searchInput, setSearchInput] = useState("SPY");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSymbol(searchInput.trim().toUpperCase());
    }
  };

  return (
    <div className="space-y-6 pb-8 h-full flex flex-col">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Layers className="w-6 h-6 text-primary" />
          Options & Derivatives
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Advanced options chain analytics, Greeks, and Max Pain calculations.
        </p>
      </motion.div>

      {/* Search Bar */}
      <DoubleBezel>
        <div className="bg-background rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <form onSubmit={handleSearch} className="relative w-full max-w-sm flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
            <Input 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search ticker (e.g., AAPL)"
              className="pl-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50 uppercase"
            />
            <Button type="submit" size="sm" className="absolute right-1 h-7">Load</Button>
          </form>
          
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Current Asset:</span>
              <span className="font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">{symbol}</span>
            </div>
          </div>
        </div>
      </DoubleBezel>

      {/* Options Chain Viewer */}
      <DoubleBezel className="flex-1">
        <div className="bg-background rounded-xl h-full min-h-[600px] flex flex-col overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 p-3 bg-amber-500/10 border-b border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium flex items-center justify-center gap-2 z-10">
            <AlertCircle className="w-4 h-4" />
            High Options Volatility Warning: PCR is currently elevated across indices.
          </div>
          <div className="flex-1 overflow-auto mt-10">
            <OptionsDerivativesChain initialSymbol={symbol} />
          </div>
        </div>
      </DoubleBezel>
    </div>
  );
}
