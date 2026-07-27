"use client";
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


import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Activity, Menu, X, Sun, Moon, Shield, BarChart3, Globe, Zap, Database, LineChart, Star } from "lucide-react";
import Head from "next/head";
import Link from "next/link";
import { useTheme } from "next-themes";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [stars, setStars] = useState<number | null>(null);
  const { theme, setTheme } = useTheme();
  const { scrollY } = useScroll();

  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const y = useTransform(scrollY, [0, 400], [0, 150]);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    
    // Fetch GitHub stars
    fetch('https://api.github.com/repos/John-Varghese-EH/Quantitative-Trading')
      .then(res => res.json())
      .then(data => {
        if (data.stargazers_count !== undefined) {
          setStars(data.stargazers_count);
        }
      })
      .catch(err => console.error("Error fetching stars:", err));

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isDark = theme === "dark";

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
    })
  };

  const navLinks = ["Platform", "Solutions", "Infrastructure", "Company"];

  const Logo = () => (
    <div className="flex items-center gap-2.5">
      <div className={`w-7 h-7 rounded-[6px] flex items-center justify-center ${isDark ? 'bg-white' : 'bg-[#192837]'}`}>
        <Activity className={`w-4 h-4 ${isDark ? 'text-black' : 'text-white'}`} strokeWidth={3} />
      </div>
      <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', letterSpacing: '-0.03em', color: isDark ? 'white' : '#192837' }}>
        QuantAdv
      </span>
    </div>
  );

  if (!mounted) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --font-heading: 'Helvetica Now Display Bold', sans-serif;
          --font-body: 'Inter', sans-serif;
          --color-text-light: #111827;
          --color-text-dark: #f8fafc;
          --color-accent: #111827; /* Darker accent for light mode */
          --color-login-bg: #F2F2EE;
        }
      `}} />
      {/* \x4a\x6f\x68\x6e\x20\x56\x61\x72\x67\x68\x65\x73\x65\x20\x28\x4a\x30\x58\x29 | \x4c\x69\x6e\x6b\x65\x64\x49\x6e\x3a\x20\x2f\x69\x6e\x2f\x4a\x6f\x68\x6e\x2d\x2d\x56\x61\x72\x67\x68\x65\x73\x65\x2f | \x47\x69\x74\x48\x75\x62\x3a\x20\x4a\x6f\x68\x6e\x2d\x56\x61\x72\x67\x68\x65\x73\x65\x2d\x45\x48 */}
      <div 
        className={`relative w-full min-h-screen transition-colors duration-500 overflow-hidden ${isDark ? 'bg-[#000000]' : 'bg-white'}`}
        style={{ fontFamily: 'var(--font-body)' }}
      >
        {/* Navbar */}
        <div className={`fixed w-full z-50 transition-all duration-400 ${isScrolled ? (isDark ? 'top-0 bg-black/40 backdrop-blur-xl border-b border-white/10' : 'top-0 bg-white/50 backdrop-blur-xl border-b border-black/5') : 'top-3 sm:top-5 bg-transparent'}`}>
          <div className="relative w-full max-w-[1280px] mx-auto px-6 sm:px-8 py-4 flex items-center justify-between transition-all duration-300">
            <Logo />
            
            <div className="hidden md:flex items-center space-x-10">
              {['Platform', 'Solutions', 'Data', 'Pricing', 'Docs'].map((link) => (
                <a key={link} href="#" className={`text-sm font-medium transition-colors ${
                  !isScrolled 
                    ? (isDark ? 'text-white/90 hover:text-white' : 'text-black/80 hover:text-black') 
                    : (isDark ? 'text-zinc-300 hover:text-white' : 'text-zinc-500 hover:text-black')
                }`}>
                  {link}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-zinc-300 hover:text-white' : 'hover:bg-black/5 text-zinc-500 hover:text-black'}`}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              
              <a 
                href="https://github.com/John-Varghese-EH/Quantitative-Trading/" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10' : 'bg-black/5 hover:bg-black/10 text-zinc-600 hover:text-black border border-black/10'}`}
              >
                <svg className="w-4 h-4 fill-current hidden sm:block" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                <span className="flex items-center gap-1 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-current text-yellow-500" />
                  <span>{stars !== null ? stars : "Star"}</span>
                </span>
                <span className={`w-[1px] h-3 ${isDark ? 'bg-white/20' : 'bg-black/20'}`}></span>
                <span className="font-bold uppercase tracking-widest opacity-80">Star us</span>
              </a>

              <div className="flex items-center space-x-6 pl-2">
              <Link href="/login" className={`text-sm font-medium transition-colors ${
                !isScrolled 
                  ? (isDark ? 'text-white/90 hover:text-white' : 'text-black/80 hover:text-black') 
                  : (isDark ? 'text-zinc-300 hover:text-white' : 'text-zinc-600 hover:text-black')
              }`}>
                Sign In
              </Link>
              <Link href="/register" style={{ background: isDark ? 'white' : 'black', color: isDark ? 'black' : 'white' }} className="px-5 py-2.5 rounded-full text-sm font-semibold transition hover:scale-105 active:scale-95 shadow-md">
                Get Started
              </Link>
              </div>
            </div>

            <div className="md:hidden flex items-center gap-2">
              <a 
                href="https://github.com/John-Varghese-EH/Quantitative-Trading/" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium transition-all ${isDark ? 'bg-white/5 text-zinc-300 border border-white/10' : 'bg-black/5 text-zinc-600 border border-black/10'}`}
              >
                <Star className="w-3 h-3 fill-current text-yellow-500" />
                <span className="font-semibold">{stars !== null ? stars : "Star"}</span>
              </a>
              <button onClick={() => setTheme(isDark ? "light" : "dark")} className={`p-1.5 rounded-full transition-colors ${isDark ? 'text-zinc-300 hover:text-white hover:bg-white/10' : 'text-zinc-600 hover:text-black hover:bg-black/5'}`}>
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={() => setIsMenuOpen(true)} className={`p-1.5 rounded-full transition-colors ${isDark ? 'text-zinc-300 hover:text-white hover:bg-white/10' : 'text-zinc-600 hover:text-black hover:bg-black/5'}`}>
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
        
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed inset-0 z-50 pt-24 px-6 pb-6 ${isDark ? 'bg-[#050505]' : 'bg-[#fafafa]'}`}
            >
              <div className="flex justify-between items-center absolute top-6 left-6 right-6">
                <Logo />
                <button onClick={() => setIsMenuOpen(false)} className={`p-2 rounded-full ${isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-black'}`}>
                  <X size={20} />
                </button>
              </div>
              <div className="flex flex-col gap-6 mt-8">
                {['Platform', 'Solutions', 'Data', 'Pricing', 'Docs'].map((link) => (
                  <a key={link} href="#" className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                    {link}
                  </a>
                ))}
                <div className="h-[1px] w-full my-4 bg-zinc-500/20" />
                <Link href="/login" className={`text-xl font-bold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Sign In</Link>
                <Link href="/register" className={`mt-2 py-4 text-center rounded-full text-lg font-bold ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HERO SECTION */}
        <div className="relative w-full h-[100vh] flex items-center pt-16">
          {/* Background Video */}
          {isDark ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-2 sm:inset-4 top-[80px] rounded-2xl overflow-hidden z-0"
            >
              <video
                autoPlay muted loop playsInline
                className="absolute inset-0 w-full h-full object-cover scale-[1.02]"
                src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260518_003132_8b7edcb6-c64d-4a52-a9ca-879942e122ad.mp4"
              />
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent opacity-80" />
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="absolute inset-0 z-0">
              <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260518_003132_8b7edcb6-c64d-4a52-a9ca-879942e122ad.mp4" />
            </motion.div>
          )}

          {/* Hero Content */}
          <motion.div style={{ opacity, y }} className="relative z-10 w-full max-w-[1280px] mx-auto px-6 sm:px-8">
            <div className="max-w-[800px]">


              <motion.h1
                custom={0} initial="hidden" animate="visible" variants={fadeUp}
                style={{ 
                  fontFamily: 'var(--font-heading)', fontSize: 'clamp(3rem, 7vw, 6.5rem)', lineHeight: 0.95, letterSpacing: '-0.04em', color: isDark ? 'white' : '#111827', marginBottom: '32px',
                  textShadow: isDark ? '0 2px 10px rgba(0,0,0,0.2)' : '0 2px 15px rgba(255,255,255,0.6)'
                }}
              >
                The intelligence <br />
                behind modern <br />
                trading.
              </motion.h1>

              <motion.p
                custom={1} initial="hidden" animate="visible" variants={fadeUp}
                style={{ 
                  fontFamily: 'var(--font-body)', fontSize: 'clamp(1.1rem, 2vw, 1.35rem)', lineHeight: 1.5, color: isDark ? '#d4d4d8' : '#52525b', maxWidth: '540px', marginBottom: '48px', fontWeight: 500,
                  textShadow: isDark ? '0 1px 5px rgba(0,0,0,0.2)' : '0 1px 10px rgba(255,255,255,0.6)'
                }}
              >
                QuantAdv equips institutional funds with high-frequency predictive models. Execute with absolute precision, zero emotion, and unparalleled speed.
              </motion.p>

              <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4">
                <Link href="/register"
                  style={{ background: isDark ? 'white' : 'black', color: isDark ? 'black' : 'white', borderRadius: '50px', padding: '18px 32px', fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '1rem', textDecoration: 'none' }}
                  className="w-full sm:w-auto hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Get Started
                  <ArrowRight size={18} />
                </Link>
                
                <Link href="/login"
                  style={{ background: 'transparent', color: isDark ? 'white' : 'black', border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`, borderRadius: '50px', padding: '18px 32px', fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '1rem', textDecoration: 'none' }}
                  className="w-full sm:w-auto flex justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200"
                >
                  Read the docs
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* LOGO STRIP */}
        <div className={`relative z-10 w-full py-16 border-y overflow-hidden ${isDark ? 'border-white/5 bg-[#050505]' : 'border-black/5 bg-[#fafafa]'}`}>
          <div className="max-w-[1280px] mx-auto">
            <p className={`text-sm font-medium mb-12 text-center uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Empowering the open-source quantitative community</p>
            
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes marquee {
                0% { transform: translateX(0%); }
                100% { transform: translateX(-50%); }
              }
              .animate-marquee {
                display: flex;
                width: max-content;
                animation: marquee 25s linear infinite;
              }
              .animate-marquee:hover {
                animation-play-state: paused;
              }
            `}} />
            
            <div className="relative w-full overflow-hidden">
              <div className={`absolute inset-y-0 left-0 w-24 sm:w-40 z-10 bg-gradient-to-r ${isDark ? 'from-[#050505] to-transparent' : 'from-[#fafafa] to-transparent'}`} />
              <div className={`absolute inset-y-0 right-0 w-24 sm:w-40 z-10 bg-gradient-to-l ${isDark ? 'from-[#050505] to-transparent' : 'from-[#fafafa] to-transparent'}`} />
              
              <div className="animate-marquee flex gap-16 sm:gap-32 opacity-40 hover:opacity-100 transition-opacity duration-500">
                {[...Array(2)].map((_, idx) => (
                  <div key={idx} className="flex gap-16 sm:gap-32 items-center">
                    {['AQR', 'RENAISSANCE', 'TWO SIGMA', 'JANE STREET', 'CITADEL', 'JPMORGAN', 'BLACKROCK'].map((logo, i) => (
                      <div key={i} style={{ fontFamily: 'var(--font-heading)' }} className={`text-xl sm:text-2xl font-bold tracking-tighter hover:scale-110 transition-transform duration-300 cursor-default ${isDark ? 'text-white' : 'text-black'}`}>
                        {logo}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* METRICS SECTION */}
        <div className={`relative z-10 w-full pt-32 pb-16 ${isDark ? 'bg-black' : 'bg-white'}`}>
          <div className="max-w-[1280px] mx-auto px-6 sm:px-8">
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x ${isDark ? 'divide-white/10' : 'divide-black/5'}`}>
              {[
                { label: 'Trading Volume', value: '$50B+' },
                { label: 'Latency', value: '0.5ms' },
                { label: 'Uptime', value: '99.999%' },
                { label: 'Active Strategies', value: '10,000+' }
              ].map((metric, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1, type: "spring" }}
                  className={`flex flex-col items-center justify-center text-center px-4`}
                >
                  <h4 style={{ fontFamily: 'var(--font-heading)' }} className={`text-4xl md:text-5xl font-bold mb-3 tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>{metric.value}</h4>
                  <p className={`text-xs sm:text-sm font-medium tracking-widest uppercase ${isDark ? 'text-zinc-400' : 'text-zinc-400'}`}>{metric.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* BENTO BOX FEATURES */}
        <div className={`relative z-10 w-full pb-32 overflow-hidden ${isDark ? 'bg-black' : 'bg-white'}`}>
          {/* Ambient Background Auras */}
          <div className={`absolute top-1/4 -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] pointer-events-none transition-opacity duration-1000 ${isDark ? 'bg-blue-600/10' : 'bg-blue-400/5'}`} />
          <div className={`absolute bottom-1/4 -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] pointer-events-none transition-opacity duration-1000 ${isDark ? 'bg-purple-600/10' : 'bg-purple-400/5'}`} />

          <div className="max-w-[1280px] mx-auto px-6 sm:px-8 relative z-10">
            <div className="mb-20 max-w-2xl">
              <h2 style={{ fontFamily: 'var(--font-heading)' }} className={`text-4xl md:text-5xl mb-6 tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
                A complete infrastructure for quantitative research.
              </h2>
              <p className={`text-lg leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                From data ingestion to live execution, we provide the primitives required to run sophisticated trading operations at scale.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Span 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7, type: "spring" }}
                className={`group md:col-span-2 rounded-3xl p-8 sm:p-12 border flex flex-col justify-between overflow-hidden relative transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${isDark ? 'bg-[#0a0a0a]/80 backdrop-blur-xl border-white/10 hover:border-t-white/30 hover:border-l-white/30 hover:bg-[#111]' : 'bg-[#f8f9fa]/80 backdrop-blur-xl border-black/5 hover:border-white hover:bg-white hover:shadow-black/5'}`}
              >
                <div className="relative z-10 max-w-md">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                    <Database className={`w-6 h-6 ${isDark ? 'text-white' : 'text-black'}`} />
                  </div>
                  <h3 className={`text-2xl font-semibold mb-4 tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>Unified Data Pipeline</h3>
                  <p className={`leading-relaxed transition-colors duration-300 ${isDark ? 'text-zinc-300 group-hover:text-white/90' : 'text-zinc-600 group-hover:text-zinc-800'}`}>
                    Access normalized, tick-level market data across equities, crypto, and forex. Our low-latency ingestion engine processes terabytes of historical and real-time feeds instantly.
                  </p>
                </div>
                {/* Decorative element */}
                <div className={`absolute right-0 bottom-0 w-3/4 h-3/4 pointer-events-none translate-x-1/4 translate-y-1/4 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-12 ${isDark ? 'text-white/10' : 'text-black/5'}`}>
                  <div className="absolute inset-0 rounded-full border-[1.5px] border-dashed animate-[spin_30s_linear_infinite] border-current" />
                  <div className="absolute inset-12 rounded-full border-[1.5px] animate-[spin_20s_linear_infinite_reverse] border-current opacity-60" />
                  <div className="absolute inset-24 rounded-full border-[1.5px] border-dashed animate-[spin_10s_linear_infinite] border-current opacity-30" />
                </div>
              </motion.div>

              {/* Card 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7, delay: 0.1, type: "spring" }}
                className={`group rounded-3xl p-8 sm:p-10 border flex flex-col relative overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${isDark ? 'bg-[#0a0a0a]/80 backdrop-blur-xl border-white/10 hover:border-t-white/30 hover:border-l-white/30 hover:bg-[#111]' : 'bg-[#f8f9fa]/80 backdrop-blur-xl border-black/5 hover:border-white hover:bg-white hover:shadow-black/5'}`}
              >
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                    <Zap className={`w-6 h-6 ${isDark ? 'text-white' : 'text-black'}`} />
                  </div>
                  <h3 className={`text-2xl font-semibold mb-4 tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>Colocated Execution</h3>
                  <p className={`leading-relaxed flex-1 transition-colors duration-300 ${isDark ? 'text-zinc-400 group-hover:text-zinc-300' : 'text-zinc-600 group-hover:text-zinc-800'}`}>
                    Sub-millisecond routing to major exchanges. Eliminate slippage and front-running with direct market access infrastructure.
                  </p>
                </div>
                {/* Glowing orb effect on hover */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 dark:bg-amber-400/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              </motion.div>

              {/* Card 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7, delay: 0.15, type: "spring" }}
                className={`group rounded-3xl p-8 sm:p-10 border flex flex-col relative overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${isDark ? 'bg-[#0a0a0a]/80 backdrop-blur-xl border-white/10 hover:border-t-white/30 hover:border-l-white/30 hover:bg-[#111]' : 'bg-[#f8f9fa]/80 backdrop-blur-xl border-black/5 hover:border-white hover:bg-white hover:shadow-black/5'}`}
              >
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                    <Shield className={`w-6 h-6 ${isDark ? 'text-white' : 'text-black'}`} />
                  </div>
                  <h3 className={`text-2xl font-semibold mb-4 tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>Risk Management</h3>
                  <p className={`leading-relaxed flex-1 transition-colors duration-300 ${isDark ? 'text-zinc-400 group-hover:text-zinc-300' : 'text-zinc-600 group-hover:text-zinc-800'}`}>
                    Define strict portfolio constraints. Our engine autonomously halts execution if variance thresholds or drawdown limits are breached.
                  </p>
                </div>
                {/* Glowing orb effect on hover */}
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 dark:bg-emerald-400/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              </motion.div>

              {/* Card 4: Span 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7, delay: 0.2, type: "spring" }}
                className={`group md:col-span-2 rounded-3xl p-8 sm:p-12 border flex flex-col justify-between overflow-hidden relative transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${isDark ? 'bg-[#0a0a0a]/80 backdrop-blur-xl border-white/10 hover:border-t-white/30 hover:border-l-white/30 hover:bg-[#111]' : 'bg-[#f8f9fa]/80 backdrop-blur-xl border-black/5 hover:border-white hover:bg-white hover:shadow-black/5'}`}
              >
                <div className="relative z-10 max-w-md">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                    <LineChart className={`w-6 h-6 ${isDark ? 'text-white' : 'text-black'}`} />
                  </div>
                  <h3 className={`text-2xl font-semibold mb-4 tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>Predictive Modeling</h3>
                  <p className={`leading-relaxed transition-colors duration-300 ${isDark ? 'text-zinc-300 group-hover:text-white/90' : 'text-zinc-600 group-hover:text-zinc-800'}`}>
                    Deploy proprietary TensorFlow and PyTorch models seamlessly. Backtest against 20 years of historical data and transition to live trading with a single click.
                  </p>
                </div>
                
                {/* Decorative abstract chart */}
                <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-40 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none flex items-end">
                  <div className="w-full h-1/2 bg-gradient-to-t from-blue-500/20 to-transparent flex items-end px-4 gap-2">
                    {[40, 70, 45, 90, 65, 100].map((height, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ height: "10%" }}
                        whileInView={{ height: `${height}%` }}
                        transition={{ duration: 1, delay: 0.2 + (i * 0.1), ease: "easeOut" }}
                        className={`flex-1 rounded-t-sm ${isDark ? 'bg-white/20 group-hover:bg-blue-400/40' : 'bg-black/10 group-hover:bg-blue-500/30'} transition-colors duration-500`} 
                      />
                    ))}
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </div>

        {/* HOW IT WORKS SECTION */}
        <div className={`relative z-10 w-full py-32 ${isDark ? 'bg-[#050505] border-t border-white/5' : 'bg-[#fafafa] border-t border-black/5'}`}>
          <div className="max-w-[1280px] mx-auto px-6 sm:px-8">
            <div className="mb-20 text-center max-w-3xl mx-auto">
              <h2 style={{ fontFamily: 'var(--font-heading)' }} className={`text-4xl md:text-5xl mb-6 tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
                The Complete Lifecycle.
              </h2>
              <p className={`text-lg leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                QuantAdv provides a unified environment to develop, backtest, and deploy algorithmic trading strategies without ever switching contexts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 relative">
              {[
                { step: '01', title: 'Develop', desc: 'Write logic in Python using our cloud IDE. Native support for Pandas, NumPy, and Scikit-learn.' },
                { step: '02', title: 'Backtest', desc: 'Simulate against 10+ years of tick data. Instantly visualize drawdown, Sharpe, and alpha.' },
                { step: '03', title: 'Deploy', desc: 'Move to production with one click. Our execution engine handles routing and order management.' },
                { step: '04', title: 'Monitor', desc: 'Track live PnL, risk exposure, and slippage in real-time through the institutional dashboard.' }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="group relative z-10"
                >
                  <div className={`text-7xl font-bold mb-6 tracking-tighter transition-colors duration-700 ${isDark ? 'text-white/5 group-hover:text-white/20' : 'text-black/5 group-hover:text-black/20'}`} style={{ fontFamily: 'var(--font-heading)' }}>
                    {item.step}
                  </div>
                  <h3 className={`text-2xl font-semibold mb-4 tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>{item.title}</h3>
                  <p className={`leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>{item.desc}</p>
                </motion.div>
              ))}
              
              {/* Connecting Line (Background) */}
              <div className={`hidden md:block absolute top-[4.5rem] left-[5rem] w-[calc(100%-10rem)] h-[1px] ${isDark ? 'bg-white/5' : 'bg-black/5'} z-0`}>
                <motion.div 
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
                  className={`h-full w-full origin-left ${isDark ? 'bg-white/20' : 'bg-black/20'}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CTA BOTTOM */}
        <div className={`relative z-10 w-full ${isDark ? 'px-2 sm:px-4 pb-8 sm:pb-12 pt-16' : ''}`}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`relative text-center flex flex-col items-center justify-center min-h-[400px] overflow-hidden ${
              isDark 
                ? 'rounded-2xl border-[0.5px] border-white/20 shadow-2xl shadow-white/5 p-16 md:p-24' 
                : 'w-full py-24 md:py-32'
            }`}
          >
            {/* Background Video */}
            <video
              autoPlay muted loop playsInline
              className="absolute inset-0 w-full h-full object-cover object-bottom scale-105"
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260606_131516_eca35265-ea66-4fbd-8d52-22aae6e1a503.mp4"
            />
            {/* Overlay to ensure text readability */}
            <div className={`absolute inset-0 ${isDark ? 'bg-black/60' : 'bg-white/40'}`} />

            <div className="relative z-10 max-w-2xl mx-auto px-6">
              <h2 style={{ fontFamily: 'var(--font-heading)' }} className={`text-4xl md:text-6xl mb-6 tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
                Start trading today.
              </h2>
              <p className={`text-xl mx-auto mb-10 max-w-xl ${isDark ? 'text-zinc-200' : 'text-zinc-800 font-medium'}`}>
                Build, test, and deploy quantitative strategies on institutional infrastructure.
              </p>
              <Link href="/register"
                style={{ background: isDark ? 'white' : 'black', color: isDark ? 'black' : 'white', borderRadius: '50px', padding: '18px 36px', fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
                className="hover:scale-[1.03] active:scale-[0.97] transition-transform shadow-xl"
              >
                Create an account
              </Link>
            </div>
          </motion.div>
        </div>

        {/* FOOTER */}
        <footer className={`relative z-10 w-full py-16 md:py-24 ${isDark ? 'bg-[#050505] border-t border-white/5' : 'bg-[#fafafa] border-t border-black/5'}`}>
          <div className="max-w-[1280px] mx-auto px-6 sm:px-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-6 mb-16">
              <div className="col-span-2 md:col-span-2 flex flex-col items-start pr-4">
                <div className="flex items-center gap-2 mb-6">
                  <Activity className={`w-6 h-6 ${isDark ? 'text-white' : 'text-black'}`} />
                  <span className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-black'}`} style={{ fontFamily: 'var(--font-heading)' }}>QuantAdv</span>
                </div>
                <p className={`text-sm mb-6 ${isDark ? 'text-zinc-400' : 'text-zinc-600'} leading-relaxed max-w-xs`}>
                  Empowering the open-source quantitative community with institutional-grade infrastructure for developing, backtesting, and deploying algorithmic strategies.
                </p>
                <div className="flex items-center gap-4">
                  <a href="https://github.com/John-Varghese-EH/Quantitative-Trading/" target="_blank" rel="noopener noreferrer" className={`p-2 rounded-full transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-zinc-300' : 'bg-black/5 hover:bg-black/10 text-zinc-600'}`}>
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                  </a>
                  <a href="#" className={`p-2 rounded-full transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-zinc-300' : 'bg-black/5 hover:bg-black/10 text-zinc-600'}`}>
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                  </a>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Product</h4>
                <Link href="#" className={`text-sm ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'} transition-colors`}>Platform</Link>
                <Link href="#" className={`text-sm ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'} transition-colors`}>Backtesting Engine</Link>
                <Link href="#" className={`text-sm ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'} transition-colors`}>Live Trading</Link>
                <Link href="#" className={`text-sm ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'} transition-colors`}>Pricing</Link>
              </div>

              <div className="flex flex-col gap-4">
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Resources</h4>
                <Link href="#" className={`text-sm ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'} transition-colors`}>Documentation</Link>
                <Link href="#" className={`text-sm ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'} transition-colors`}>API Reference</Link>
                <Link href="#" className={`text-sm ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'} transition-colors`}>Community</Link>
                <Link href="#" className={`text-sm ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'} transition-colors`}>Blog</Link>
              </div>

              <div className="flex flex-col gap-4">
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Legal</h4>
                <Link href="/terms" className={`text-sm ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'} transition-colors`}>Terms of Service</Link>
                <Link href="/privacy" className={`text-sm ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'} transition-colors`}>Privacy Policy</Link>
                <Link href="/cookies" className={`text-sm ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'} transition-colors`}>Cookie Policy</Link>
                <Link href="/disclaimer" className={`text-sm ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'} transition-colors`}>Risk Disclaimer</Link>
                <a href="https://github.com/John-Varghese-EH/Quantitative-Trading/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className={`text-sm ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'} transition-colors`}>AGPLv3 License</a>
              </div>
            </div>

            <div className={`pt-8 border-t ${isDark ? 'border-white/10' : 'border-black/10'} flex flex-col md:flex-row items-center justify-between gap-4`}>
              <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                &copy; {new Date().getFullYear()} QuantAdv. Open source under AGPLv3.
              </p>
              <div className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                Built by the Quantitative Community.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
