"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { ArrowLeft, Clock } from "lucide-react";

export default function ComingSoonPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${isDark ? 'bg-black text-white' : 'bg-[#fafafa] text-black'}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`max-w-md w-full p-8 md:p-12 rounded-3xl border text-center ${
          isDark 
            ? 'bg-[#0a0a0a] border-white/10 shadow-2xl shadow-white/5' 
            : 'bg-white border-black/10 shadow-xl shadow-black/5'
        }`}
      >
        <div className={`w-16 h-16 mx-auto mb-8 rounded-full flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
          <Clock size={32} className={isDark ? 'text-zinc-400' : 'text-zinc-600'} />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          Coming Soon
        </h1>
        <p className={`text-lg mb-10 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          We're working hard to bring this feature to life. Check back later for updates.
        </p>

        <Link 
          href="/"
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all hover:-translate-x-1 ${
            isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/5 hover:bg-black/10 text-black'
          }`}
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
