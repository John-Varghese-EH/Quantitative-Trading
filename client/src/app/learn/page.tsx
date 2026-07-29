"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, ChevronRight, CheckCircle, ArrowLeft, Terminal, Activity,
  BrainCircuit, Check, Menu, X, Play, TrendingUp, ShieldAlert, BarChart2,
  FileText, Download, ExternalLink, Video, ChevronDown, Shield, Zap,
  AlertTriangle, Eye, Lock, Cpu, Database, Globe, BookMarked, GraduationCap,
  Layers, Target, Bug, Library, Rocket, HelpCircle, Presentation,
  Workflow, FlaskConical, Boxes
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, ReferenceLine
} from "recharts";

// --- Modern Web Guidance: Scroll Entry Effects ---
const ScrollReveal = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const [isNativeSupported, setIsNativeSupported] = useState(true);

  useEffect(() => {
    if (typeof CSS !== 'undefined' && !CSS.supports('(animation-timeline: view()) and (animation-range: entry)')) {
      setIsNativeSupported(false);
    }
  }, []);

  if (isNativeSupported) {
    return <div className="scroll-reveal">{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 24 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
};

// --- Video Embed Component ---
const VideoEmbed = ({ videoId, title }: { videoId: string; title: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="group relative rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-black aspect-video">
      {!isLoaded ? (
        <button
          onClick={() => setIsLoaded(true)}
          className="absolute inset-0 flex items-center justify-center cursor-pointer group/play"
          aria-label={`Play video: ${title}`}
        >
          {/* Thumbnail */}
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          {/* Play button */}
          <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-2xl transition-all duration-300 group-hover/play:scale-110 group-hover/play:bg-white/30">
            <Play size={28} className="text-white ml-1" fill="white" />
          </div>
          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-10">
            <p className="text-white text-sm sm:text-base font-semibold line-clamp-2 drop-shadow-lg">{title}</p>
          </div>
        </button>
      ) : (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
          loading="lazy"
        />
      )}
    </div>
  );
};

// --- Embedded PDF Viewer Component ---
const EmbeddedPDF = ({ title, filename, description, icon: Icon, color }: {
  title: string; filename: string; description: string;
  icon: React.ElementType; color: string;
}) => (
  <div className="rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden bg-white dark:bg-[#0f0f14] shadow-lg">
    {/* Header */}
    <div className="p-4 sm:p-5 border-b border-black/5 dark:border-white/5">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-${color}-500/10 flex items-center justify-center`}>
          <Icon size={20} className={`text-${color}-500`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm sm:text-base mb-1 line-clamp-1">{title}</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 sm:mt-4">
        <a
          href={`/learn/${filename}`}
          download
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-${color}-500/10 text-${color}-600 dark:text-${color}-400 hover:bg-${color}-500/20 transition-colors`}
        >
          <Download size={12} /> Download
        </a>
        <a
          href={`/learn/${filename}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <ExternalLink size={12} /> Open in New Tab
        </a>
      </div>
    </div>
    {/* Embedded PDF */}
    <div className="relative bg-zinc-100 dark:bg-zinc-900">
      <iframe
        src={`/learn/${filename}#toolbar=1&navpanes=0&view=FitH`}
        title={title}
        className="w-full h-[45vh] sm:h-[65vh] lg:h-[80vh] border-0"
        loading="lazy"
      />
    </div>
  </div>
);

// --- Section Header ---
const SectionHeader = ({ icon: Icon, label, title, subtitle }: {
  icon: React.ElementType; label: string; title: string; subtitle?: string;
}) => (
  <div className="mb-8 sm:mb-12">
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-blue-500/10 text-blue-500 border border-blue-500/20 mb-4">
      <Icon size={14} /> {label}
    </div>
    <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
      {title}
    </h2>
    {subtitle && (
      <p className="mt-3 text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">{subtitle}</p>
    )}
  </div>
);

// --- Collapsible Section ---
const CollapsibleSection = ({ title, children, defaultOpen = false }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-[#0f0f14] transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="font-bold text-sm sm:text-base pr-4">{title}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown size={18} className="text-zinc-400 shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-5 sm:px-6 pb-6 border-t border-black/5 dark:border-white/5 pt-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Stat Card ---
const StatCard = ({ value, label, color }: { value: string; label: string; color: string }) => (
  <div className={`text-center p-4 sm:p-5 rounded-2xl bg-${color}-500/5 border border-${color}-500/10`}>
    <div className={`text-2xl sm:text-3xl font-bold text-${color}-500 mb-1`} style={{ fontFamily: 'var(--font-heading)' }}>{value}</div>
    <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium">{label}</div>
  </div>
);

// --- Interactive Components ---

// 1. Order Book Simulation
const InteractiveOrderBook = () => {
  const [bids, setBids] = useState([
    { price: 150.01, size: 400 }, { price: 150.00, size: 1200 }, { price: 149.98, size: 300 }
  ]);
  const [asks, setAsks] = useState([
    { price: 150.03, size: 500 }, { price: 150.04, size: 800 }, { price: 150.05, size: 200 }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBids(prev => prev.map(b => ({ ...b, size: Math.max(100, b.size + (Math.random() > 0.5 ? 50 : -50)) })));
      setAsks(prev => prev.map(a => ({ ...a, size: Math.max(100, a.size + (Math.random() > 0.5 ? 50 : -50)) })));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-black dark:bg-[#0a0a0a] text-white font-mono text-xs sm:text-sm border border-black/10 dark:border-white/10 shadow-xl">
      <div className="flex justify-between mb-4 text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider font-bold">
        <span>Bid Size</span><span>Price</span><span>Ask Size</span>
      </div>
      <div className="space-y-1">
        {[...asks].reverse().map((ask, i) => (
          <div key={`ask-${i}`} className="flex justify-between text-red-400">
            <span className="opacity-0">0000</span>
            <span>{ask.price.toFixed(2)}</span>
            <span className="w-12 text-right relative">
              <div className="absolute right-0 top-0 h-full bg-red-900/30 -z-10" style={{ width: `${(ask.size / 1500) * 100}%` }} />
              {ask.size}
            </span>
          </div>
        ))}
        <div className="py-2 flex justify-between text-zinc-400 items-center text-[10px] sm:text-xs">
          <span>Spread: 0.02</span>
          <span className="px-2 py-0.5 bg-zinc-800 rounded">150.02</span>
        </div>
        {bids.map((bid, i) => (
          <div key={`bid-${i}`} className="flex justify-between text-emerald-400">
            <span className="w-12 relative">
              <div className="absolute left-0 top-0 h-full bg-emerald-900/30 -z-10" style={{ width: `${(bid.size / 1500) * 100}%` }} />
              {bid.size}
            </span>
            <span>{bid.price.toFixed(2)}</span>
            <span className="opacity-0">0000</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. Mean Reversion Chart
const generateSpreadData = () => {
  let spread = 0;
  return Array.from({ length: 50 }).map((_, i) => {
    spread += (Math.random() - 0.5) * 2;
    spread -= spread * 0.1;
    return { time: i, spread, upper: 2, lower: -2 };
  });
};

const MeanReversionChart = () => {
  const data = React.useMemo(() => generateSpreadData(), []);
  return (
    <div className="h-48 sm:h-64 w-full p-3 sm:p-4 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] shadow-inner">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <YAxis domain={[-4, 4]} hide />
          <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
          <ReferenceLine y={2} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Short', fill: '#ef4444', fontSize: 10 }} />
          <ReferenceLine y={-2} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'insideBottomLeft', value: 'Long', fill: '#10b981', fontSize: 10 }} />
          <ReferenceLine y={0} stroke="#52525b" />
          <Line type="monotone" dataKey="spread" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={true} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// 3. Interactive Code Runner
const InteractiveCodeRunner = () => {
  const [state, setState] = useState<'idle' | 'running' | 'done'>('idle');
  const [logs, setLogs] = useState<string[]>([]);

  const runBacktest = () => {
    if (state !== 'idle') return;
    setState('running');
    setLogs(['Initializing environment...']);

    setTimeout(() => setLogs(l => [...l, 'Loading feature dataset (X_train, y_train)...']), 800);
    setTimeout(() => setLogs(l => [...l, 'Training RandomForestRegressor(n_estimators=500)...']), 1600);
    setTimeout(() => setLogs(l => [...l, 'Evaluating on holdout set...', 'Sharpe Ratio: 2.14 | Max Drawdown: -4.2%']), 3000);
    setTimeout(() => setState('done'), 4000);
  };

  const backtestData = Array.from({ length: 30 }).map((_, i) => ({ day: i, pnl: Math.exp(i * 0.05) + (Math.random() * 2) }));

  return (
    <div className="rounded-xl overflow-hidden border border-black/10 dark:border-white/10 shadow-2xl">
      <div className="bg-zinc-100 dark:bg-zinc-900 border-b border-black/10 dark:border-white/10 px-3 sm:px-4 py-2.5 sm:py-3 flex justify-between items-center">
        <div className="flex gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-400" />
        </div>
        <button
          onClick={runBacktest}
          disabled={state !== 'idle'}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] sm:text-xs font-bold rounded shadow transition-colors disabled:opacity-50"
        >
          <Play size={10} fill="currentColor" /> {state === 'idle' ? 'Run Backtest' : state === 'running' ? 'Running...' : 'Completed'}
        </button>
      </div>
      <div className="p-3 sm:p-4 bg-[#fafafa] dark:bg-[#050505] font-mono text-xs sm:text-sm h-52 sm:h-64 overflow-y-auto flex flex-col">
        {state === 'idle' && (
          <code className="text-zinc-800 dark:text-zinc-300 text-[11px] sm:text-sm leading-relaxed">
            <span className="text-pink-600 dark:text-pink-400">from</span> models.ensemble <span className="text-pink-600 dark:text-pink-400">import</span> RandomForestAlpha<br/>
            <span className="text-pink-600 dark:text-pink-400">from</span> quantadv.backtest <span className="text-pink-600 dark:text-pink-400">import</span> Engine<br/><br/>
            model = RandomForestAlpha(trees=500, max_depth=6)<br/>
            engine = Engine(model, start=<span className="text-amber-600 dark:text-amber-300">"2020-01-01"</span>, end=<span className="text-amber-600 dark:text-amber-300">"2024-01-01"</span>)<br/><br/>
            <span className="text-emerald-600 dark:text-emerald-400"># Click 'Run Backtest' to execute</span><br/>
            engine.run()
          </code>
        )}
        {state !== 'idle' && (
          <div className="text-zinc-500 text-[10px] sm:text-xs space-y-1 mb-4">
            {logs.map((l, i) => <div key={i}>{'>'} {l}</div>)}
            {state === 'running' && <div className="animate-pulse">{'>'} _</div>}
          </div>
        )}
        {state === 'done' && (
          <div className="flex-1 mt-2 animate-in fade-in duration-1000">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={backtestData}>
                <defs>
                  <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="pnl" stroke="#10b981" fillOpacity={1} fill="url(#colorPnl)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

// 4. Knowledge Check Component
const KnowledgeCheck = ({ question, options, correctIndex, onPass }: {
  question: string; options: string[]; correctIndex: number; onPass: () => void;
}) => {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (idx: number) => {
    setSelected(idx);
    if (idx === correctIndex) onPass();
  };

  return (
    <div className="mt-8 sm:mt-12 p-5 sm:p-8 border border-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl">
      <div className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider text-[10px] sm:text-xs">
        <CheckCircle size={16} /> Knowledge Check
      </div>
      <h4 className="text-base sm:text-lg font-semibold mb-5 sm:mb-6">{question}</h4>
      <div className="space-y-2.5 sm:space-y-3">
        {options.map((opt, i) => {
          const isCorrect = i === correctIndex;
          const isSelected = selected === i;
          let style = "border-black/10 dark:border-white/10 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20";
          if (isSelected) {
            style = isCorrect
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
              : "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={selected === correctIndex}
              className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all text-sm ${style}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// --- Adversarial Attack Visualization ---
const AdversarialAttackViz = () => {
  const normalData = Array.from({ length: 30 }).map((_, i) => ({
    time: i,
    normal: 100 + i * 0.382 + Math.sin(i * 0.5) * 3,
    gsa: 100 + i * 0.676 + Math.sin(i * 0.5) * 3,
    lssa: 100 + i * 0.538 + Math.sin(i * 0.5) * 2.5,
  }));

  return (
    <div className="h-48 sm:h-64 w-full p-3 sm:p-4 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] shadow-inner">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={normalData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <YAxis hide />
          <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
          <Line type="monotone" dataKey="normal" stroke="#3b82f6" strokeWidth={2} dot={false} name="Normal Prediction" />
          <Line type="monotone" dataKey="gsa" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" name="GSA Attack" />
          <Line type="monotone" dataKey="lssa" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="8 4" name="LSSA Attack" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};


// --- Course Content ---
const courseModules = [
  {
    id: "microstructure",
    title: "1. Market Microstructure",
    icon: <BarChart2 size={18} />,
    content: (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-6 sm:mb-8" style={{ fontFamily: 'var(--font-heading)' }}>Market Microstructure</h1>
        <p className="text-base sm:text-lg leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
          To build a quantitative system, you must first understand the absolute foundation of markets: the Limit Order Book (LOB).
        </p>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          The price you see on Yahoo Finance or TV is an illusion. There is no single &quot;price&quot;. There is only the <strong>Bid</strong> (the highest price a buyer is willing to pay) and the <strong>Ask</strong> (the lowest price a seller is willing to accept).
        </p>

        <div className="my-6 sm:my-8">
          <InteractiveOrderBook />
          <p className="text-[10px] sm:text-xs text-center mt-3 text-zinc-500 uppercase tracking-widest font-semibold">Live Order Book Simulation</p>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold mt-6 sm:mt-8">The Spread and Liquidity</h3>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          The difference between the highest Bid and lowest Ask is the <strong>Spread</strong>. High-Frequency Trading (HFT) firms act as market makers, constantly posting bids and asks to capture this spread. In exchange, they provide <em>liquidity</em> to the market.
        </p>
      </div>
    ),
    quiz: {
      q: "If you want to immediately buy an asset using a Market Order, which price will you pay?",
      opts: ["The Mid Price", "The highest Bid price", "The lowest Ask price", "The closing price of the previous day"],
      ans: 2
    }
  },
  {
    id: "statarb",
    title: "2. Statistical Arbitrage",
    icon: <TrendingUp size={18} />,
    content: (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-6 sm:mb-8" style={{ fontFamily: 'var(--font-heading)' }}>Statistical Arbitrage</h1>
        <p className="text-base sm:text-lg leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
          Statistical Arbitrage (StatArb) is a class of short-term financial trading strategies that employ mean reversion models involving large diversified portfolios of securities.
        </p>

        <div className="p-4 sm:p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <h3 className="text-lg sm:text-xl font-semibold mb-3">Pairs Trading (Cointegration)</h3>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mb-4">
            Imagine two highly correlated companies, like Coca-Cola and Pepsi. If Coca-Cola&apos;s stock suddenly shoots up while Pepsi&apos;s stays flat, the historical relationship (spread) between them has widened. A quant will short Coca-Cola and buy Pepsi, betting the spread will <strong>revert to the mean</strong>.
          </p>
          <MeanReversionChart />
        </div>

        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          This relies heavily on the mathematical concept of <em>Cointegration</em>. Unlike simple correlation, cointegration means the linear combination of two non-stationary time series produces a stationary process (a spread that consistently bounces around a constant mean).
        </p>
      </div>
    ),
    quiz: {
      q: "In a pairs trading strategy, what action do you take when the spread significantly exceeds its historical mean?",
      opts: ["Buy both assets", "Short the overperforming asset and buy the underperforming asset", "Wait for the trend to continue", "Buy the overperforming asset"],
      ans: 1
    }
  },
  {
    id: "ml",
    title: "3. Machine Learning Alpha",
    icon: <BrainCircuit size={18} />,
    content: (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-6 sm:mb-8" style={{ fontFamily: 'var(--font-heading)' }}>Machine Learning in Trading</h1>
        <p className="text-base sm:text-lg leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
          The holy grail of modern quant finance is training algorithms to discover non-linear predictive relationships (Alpha) in massive datasets.
        </p>

        <InteractiveCodeRunner />

        <h3 className="text-xl sm:text-2xl font-bold mt-8 sm:mt-10">The Danger of Overfitting</h3>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          Financial data has an incredibly low signal-to-noise ratio. If you train a deep neural network on pure price data, it will almost certainly overfit to the noise. The model will look like a money-printer in backtests but lose money rapidly in live trading.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
          <div className="p-4 sm:p-5 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl">
            <h4 className="font-bold text-red-700 dark:text-red-400 mb-2 text-sm sm:text-base">Lookahead Bias</h4>
            <p className="text-xs sm:text-sm text-red-600 dark:text-red-300">Accidentally using information from the future (like closing price) to predict today&apos;s trades.</p>
          </div>
          <div className="p-4 sm:p-5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl">
            <h4 className="font-bold text-amber-700 dark:text-amber-400 mb-2 text-sm sm:text-base">Survivorship Bias</h4>
            <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-300">Testing only on companies that exist today, ignoring the bankrupt ones that were present in the past.</p>
          </div>
        </div>
      </div>
    ),
    quiz: {
      q: "Which bias occurs when your backtest uses data that wouldn't have been available at the time of the trade?",
      opts: ["Survivorship Bias", "Lookahead Bias", "Confirmation Bias", "Selection Bias"],
      ans: 1
    }
  },
  {
    id: "risk",
    title: "4. Risk & Kelly Criterion",
    icon: <ShieldAlert size={18} />,
    content: (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-6 sm:mb-8" style={{ fontFamily: 'var(--font-heading)' }}>Risk Management</h1>
        <p className="text-base sm:text-lg leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
          A mediocre strategy with exceptional risk management will survive. An exceptional strategy with poor risk management will blow up.
        </p>

        <div className="p-4 sm:p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <h3 className="text-lg sm:text-xl font-semibold mb-3">The Kelly Criterion</h3>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mb-6">
            The Kelly formula tells you exactly what percentage of your capital to risk on a single trade to maximize long-term compounding growth.
            <br/><br/>
            <code className="text-xs sm:text-sm">f* = p - (q / b)</code>
            <br/><br/>
            Where <code>p</code> is win probability, <code>q</code> is loss probability, and <code>b</code> is the odds (win/loss size ratio).
          </p>
          <div className="p-3 sm:p-4 bg-white dark:bg-[#0a0a0a] rounded-xl border border-black/10 dark:border-white/10">
            <div className="flex justify-between items-end mb-4 gap-2">
              <div className="flex-1 text-center">
                <div className="h-10 sm:h-12 w-full bg-red-400 rounded-t-sm" />
                <div className="text-[10px] sm:text-xs mt-2 font-bold uppercase">Over-betting<br/>(Ruin)</div>
              </div>
              <div className="flex-1 text-center">
                <div className="h-24 sm:h-32 w-full bg-emerald-500 rounded-t-sm relative">
                  <div className="absolute -top-5 sm:-top-6 inset-x-0 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] sm:text-xs">Optimal (f*)</div>
                </div>
                <div className="text-[10px] sm:text-xs mt-2 font-bold uppercase">Max Growth</div>
              </div>
              <div className="flex-1 text-center">
                <div className="h-14 sm:h-16 w-full bg-blue-400 rounded-t-sm" />
                <div className="text-[10px] sm:text-xs mt-2 font-bold uppercase">Under-betting<br/>(Safe)</div>
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-center text-zinc-500">Betting more than the optimal Kelly fraction guarantees long-term ruin, even with an edge.</p>
          </div>
        </div>
      </div>
    ),
    quiz: {
      q: "According to the Kelly Criterion, what happens if you consistently bet MORE than the optimal fraction (f*)?",
      opts: ["You grow your portfolio faster", "You experience less volatility", "Your long-term growth rate decreases and approaches ruin", "Nothing changes"],
      ans: 2
    }
  },
  {
    id: "execution",
    title: "5. Algorithmic Execution",
    icon: <Terminal size={18} />,
    content: (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-6 sm:mb-8" style={{ fontFamily: 'var(--font-heading)' }}>Algorithmic Execution</h1>
        <p className="text-base sm:text-lg leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
          Generating a profitable signal is only half the battle. If your execution is poor, slippage and market impact will eat all your theoretical profits.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 my-6 sm:my-8">
          <div className="p-4 sm:p-6 rounded-2xl bg-[#0a0a0a] text-white border border-white/10 shadow-xl">
            <h3 className="font-bold mb-2 flex items-center gap-2 text-sm sm:text-base"><div className="w-2 h-2 rounded-full bg-blue-500" /> TWAP</h3>
            <p className="text-xs sm:text-sm text-zinc-400">Slices a large order into smaller chunks and executes them evenly over a specified time period to minimize market impact.</p>
          </div>
          <div className="p-4 sm:p-6 rounded-2xl bg-[#0a0a0a] text-white border border-white/10 shadow-xl">
            <h3 className="font-bold mb-2 flex items-center gap-2 text-sm sm:text-base"><div className="w-2 h-2 rounded-full bg-indigo-500" /> VWAP</h3>
            <p className="text-xs sm:text-sm text-zinc-400">Executes orders proportionally to historical volume profiles. Higher execution at the open/close, lower at mid-day.</p>
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold mt-6 sm:mt-8">Slippage</h3>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          Slippage occurs when the price of an asset changes between the time your algorithm decides to trade and the time the exchange matching engine actually executes your order. In high-frequency strategies, 1 millisecond of latency can turn a profitable strategy into a massive loser.
        </p>
      </div>
    ),
    quiz: {
      q: "If you need to buy 100,000 shares but want to avoid spiking the price, which execution algorithm should you use?",
      opts: ["Market Order (All at once)", "TWAP or VWAP (Slicing the order)", "Limit Order far above the current price", "Stop-loss Order"],
      ans: 1
    }
  },
  {
    id: "adversarial",
    title: "6. AI Security & Attacks",
    icon: <Shield size={18} />,
    content: (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
          AI Security in Trading
        </h1>
        <p className="text-sm sm:text-base italic text-zinc-500 dark:text-zinc-400 mb-6 sm:mb-8 border-l-2 border-red-500 pl-4">
          &quot;The Silent Crash: 5 Surprising Ways AI Trading Models are Being Secretly Manipulated&quot;
        </p>

        <p className="text-base sm:text-lg leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
          Deep Reinforcement Learning (DRL) agents in high-frequency trading execute decisions at speeds no human can match. However, this speed masks a profound vulnerability: these agents are susceptible to &quot;invisible&quot; adversarial attacks that trick an AI into executing catastrophic trades.
        </p>

        {/* Key Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 sm:my-8">
          <StatCard value="57%" label="Discriminator Accuracy" color="red" />
          <StatCard value="28%" label="Specificity Drop" color="amber" />
          <StatCard value="2x" label="Slope Amplification" color="blue" />
          <StatCard value="5" label="Attack Vectors" color="emerald" />
        </div>

        {/* Attack 1 */}
        <div className="p-4 sm:p-6 rounded-2xl bg-red-50/50 dark:bg-red-900/5 border border-red-200/50 dark:border-red-900/20">
          <div className="flex items-center gap-2 mb-3 text-red-600 dark:text-red-400 font-bold text-xs uppercase tracking-widest">
            <Target size={14} /> Attack Vector 1
          </div>
          <h3 className="text-lg sm:text-xl font-bold mb-3">The Nash Equilibrium Trap</h3>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mb-4">
            In Multi-Agent RL (MARL), an attacker can manipulate historical datasets to install a &quot;fictitious&quot; Nash Equilibrium. By poisoning the offline dataset, they reframe the learner&apos;s <strong>Theory of Mind (ToM)</strong>—the internal set of plausible rewards the agent believes its competitors are pursuing. By shifting the ToM into a <strong>Unique Nash Set (UN)</strong>, the attacker forces the AI to learn a suboptimal, target strategy as its only logical &quot;best move.&quot;
          </p>
          <blockquote className="border-l-2 border-red-400 pl-4 text-sm italic text-zinc-500 dark:text-zinc-400">
            &quot;Our framework can be summarized by the mnemonic &apos;ToM moves to the UN.&apos; The attack is successful if, by controlling the dataset, the Theory of Mind set is moved inside the Unique Nash set.&quot; — Wu et al.
          </blockquote>
        </div>

        {/* Attack 2 with Chart */}
        <div className="p-4 sm:p-6 rounded-2xl bg-amber-50/50 dark:bg-amber-900/5 border border-amber-200/50 dark:border-amber-900/20">
          <div className="flex items-center gap-2 mb-3 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-widest">
            <TrendingUp size={14} /> Attack Vector 2
          </div>
          <h3 className="text-lg sm:text-xl font-bold mb-3">Slope-Based Trend Manipulation</h3>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mb-4">
            General Slope Attack (GSA) and Least-Squares Slope Attack (LSSA) target the temporal characteristics of financial time-series data. Instead of adding noise, they manipulate the trend itself—effectively &quot;doubling the slope&quot; of a predicted trend, forcing a model into aggressive buy/sell positions based on a manufactured trajectory.
          </p>
          <AdversarialAttackViz />
          <p className="text-[10px] sm:text-xs text-center mt-2 text-zinc-500 uppercase tracking-widest font-semibold">Normal vs. GSA vs. LSSA Predicted Slopes</p>

          {/* Data Table */}
          <div className="mt-4 overflow-x-auto -mx-2 px-2">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-3 font-bold text-zinc-500 uppercase tracking-wider text-[10px] sm:text-xs">Metric</th>
                  <th className="text-right py-2 px-2 font-bold text-blue-500 text-[10px] sm:text-xs">Normal</th>
                  <th className="text-right py-2 px-2 font-bold text-red-500 text-[10px] sm:text-xs">GSA</th>
                  <th className="text-right py-2 pl-2 font-bold text-amber-500 text-[10px] sm:text-xs">LSSA</th>
                </tr>
              </thead>
              <tbody className="text-zinc-600 dark:text-zinc-400">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-3">General Slope</td>
                  <td className="py-2 px-2 text-right font-mono">3.82×10⁻²</td>
                  <td className="py-2 px-2 text-right font-mono text-red-500">6.76×10⁻²</td>
                  <td className="py-2 pl-2 text-right font-mono text-amber-500">5.38×10⁻²</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-3">LS Slope</td>
                  <td className="py-2 px-2 text-right font-mono">3.37×10⁻²</td>
                  <td className="py-2 px-2 text-right font-mono text-red-500">2.77×10⁻²</td>
                  <td className="py-2 pl-2 text-right font-mono text-amber-500">4.96×10⁻²</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3">MAE</td>
                  <td className="py-2 px-2 text-right font-mono">2.15</td>
                  <td className="py-2 px-2 text-right font-mono text-red-500">2.26</td>
                  <td className="py-2 pl-2 text-right font-mono text-amber-500">2.49</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Attack 3 */}
        <div className="p-4 sm:p-6 rounded-2xl bg-purple-50/50 dark:bg-purple-900/5 border border-purple-200/50 dark:border-purple-900/20">
          <div className="flex items-center gap-2 mb-3 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-widest">
            <Eye size={14} /> Attack Vector 3
          </div>
          <h3 className="text-lg sm:text-xl font-bold mb-3">The A-GAN: Invisible Deception</h3>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            An Adversarial GAN (A-GAN) produces synthetic log returns that are statistically indistinguishable from real market data. These slope attacks reduced the specificity of a specialized 4-layered CNN discriminator to just <strong className="text-red-500">28%</strong>, with an overall accuracy of <strong className="text-red-500">57%</strong>. Your defensive tools are essentially flipping a coin.
          </p>
        </div>

        {/* Attack 4 */}
        <div className="p-4 sm:p-6 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/20 border border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2 mb-3 text-zinc-600 dark:text-zinc-400 font-bold text-xs uppercase tracking-widest">
            <Bug size={14} /> Attack Vector 4
          </div>
          <h3 className="text-lg sm:text-xl font-bold mb-3">The &quot;Trojan&quot; in the Library</h3>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mb-4">
            Vulnerabilities exist within the MLOps pipeline itself. The <code className="px-1.5 py-0.5 bg-black/5 dark:bg-white/5 rounded text-xs sm:text-sm">__init__.py</code> malware attack injects adversarial code directly into the inference library—bypassing <code className="px-1.5 py-0.5 bg-black/5 dark:bg-white/5 rounded text-xs sm:text-sm">torch.no_grad()</code> calls and turning a locked production environment back into an exploitable &quot;training&quot; environment.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 sm:p-4 bg-white dark:bg-[#0a0a0a] rounded-xl border border-black/5 dark:border-white/5 text-center">
              <Database size={20} className="mx-auto mb-2 text-red-500" />
              <p className="text-xs font-bold">Corrupted Datasets</p>
            </div>
            <div className="p-3 sm:p-4 bg-white dark:bg-[#0a0a0a] rounded-xl border border-black/5 dark:border-white/5 text-center">
              <Cpu size={20} className="mx-auto mb-2 text-amber-500" />
              <p className="text-xs font-bold">Hardware Targeting</p>
            </div>
            <div className="p-3 sm:p-4 bg-white dark:bg-[#0a0a0a] rounded-xl border border-black/5 dark:border-white/5 text-center">
              <Lock size={20} className="mx-auto mb-2 text-purple-500" />
              <p className="text-xs font-bold">Code Injection</p>
            </div>
          </div>
        </div>

        {/* Attack 5 */}
        <div className="p-4 sm:p-6 rounded-2xl bg-blue-50/50 dark:bg-blue-900/5 border border-blue-200/50 dark:border-blue-900/20">
          <div className="flex items-center gap-2 mb-3 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-widest">
            <Zap size={14} /> Attack Vector 5
          </div>
          <h3 className="text-lg sm:text-xl font-bold mb-3">Deep Trading&apos;s Blind Spots</h3>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Deep Q-Learning (DQN) agents are extremely sensitive to strategically induced perturbations. In HFT, even an infinitesimal &quot;nudge&quot; to a social sentiment feed or a market indicator can cause a DQN agent to flip its entire policy from &quot;Hold&quot; to &quot;Liquidation.&quot; The agent isn&apos;t failing—it is succeeding at executing an optimal policy based on a perfectly manufactured lie.
          </p>
          <blockquote className="mt-4 border-l-2 border-blue-400 pl-4 text-sm italic text-zinc-500 dark:text-zinc-400">
            &quot;Adversarial examples... are strategically induced perturbations in the input vectors that are not easily detectable by human observers.&quot; — Faghan et al.
          </blockquote>
        </div>

        {/* Defense Framework */}
        <div className="p-4 sm:p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/5 border border-emerald-200/50 dark:border-emerald-900/20">
          <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest">
            <Shield size={14} /> Defensive Framework
          </div>
          <h3 className="text-lg sm:text-xl font-bold mb-4">The Future of Defensive MLOps</h3>
          <div className="space-y-3">
            {[
              { icon: Lock, title: "Secure CI/CD Pipelines", desc: "Automated vulnerability scanning of all model dependencies" },
              { icon: Layers, title: "Image Hardening", desc: "Strict verification and signing of all containerized inference environments" },
              { icon: Activity, title: "Advanced Drift Detection", desc: "Sophisticated analysis to detect slope-based anomalies beyond simple mean-variance checks" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 sm:p-4 bg-white dark:bg-[#0a0a0a] rounded-xl border border-black/5 dark:border-white/5">
                <item.icon size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">{item.title}</h4>
                  <p className="text-xs sm:text-sm text-zinc-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    quiz: {
      q: "In the A-GAN attack, what was the overall accuracy of the CNN discriminator trying to detect fake data?",
      opts: ["95% — Nearly perfect detection", "75% — Somewhat effective", "57% — Barely better than random", "10% — Complete failure"],
      ans: 2
    }
  },
  {
    id: "platform",
    title: "7. Platform Overview",
    icon: <Rocket size={18} />,
    content: (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
          Platform Overview
        </h1>
        <p className="text-sm sm:text-base italic text-zinc-500 dark:text-zinc-400 mb-6 sm:mb-8 border-l-2 border-blue-500 pl-4">
          The QuantAdv Adversarial Machine Learning Sandbox
        </p>

        <p className="text-base sm:text-lg leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
          An AI-powered simulation platform that combines quantitative finance, machine learning, and cybersecurity to provide a secure environment for developing, testing, and evaluating automated trading strategies—without risking real capital.
        </p>

        {/* Problem Statement */}
        <div className="p-4 sm:p-6 rounded-2xl bg-red-50/50 dark:bg-red-900/5 border border-red-200/50 dark:border-red-900/20">
          <h3 className="text-lg sm:text-xl font-bold mb-3 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" /> Problem Statement
          </h3>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Modern financial markets increasingly rely on AI-driven trading systems. However, these systems are vulnerable to adversarial machine learning attacks, where attackers manipulate input data or poison training datasets to influence predictions and cause significant financial losses. There is a critical need for a secure, interactive platform where developers can safely study these vulnerabilities.
          </p>
        </div>

        {/* Objectives */}
        <div className="p-4 sm:p-6 rounded-2xl bg-blue-50/50 dark:bg-blue-900/5 border border-blue-200/50 dark:border-blue-900/20">
          <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
            <Target size={18} className="text-blue-500" /> Core Objectives
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {[
              "Develop AI models for predicting market trends",
              "Simulate algorithmic trading strategies virtually",
              "Demonstrate adversarial attacks on ML models",
              "Implement defense mechanisms for model robustness",
              "Visualize trading performance & security metrics",
            ].map((obj, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-black/5 dark:border-white/5">
                <CheckCircle size={14} className="text-blue-500 mt-0.5 shrink-0" />
                <span className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">{obj}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Features */}
        <h3 className="text-xl sm:text-2xl font-bold mt-6 sm:mt-8">Key Features</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {[
            { icon: TrendingUp, label: "Real-Time Market Data", sub: "Stocks, Crypto, Forex" },
            { icon: BrainCircuit, label: "AI Price Prediction", sub: "ML-driven forecasts" },
            { icon: Play, label: "Paper Trading", sub: "Risk-free simulation" },
            { icon: BarChart2, label: "Strategy Backtesting", sub: "Historical validation" },
            { icon: Zap, label: "Adversarial Attacks", sub: "Security testing" },
            { icon: Shield, label: "Defense Testing", sub: "Robustness evaluation" },
            { icon: Activity, label: "Portfolio Analytics", sub: "Risk metrics" },
            { icon: Eye, label: "Explainable AI", sub: "XAI transparency" },
            { icon: FileText, label: "Performance Reports", sub: "Detailed analytics" },
          ].map((feat, i) => (
            <div key={i} className="p-3 sm:p-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 text-center">
              <feat.icon size={20} className="mx-auto mb-2 text-blue-500" />
              <p className="text-xs sm:text-sm font-bold mb-0.5">{feat.label}</p>
              <p className="text-[10px] sm:text-xs text-zinc-500">{feat.sub}</p>
            </div>
          ))}
        </div>

        {/* Working Process */}
        <div className="p-4 sm:p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
            <Workflow size={18} className="text-emerald-500" /> Working Process
          </h3>
          <div className="space-y-2">
            {[
              "Collect historical financial market data",
              "Clean and preprocess the data",
              "Train ML models for price prediction",
              "Generate Buy/Sell/Hold trading signals",
              "Execute simulated trades in sandbox",
              "Perform adversarial attacks to test vulnerabilities",
              "Apply defensive AI techniques to strengthen the model",
              "Analyze portfolio performance, accuracy & security metrics",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 sm:p-3">
                <div className="shrink-0 w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-xs font-bold">{i + 1}</div>
                <span className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="p-4 sm:p-6 rounded-2xl bg-purple-50/50 dark:bg-purple-900/5 border border-purple-200/50 dark:border-purple-900/20">
          <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
            <Boxes size={18} className="text-purple-500" /> Technology Stack
          </h3>
          <div className="space-y-3">
            {[
              { cat: "Frontend", tech: "React.js, TypeScript, Tailwind CSS, Framer Motion, TradingView Charts, Plotly" },
              { cat: "Backend", tech: "FastAPI, Python" },
              { cat: "Machine Learning", tech: "Scikit-learn, TensorFlow, PyTorch, XGBoost" },
              { cat: "Database", tech: "PostgreSQL / MongoDB" },
              { cat: "APIs", tech: "Yahoo Finance, Alpha Vantage, Binance" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-black/5 dark:border-white/5">
                <span className="text-xs font-bold text-purple-500 uppercase tracking-wider shrink-0 w-28">{item.cat}</span>
                <span className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">{item.tech}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Applications */}
        <h3 className="text-xl sm:text-2xl font-bold mt-6 sm:mt-8">Applications</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {[
            "Algorithmic Trading", "Financial Risk Analysis", "AI Security Research",
            "Cybersecurity Education", "FinTech Product Dev", "University Projects",
          ].map((app, i) => (
            <div key={i} className="p-3 sm:p-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 text-center">
              <p className="text-xs sm:text-sm font-bold">{app}</p>
            </div>
          ))}
        </div>

        {/* Future Scope */}
        <div className="p-4 sm:p-6 rounded-2xl bg-amber-50/50 dark:bg-amber-900/5 border border-amber-200/50 dark:border-amber-900/20">
          <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
            <FlaskConical size={18} className="text-amber-500" /> Future Scope
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              "Reinforcement Learning-based trading agents",
              "Live paper trading with real-time market feeds",
              "Sentiment analysis from news & social media",
              "Blockchain-based trade verification",
              "Federated Learning for secure collaborative AI",
              "Multi-agent AI trading simulations",
              "Automated portfolio optimization via deep RL",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <Zap size={12} className="text-amber-500 mt-0.5 shrink-0" />
                <span className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    quiz: {
      q: "What is the primary purpose of the QuantAdv Adversarial ML Sandbox?",
      opts: [
        "To trade with real money on live markets",
        "To safely experiment with trading algorithms and study AI vulnerabilities without risking real capital",
        "To replace human traders with AI permanently",
        "To hack into real trading platforms"
      ],
      ans: 1
    }
  },
];

// --- Tab types for the main page sections ---
type MainTab = "course" | "videos" | "research" | "study-guide";

export default function LearnPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeModule, setActiveModule] = useState(0);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [passedChecks, setPassedChecks] = useState<Record<string, boolean>>({});
  const [mainTab, setMainTab] = useState<MainTab>("course");

  const currentModule = courseModules[activeModule];
  const isCompleted = completedModules.includes(currentModule.id);
  const hasPassedCheck = passedChecks[currentModule.id];
  const progress = (completedModules.length / courseModules.length) * 100;

  const handleComplete = () => {
    if (!hasPassedCheck && !isCompleted) return;

    if (isCompleted) {
      setCompletedModules(prev => prev.filter(id => id !== currentModule.id));
    } else {
      setCompletedModules(prev => [...prev, currentModule.id]);
      if (activeModule < courseModules.length - 1) {
        setTimeout(() => {
          setActiveModule(prev => prev + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 800);
      }
    }
  };

  // --- Tabs definition ---
  const tabs: { id: MainTab; label: string; icon: React.ElementType; mobileLabel: string }[] = [
    { id: "course", label: "Interactive Course", icon: GraduationCap, mobileLabel: "Course" },
    { id: "videos", label: "Video Lectures", icon: Video, mobileLabel: "Videos" },
    { id: "research", label: "Research Library", icon: Library, mobileLabel: "Papers" },
    { id: "study-guide", label: "Study Guide", icon: BookMarked, mobileLabel: "Guide" },
  ];

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-[#050505] text-white' : 'bg-[#fafafa] text-black'}`}>
      {/* Top Navbar */}
      <div className={`h-12 sm:h-16 flex items-center justify-between px-3 sm:px-8 border-b z-50 sticky top-0 ${isDark ? 'bg-[#050505]/80 border-white/10 backdrop-blur-xl' : 'bg-white/80 border-black/10 backdrop-blur-xl'}`}>
        <div className="flex items-center gap-2 sm:gap-4">
          {mainTab === "course" && (
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`md:hidden p-2 -ml-1 rounded-full ${isDark ? 'hover:bg-white/10 active:bg-white/15' : 'hover:bg-black/5 active:bg-black/10'}`}>
              <Menu size={18} />
            </button>
          )}
          <Link href="/" className={`hidden sm:flex items-center gap-2 text-sm font-bold transition-colors ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'}`}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <Link href="/" className={`sm:hidden p-1.5 rounded-full ${mainTab === "course" ? '' : '-ml-1'} ${isDark ? 'active:bg-white/10' : 'active:bg-black/5'}`}>
            <ArrowLeft size={16} className="text-zinc-400" />
          </Link>
          <div className="sm:hidden font-bold tracking-tight text-sm" style={{ fontFamily: 'var(--font-heading)' }}>Academy</div>
        </div>

        <div className="flex items-center gap-2 sm:gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Course Progress</span>
            <span className="text-sm font-bold">{Math.round(progress)}% Complete</span>
          </div>
          <span className="sm:hidden text-[10px] font-bold text-zinc-400">{Math.round(progress)}%</span>
          <div className={`w-16 sm:w-40 h-1.5 sm:h-2.5 rounded-full overflow-hidden shadow-inner ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Desktop Top Tabs — hidden on mobile */}
      <div className={`hidden sm:block sticky top-[4rem] z-40 border-b ${isDark ? 'bg-[#050505]/90 border-white/10 backdrop-blur-xl' : 'bg-white/90 border-black/10 backdrop-blur-xl'}`}>
        <div className="max-w-7xl mx-auto px-8 flex">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setMainTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-colors whitespace-nowrap ${
                  mainTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400'
                    : `${isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-500 hover:text-zinc-700'}`
                }`}
              >
                <TabIcon size={16} />
                {tab.label}
                {mainTab === tab.id && (
                  <motion.div
                    layoutId="activeTabDesktop"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* COURSE TAB */}
      {mainTab === "course" && (
        <div className="flex flex-1 overflow-hidden relative">
          {/* Sidebar Navigation */}
          <AnimatePresence>
            {(isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
              <motion.div
                initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className={`absolute md:relative z-40 w-64 sm:w-72 h-[calc(100vh-3rem-4rem)] sm:h-[calc(100vh-7.5rem)] border-r flex flex-col shadow-2xl md:shadow-none ${isDark ? 'bg-[#0a0a0a] border-white/10' : 'bg-[#f8f9fa] border-black/10'}`}
              >
                <div className="p-4 sm:p-6 overflow-y-auto h-full">
                  <h2 className="text-[10px] sm:text-sm font-bold uppercase tracking-widest mb-4 sm:mb-6 text-zinc-500">Syllabus</h2>
                  <div className="space-y-1.5">
                    {courseModules.map((module, idx) => {
                      const isActive = activeModule === idx;
                      const isDone = completedModules.includes(module.id);
                      return (
                        <button
                          key={module.id}
                          onClick={() => {
                            setActiveModule(idx);
                            if (window.innerWidth < 768) setIsSidebarOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-full flex items-center justify-between p-3 sm:p-3.5 rounded-xl text-left transition-all font-medium ${
                            isActive
                              ? (isDark ? 'bg-white/10 text-white shadow-sm' : 'bg-white text-black shadow-sm border border-black/5')
                              : (isDark ? 'text-zinc-400 hover:bg-white/5 hover:text-white' : 'text-zinc-600 hover:bg-black/5 hover:text-black border border-transparent')
                          }`}
                        >
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className={`${isActive ? 'text-blue-500' : ''}`}>{module.icon}</div>
                            <span className="text-xs sm:text-sm tracking-tight">{module.title}</span>
                          </div>
                          {isDone && <CheckCircle size={14} className="text-emerald-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden absolute inset-0 z-30 bg-black/60 backdrop-blur-sm"
              />
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto scroll-smooth">
            <div className="max-w-4xl mx-auto p-4 sm:p-8 md:p-12 lg:p-20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeModule}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="pb-16 sm:pb-32"
                >
                  <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    Module {activeModule + 1} of {courseModules.length}
                  </div>

                  <ScrollReveal>
                    {currentModule.content}
                  </ScrollReveal>

                  <ScrollReveal>
                    <KnowledgeCheck
                      question={currentModule.quiz.q}
                      options={currentModule.quiz.opts}
                      correctIndex={currentModule.quiz.ans}
                      onPass={() => setPassedChecks(prev => ({...prev, [currentModule.id]: true}))}
                    />
                  </ScrollReveal>

                  {/* Bottom Actions */}
                  <div className={`mt-10 sm:mt-16 pt-6 sm:pt-10 border-t flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                    <button
                      onClick={handleComplete}
                      disabled={!hasPassedCheck && !isCompleted}
                      className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-bold transition-all text-sm ${
                        isCompleted
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                          : hasPassedCheck
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20 hover:-translate-y-1'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                      }`}
                    >
                      {isCompleted ? (
                        <><Check size={18} /> Completed</>
                      ) : (
                        <><CheckCircle size={18} /> {hasPassedCheck ? 'Mark as Complete' : 'Pass Quiz to Complete'}</>
                      )}
                    </button>

                    <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
                      {activeModule > 0 && (
                        <button
                          onClick={() => { setActiveModule(prev => prev - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-full font-semibold transition-all text-sm ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5 border border-black/10'}`}
                        >
                          <ArrowLeft size={16} /> Prev
                        </button>
                      )}
                      {activeModule < courseModules.length - 1 && (
                        <button
                          onClick={() => { setActiveModule(prev => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-full font-semibold transition-all text-sm ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black text-white hover:bg-zinc-800'}`}
                        >
                          Next <ChevronRight size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* VIDEOS TAB */}
      {mainTab === "videos" && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-4 sm:p-8 md:p-12 lg:p-20">
            <ScrollReveal>
              <SectionHeader
                icon={Video}
                label="Video Lectures"
                title="Deep Dive Video Series"
                subtitle="Explore adversarial ML in trading, quantitative strategy design, and advanced security research through these curated video lectures."
              />
            </ScrollReveal>

            {/* Featured Video */}
            <ScrollReveal>
              <div className="mb-6 sm:mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-4">
                  ★ Featured Lecture
                </div>
                <VideoEmbed
                  videoId="v7Pr8SoTwDE"
                  title="Adversarial Attacks on AI Trading Models — The Silent Crash"
                />
                <div className="mt-4 p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0f0f14] border border-black/10 dark:border-white/10">
                  <h3 className="font-bold text-base sm:text-lg mb-2">Adversarial Attacks on AI Trading Models</h3>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    A comprehensive look at how Deep Reinforcement Learning agents in high-frequency trading can be secretly manipulated through data poisoning, slope-based attacks, and adversarial GANs. Discover the 5 critical vulnerability vectors that can engineer a &quot;silent crash.&quot;
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Other Videos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-10">
              <ScrollReveal delay={0.1}>
                <div>
                  <VideoEmbed
                    videoId="SKNzd4IkdbE"
                    title="Securing the ML Assembly Line — MLOps Security Deep Dive"
                  />
                  <div className="mt-3 p-4 rounded-xl bg-white dark:bg-[#0f0f14] border border-black/10 dark:border-white/10">
                    <h3 className="font-bold text-sm sm:text-base mb-1.5">Securing the ML Assembly Line</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Deep dive into MLOps security: protecting CI/CD pipelines, containerized inference environments, and the end-to-end ML lifecycle from supply chain attacks and adversarial code injection.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <div>
                  <VideoEmbed
                    videoId="kDRaMip5rz4"
                    title="Nash Equilibrium Manipulation in Multi-Agent RL"
                  />
                  <div className="mt-3 p-4 rounded-xl bg-white dark:bg-[#0f0f14] border border-black/10 dark:border-white/10">
                    <h3 className="font-bold text-sm sm:text-base mb-1.5">Nash Equilibrium Manipulation in MARL</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Exploring the geometric characterization of data poisoning attacks in multi-agent reinforcement learning, from Theory of Mind manipulation to Unique Nash Set exploitation in Markov games.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Video Quick Facts */}
            <ScrollReveal>
              <div className={`p-5 sm:p-8 rounded-2xl border ${isDark ? 'bg-[#0f0f14] border-white/10' : 'bg-white border-black/10'}`}>
                <h3 className="font-bold text-base sm:text-lg mb-4 flex items-center gap-2">
                  <BookOpen size={18} className="text-blue-500" /> What You&apos;ll Learn
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {[
                    "How DRL agents are manipulated through adversarial perturbations",
                    "Data poisoning techniques in multi-agent reinforcement learning",
                    "Slope-based attacks (GSA & LSSA) on financial time-series forecasting",
                    "GAN-generated adversarial data that evades CNN detection",
                    "Supply chain attacks on ML inference pipelines",
                    "Defensive MLOps strategies for algorithmic trading systems",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      )}

      {/* RESEARCH LIBRARY TAB */}
      {mainTab === "research" && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-4 sm:p-8 md:p-12 lg:p-20">
            <ScrollReveal>
              <SectionHeader
                icon={Library}
                label="Research Library"
                title="Research Papers & Reports"
                subtitle="Download and study the original research papers covering adversarial ML, trading security, and the MLOps pipeline."
              />
            </ScrollReveal>

            {/* Embedded PDFs */}
            <div className="space-y-6 sm:space-y-10 mb-10 sm:mb-16">
              <ScrollReveal delay={0}>
                <EmbeddedPDF
                  title="Adversarial Trading Sandbox"
                  filename="Adversarial Trading Sandbox.pdf"
                  description="Foundational research on adversarial attacks against DRL trading agents, including perturbation strategies and policy manipulation in high-frequency environments."
                  icon={ShieldAlert}
                  color="red"
                />
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <EmbeddedPDF
                  title="Adversarial Trading Sandbox (Extended)"
                  filename="Adversarial Trading Sandbox (1).pdf"
                  description="Extended analysis with additional experimental results on slope-based attacks, GAN-generated adversarial data, and advanced detection evasion techniques."
                  icon={AlertTriangle}
                  color="amber"
                />
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <EmbeddedPDF
                  title="Securing the ML Assembly Line"
                  filename="Securing the ML Assembly Line.pdf"
                  description="Comprehensive guide to MLOps security: CI/CD pipeline hardening, container security, drift detection, and supply chain vulnerability mitigation."
                  icon={Lock}
                  color="blue"
                />
              </ScrollReveal>
              <ScrollReveal delay={0.3}>
                <EmbeddedPDF
                  title="QuantAdv Platform Presentation"
                  filename="QuantAdv_Presentation.pdf"
                  description="Complete platform presentation covering the QuantAdv sandbox architecture, features, objectives, working process, and technology stack."
                  icon={Presentation}
                  color="purple"
                />
              </ScrollReveal>
              <ScrollReveal delay={0.4}>
                <EmbeddedPDF
                  title="QuantAdv FAQs"
                  filename="QuantAdv_FAQs.pdf"
                  description="Frequently asked questions about the Adversarial ML Trading Sandbox—covering algorithmic trading concepts, AI security, platform usage, and research applications."
                  icon={HelpCircle}
                  color="emerald"
                />
              </ScrollReveal>
            </div>

            {/* Executive Briefing */}
            <ScrollReveal>
              <div className={`p-5 sm:p-8 rounded-2xl border ${isDark ? 'bg-[#0f0f14] border-white/10' : 'bg-white border-black/10'} mb-10`}>
                <div className="flex items-center gap-2 mb-5 text-blue-500 font-bold text-xs uppercase tracking-widest">
                  <Globe size={14} /> Executive Briefing
                </div>
                <h3 className="text-lg sm:text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  Advancements and Vulnerabilities in AI Security
                </h3>
                <div className="space-y-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <p>
                    Critical findings from synthesized research on the security of machine learning models in high-stakes algorithmic trading, financial forecasting, and multi-agent reinforcement learning:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {[
                      { icon: Target, title: "Targeted Manipulation", desc: "Novel slope-based attacks alter temporal trends rather than just increasing error, bypassing standard detection." },
                      { icon: Layers, title: "Equilibrium Subversion", desc: "Offline data poisoning installs fictitious Nash Equilibria, forcing agents into manipulated behaviors." },
                      { icon: Bug, title: "Supply Chain Vulnerabilities", desc: "Vulnerabilities in __init__.py files allow malware-injected adversarial attacks that bypass gradient-disabling defenses." },
                      { icon: Shield, title: "The MLOps Imperative", desc: "Security must be integrated into every stage of the ML lifecycle—ingestion, training, and deployment." },
                    ].map((item, i) => (
                      <div key={i} className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                        <item.icon size={18} className="text-blue-500 mb-2" />
                        <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                        <p className="text-xs text-zinc-500">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Security Controls Table */}
            <ScrollReveal>
              <div className={`p-5 sm:p-8 rounded-2xl border ${isDark ? 'bg-[#0f0f14] border-white/10' : 'bg-white border-black/10'}`}>
                <h3 className="font-bold text-base sm:text-lg mb-4">Technical Security Controls</h3>
                <div className="overflow-x-auto -mx-2 px-2">
                  <table className="w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-black/10 dark:border-white/10">
                        <th className="text-left py-2.5 pr-3 font-bold text-zinc-500 uppercase tracking-wider text-[10px] sm:text-xs">Category</th>
                        <th className="text-left py-2.5 px-3 font-bold text-zinc-500 uppercase tracking-wider text-[10px] sm:text-xs">Technique</th>
                        <th className="text-left py-2.5 pl-3 font-bold text-zinc-500 uppercase tracking-wider text-[10px] sm:text-xs">Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="text-zinc-600 dark:text-zinc-400">
                      {[
                        ["Data Security", "Anonymization/Obfuscation", "Protecting PII or proprietary financial data during training"],
                        ["Model Protection", "Image Hardening & Signing", "Ensuring only trusted, scanned container images are used"],
                        ["Inference Security", "Encrypted Inference", "Protecting communication between client and model endpoint"],
                        ["Monitoring", "Drift Detection", "Identifying distribution changes that may indicate poisoning"],
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-black/5 dark:border-white/5">
                          <td className="py-2.5 pr-3 font-medium">{row[0]}</td>
                          <td className="py-2.5 px-3">{row[1]}</td>
                          <td className="py-2.5 pl-3 text-zinc-500">{row[2]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      )}

      {/* STUDY GUIDE TAB */}
      {mainTab === "study-guide" && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 sm:p-8 md:p-12 lg:p-20">
            <ScrollReveal>
              <SectionHeader
                icon={BookMarked}
                label="Study Guide"
                title="Comprehensive Study Guide"
                subtitle="Test your knowledge with quizzes, essay prompts, and a complete glossary covering adversarial manipulation in ML and algorithmic trading."
              />
            </ScrollReveal>

            {/* Short-Answer Quiz */}
            <ScrollReveal>
              <div className="mb-6 sm:mb-10">
                <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 text-sm font-bold">I</span>
                  Short-Answer Quiz
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    { q: "What is the \"Unique Nash\" (UN) set in the context of MARL data poisoning?", a: "The Unique Nash (UN) set is the collection of games/Q functions where a specific target joint policy serves as the unique Nash equilibrium. An attacker's goal is to poison the dataset until all plausible games perceived by the agents are pushed inside this set." },
                    { q: "Describe the primary difference between the General Slope Attack (GSA) and the Least-Squares Slope Attack (LSSA).", a: "GSA focuses on manipulating the endpoints of a time-series prediction to simulate sudden surges/declines. LSSA uses a line-of-best-fit calculation to alter the overall trend of the forecast, making it more effective for manipulating long-term predictions." },
                    { q: "What are the three core components of a Machine Learning (ML) system?", a: "Algorithms (mathematical models that process data), Training Data (datasets used to teach the model), and Learning Paradigms (training approach such as supervised or reinforcement learning)." },
                    { q: "Explain the \"Theory of Mind\" (ToM) concept as it applies to an attacker's strategy in MARL.", a: "ToM represents the attacker's belief about the victim's learning algorithm. It defines the set of plausible rewards/Q functions the victim might estimate from the poisoned dataset, allowing the attacker to strategically move that set into the Unique Nash set." },
                    { q: "How does the N-HiTS model improve forecasting accuracy?", a: "N-HiTS samples time-series data at different rates and uses MLPs to estimate coefficients for backcasts and forecasts. It utilizes MaxPool layers to focus on low-frequency, large-scale contents." },
                    { q: "What is \"Data Poisoning\" in an MLOps pipeline?", a: "Data poisoning occurs when an attacker introduces malicious data into the training pipeline, compromising the learning process and leading the model to identify incorrect patterns or make inaccurate predictions." },
                    { q: "Describe the roles of the Generator and Discriminator in an A-GAN.", a: "The Generator creates believable synthetic data that mimics real data distribution to fool a target model. The Discriminator attempts to distinguish between real and synthetic data, forcing the Generator to improve realism." },
                    { q: "What is a \"Model Inference Attack\"?", a: "Model Inference Attacks occur during inference when adversaries extract sensitive information from model outputs. Techniques like model inversion can reveal whether specific information was used to train the model." },
                    { q: "How can \"Trojan Malware\" exploit the ML model interface?", a: "Trojan Malware can be injected into model libraries (e.g., __init__.py) to run adversarial code during every prediction call, bypassing security filters and removing gradient-disabling protections." },
                    { q: "What is \"Adversarial Training\" and why might it be difficult to implement?", a: "Adversarial training includes adversarial examples in the training set to improve robustness. It's difficult for models like N-HiTS with rolling windows and complex feature dependencies because generating adversarial data may be computationally infeasible." },
                  ].map((item, i) => (
                    <CollapsibleSection key={i} title={`${i + 1}. ${item.q}`}>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{item.a}</p>
                    </CollapsibleSection>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Essay Questions */}
            <ScrollReveal>
              <div className="mb-6 sm:mb-10">
                <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 text-sm font-bold">II</span>
                  Essay Format Questions
                </h3>
                <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${isDark ? 'bg-[#0f0f14] border-white/10' : 'bg-white border-black/10'}`}>
                  {[
                    "Analyzing the Threat Model of Deep Algorithmic Trading: Discuss how DRL agents in financial markets are susceptible to policy manipulation through adversarial perturbation vectors.",
                    "The MLOps Security Lifecycle: Evaluate the necessity of \"Security by Design\" and describe how security controls can be embedded into data ingestion, model training, and deployment.",
                    "Geometric Characterization of MARL Attacks: Explain the relationship between the \"Unique Nash set\" and the \"Theory of Mind\" in executing an optimal data poisoning attack.",
                    "Slope-Based Targeted Manipulations: Compare the effectiveness of GSA and LSSA in bypassing human and machine detection while altering temporal characteristics of financial forecasts.",
                    "Security Risks in Distributed Architectures: Contrast monolithic, microservices, and serverless MLOps architectures, focusing on granular access control and failure isolation.",
                  ].map((q, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 sm:p-4 bg-black/[0.02] dark:bg-white/[0.02] rounded-xl">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 text-xs font-bold">{i + 1}</span>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Glossary */}
            <ScrollReveal>
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-sm font-bold">III</span>
                  Glossary of Key Terms
                </h3>
                <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#0f0f14] border-white/10' : 'bg-white border-black/10'}`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className={`${isDark ? 'bg-white/5' : 'bg-black/[0.02]'}`}>
                          <th className="text-left py-3 px-4 sm:px-5 font-bold text-zinc-500 uppercase tracking-wider text-[10px] sm:text-xs w-1/3 sm:w-1/4">Term</th>
                          <th className="text-left py-3 px-4 sm:px-5 font-bold text-zinc-500 uppercase tracking-wider text-[10px] sm:text-xs">Definition</th>
                        </tr>
                      </thead>
                      <tbody className="text-zinc-600 dark:text-zinc-400">
                        {[
                          ["Adversarial Attack", "A method of modifying a model's input to cause it to produce an incorrect result."],
                          ["Adversarial Perturbation", "Strategically induced changes in input vectors, often undetectable by humans."],
                          ["Algorithmic Trading", "The use of intelligent agents to automate financial decision-making."],
                          ["Black-Box Attack", "An attack where the adversary has no knowledge of the model's internal structure."],
                          ["Concept Drift", "A change in the model's output quality over time."],
                          ["Data Poisoning", "An offline attack where the training dataset is modified to install a fictitious equilibrium."],
                          ["Deep Reinforcement Learning", "A subset of ML that maps high-dimensional observations into optimal decisions."],
                          ["DQN (Deep Q-Network)", "A type of DRL agent often used as a benchmark for evaluating trading policies."],
                          ["L1 Cost Function", "A function measuring attack cost by summing absolute differences between original and poisoned data."],
                          ["Markov Perfect Equilibrium", "A policy where the action profile in every stage game is a Nash equilibrium."],
                          ["MLOps", "Practices combining ML, DevOps, and data engineering to automate and secure the ML lifecycle."],
                          ["Nash Equilibrium", "A strategy profile where no player can benefit by changing their strategy alone."],
                          ["Q Function", "A function estimating expected rewards for taking a specific action in a given state."],
                          ["Theory of Mind (ToM)", "The attacker's model regarding the victim's learning algorithm and plausible games."],
                          ["Unique Nash Set", "The set of reward/Q functions where a specific target policy is the only Nash equilibrium."],
                          ["White-Box Attack", "An attack where the adversary has full access to the model's structure and gradients."],
                          ["Zero-Sum Game", "A situation where each participant's gain is balanced by the losses of other participants."],
                        ].map((row, i) => (
                          <tr key={i} className="border-t border-black/5 dark:border-white/5">
                            <td className="py-2.5 px-4 sm:px-5 font-semibold text-xs sm:text-sm">{row[0]}</td>
                            <td className="py-2.5 px-4 sm:px-5 text-xs sm:text-sm">{row[1]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      )}

      {/* ═══ Mobile Bottom Navigation ═══ */}
      <nav className={`sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t ${isDark ? 'bg-[#0a0a0f]/95 border-white/10 backdrop-blur-2xl' : 'bg-white/95 border-black/10 backdrop-blur-2xl'}`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-stretch">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = mainTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setMainTab(tab.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2 pt-2.5 transition-colors min-h-[56px] ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : isDark ? 'text-zinc-500 active:text-zinc-300' : 'text-zinc-400 active:text-zinc-600'
                }`}
              >
                {/* Active indicator pill */}
                {isActive && (
                  <motion.div
                    layoutId="mobileNavPill"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[3px] rounded-b-full bg-blue-600 dark:bg-blue-400"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <TabIcon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`text-[10px] leading-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {tab.mobileLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom spacer for mobile nav */}
      <div className="sm:hidden h-16" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
    </div>
  );
}
