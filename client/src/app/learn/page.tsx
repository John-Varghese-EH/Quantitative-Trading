"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronRight, CheckCircle, ArrowLeft, Terminal, Activity, BrainCircuit, Check, Menu, X, Play, TrendingUp, ShieldAlert, BarChart2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine } from "recharts";

// --- Modern Web Guidance: Scroll Entry Effects ---
// Feature-detects native CSS scroll-driven animations. Falls back to Framer Motion's Intersection Observer for Safari/Firefox.
const ScrollReveal = ({ children }: { children: React.ReactNode }) => {
  const [isNativeSupported, setIsNativeSupported] = useState(true);

  useEffect(() => {
    if (typeof CSS !== 'undefined' && !CSS.supports('(animation-timeline: view()) and (animation-range: entry)')) {
      setIsNativeSupported(false);
    }
  }, []);

  if (isNativeSupported) {
    // Uses the .scroll-reveal CSS class defined in index.css (zero JS overhead)
    return <div className="scroll-reveal">{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

// --- Interactive Components ---

// 1. Order Book Simulation
const InteractiveOrderBook = () => {
  const [bids, setBids] = useState([ { price: 150.01, size: 400 }, { price: 150.00, size: 1200 }, { price: 149.98, size: 300 } ]);
  const [asks, setAsks] = useState([ { price: 150.03, size: 500 }, { price: 150.04, size: 800 }, { price: 150.05, size: 200 } ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBids(prev => prev.map(b => ({ ...b, size: Math.max(100, b.size + (Math.random() > 0.5 ? 50 : -50)) })));
      setAsks(prev => prev.map(a => ({ ...a, size: Math.max(100, a.size + (Math.random() > 0.5 ? 50 : -50)) })));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 rounded-xl bg-black dark:bg-[#0a0a0a] text-white font-mono text-sm border border-black/10 dark:border-white/10 shadow-xl">
      <div className="flex justify-between mb-4 text-xs text-zinc-500 uppercase tracking-wider font-bold">
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
        <div className="py-2 flex justify-between text-zinc-400 items-center text-xs">
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
    // Mean reversion force
    spread -= spread * 0.1;
    return { time: i, spread, upper: 2, lower: -2 };
  });
};

const MeanReversionChart = () => {
  const data = React.useMemo(() => generateSpreadData(), []);
  return (
    <div className="h-64 w-full p-4 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] shadow-inner">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <YAxis domain={[-4, 4]} hide />
          <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '8px', color: '#fff' }} />
          <ReferenceLine y={2} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Short Threshold', fill: '#ef4444', fontSize: 10 }} />
          <ReferenceLine y={-2} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'insideBottomLeft', value: 'Long Threshold', fill: '#10b981', fontSize: 10 }} />
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
      <div className="bg-zinc-100 dark:bg-zinc-900 border-b border-black/10 dark:border-white/10 px-4 py-3 flex justify-between items-center">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <button 
          onClick={runBacktest}
          disabled={state !== 'idle'}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow transition-colors disabled:opacity-50"
        >
          <Play size={12} fill="currentColor" /> {state === 'idle' ? 'Run Backtest' : state === 'running' ? 'Running...' : 'Completed'}
        </button>
      </div>
      <div className="p-4 bg-[#fafafa] dark:bg-[#050505] font-mono text-sm h-64 overflow-y-auto flex flex-col">
        {state === 'idle' && (
          <code className="text-zinc-800 dark:text-zinc-300">
            <span className="text-pink-600 dark:text-pink-400">from</span> models.ensemble <span className="text-pink-600 dark:text-pink-400">import</span> RandomForestAlpha<br/>
            <span className="text-pink-600 dark:text-pink-400">from</span> quantadv.backtest <span className="text-pink-600 dark:text-pink-400">import</span> Engine<br/><br/>
            model = RandomForestAlpha(trees=500, max_depth=6)<br/>
            engine = Engine(model, start=<span className="text-amber-600 dark:text-amber-300">"2020-01-01"</span>, end=<span className="text-amber-600 dark:text-amber-300">"2024-01-01"</span>)<br/><br/>
            <span className="text-emerald-600 dark:text-emerald-400"># Click 'Run Backtest' to execute</span><br/>
            engine.run()
          </code>
        )}
        {state !== 'idle' && (
          <div className="text-zinc-500 text-xs space-y-1 mb-4">
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
const KnowledgeCheck = ({ question, options, correctIndex, onPass }: { question: string, options: string[], correctIndex: number, onPass: () => void }) => {
  const [selected, setSelected] = useState<number | null>(null);
  
  const handleSelect = (idx: number) => {
    setSelected(idx);
    if (idx === correctIndex) onPass();
  };

  return (
    <div className="mt-12 p-6 md:p-8 border border-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl">
      <div className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider text-xs">
        <CheckCircle size={16} /> Knowledge Check
      </div>
      <h4 className="text-lg font-semibold mb-6">{question}</h4>
      <div className="space-y-3">
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
              className={`w-full text-left p-4 rounded-xl border transition-all ${style}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
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
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-8" style={{ fontFamily: 'var(--font-heading)' }}>Market Microstructure</h1>
        <p className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
          To build a quantitative system, you must first understand the absolute foundation of markets: the Limit Order Book (LOB).
        </p>
        <p className="text-zinc-600 dark:text-zinc-400">
          The price you see on Yahoo Finance or TV is an illusion. There is no single "price". There is only the <strong>Bid</strong> (the highest price a buyer is willing to pay) and the <strong>Ask</strong> (the lowest price a seller is willing to accept).
        </p>
        
        <div className="my-8">
          <InteractiveOrderBook />
          <p className="text-xs text-center mt-3 text-zinc-500 uppercase tracking-widest font-semibold">Live Order Book Simulation</p>
        </div>

        <h3 className="text-2xl font-bold mt-8">The Spread and Liquidity</h3>
        <p className="text-zinc-600 dark:text-zinc-400">
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
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-8" style={{ fontFamily: 'var(--font-heading)' }}>Statistical Arbitrage</h1>
        <p className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
          Statistical Arbitrage (StatArb) is a class of short-term financial trading strategies that employ mean reversion models involving large diversified portfolios of securities.
        </p>

        <div className="p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <h3 className="text-xl font-semibold mb-3">Pairs Trading (Cointegration)</h3>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            Imagine two highly correlated companies, like Coca-Cola and Pepsi. If Coca-Cola's stock suddenly shoots up while Pepsi's stays flat, the historical relationship (spread) between them has widened. A quant will short Coca-Cola and buy Pepsi, betting the spread will <strong>revert to the mean</strong>.
          </p>
          <MeanReversionChart />
        </div>
        
        <p className="text-zinc-600 dark:text-zinc-400">
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
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-8" style={{ fontFamily: 'var(--font-heading)' }}>Machine Learning in Trading</h1>
        <p className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
          The holy grail of modern quant finance is training algorithms to discover non-linear predictive relationships (Alpha) in massive datasets.
        </p>

        <InteractiveCodeRunner />

        <h3 className="text-2xl font-bold mt-10">The Danger of Overfitting</h3>
        <p className="text-zinc-600 dark:text-zinc-400">
          Financial data has an incredibly low signal-to-noise ratio. If you train a deep neural network on pure price data, it will almost certainly overfit to the noise. The model will look like a money-printer in backtests but lose money rapidly in live trading.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <div className="p-5 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl">
            <h4 className="font-bold text-red-700 dark:text-red-400 mb-2">Lookahead Bias</h4>
            <p className="text-sm text-red-600 dark:text-red-300">Accidentally using information from the future (like closing price) to predict today's trades.</p>
          </div>
          <div className="p-5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl">
            <h4 className="font-bold text-amber-700 dark:text-amber-400 mb-2">Survivorship Bias</h4>
            <p className="text-sm text-amber-600 dark:text-amber-300">Testing only on companies that exist today, ignoring the bankrupt ones that were present in the past.</p>
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
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-8" style={{ fontFamily: 'var(--font-heading)' }}>Risk Management</h1>
        <p className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
          A mediocre strategy with exceptional risk management will survive. An exceptional strategy with poor risk management will blow up.
        </p>

        <div className="p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <h3 className="text-xl font-semibold mb-3">The Kelly Criterion</h3>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            The Kelly formula tells you exactly what percentage of your capital to risk on a single trade to maximize long-term compounding growth. 
            <br/><br/>
            <code>f* = p - (q / b)</code>
            <br/><br/>
            Where <code>p</code> is win probability, <code>q</code> is loss probability, and <code>b</code> is the odds (win/loss size ratio).
          </p>
          <div className="p-4 bg-white dark:bg-[#0a0a0a] rounded-xl border border-black/10 dark:border-white/10">
            <div className="flex justify-between items-end mb-4">
              <div className="w-1/3 text-center">
                <div className="h-12 w-full bg-red-400 rounded-t-sm" />
                <div className="text-xs mt-2 font-bold uppercase">Over-betting<br/>(Ruin)</div>
              </div>
              <div className="w-1/3 text-center">
                <div className="h-32 w-full bg-emerald-500 rounded-t-sm relative">
                  <div className="absolute -top-6 inset-x-0 text-emerald-600 dark:text-emerald-400 font-bold text-xs">Optimal (f*)</div>
                </div>
                <div className="text-xs mt-2 font-bold uppercase">Max Growth</div>
              </div>
              <div className="w-1/3 text-center">
                <div className="h-16 w-full bg-blue-400 rounded-t-sm" />
                <div className="text-xs mt-2 font-bold uppercase">Under-betting<br/>(Safe)</div>
              </div>
            </div>
            <p className="text-xs text-center text-zinc-500">Betting more than the optimal Kelly fraction guarantees long-term ruin, even with an edge.</p>
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
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-8" style={{ fontFamily: 'var(--font-heading)' }}>Algorithmic Execution</h1>
        <p className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
          Generating a profitable signal is only half the battle. If your execution is poor, slippage and market impact will eat all your theoretical profits.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 my-8">
          <div className="p-6 rounded-2xl bg-[#0a0a0a] text-white border border-white/10 shadow-xl">
            <h3 className="font-bold mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> TWAP (Time-Weighted Average Price)</h3>
            <p className="text-sm text-zinc-400">Slices a large order into smaller chunks and executes them evenly over a specified time period to minimize market impact.</p>
          </div>
          <div className="p-6 rounded-2xl bg-[#0a0a0a] text-white border border-white/10 shadow-xl">
            <h3 className="font-bold mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500" /> VWAP (Volume-Weighted Average Price)</h3>
            <p className="text-sm text-zinc-400">Executes orders proportionally to historical volume profiles. Higher execution volume at the open/close, lower at mid-day.</p>
          </div>
        </div>
        
        <h3 className="text-2xl font-bold mt-8">Slippage</h3>
        <p className="text-zinc-600 dark:text-zinc-400">
          Slippage occurs when the price of an asset changes between the time your algorithm decides to trade and the time the exchange matching engine actually executes your order. In high-frequency strategies, 1 millisecond of latency can turn a profitable strategy into a massive loser.
        </p>
      </div>
    ),
    quiz: {
      q: "If you need to buy 100,000 shares but want to avoid spiking the price, which execution algorithm should you use?",
      opts: ["Market Order (All at once)", "TWAP or VWAP (Slicing the order)", "Limit Order far above the current price", "Stop-loss Order"],
      ans: 1
    }
  }
];

export default function LearnPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeModule, setActiveModule] = useState(0);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Knowledge check state per module
  const [passedChecks, setPassedChecks] = useState<Record<string, boolean>>({});

  const currentModule = courseModules[activeModule];
  const isCompleted = completedModules.includes(currentModule.id);
  const hasPassedCheck = passedChecks[currentModule.id];
  const progress = (completedModules.length / courseModules.length) * 100;

  const handleComplete = () => {
    if (!hasPassedCheck && !isCompleted) return; // Must pass quiz first
    
    if (isCompleted) {
      // Allow un-completing for flexibility, though unusual for LMS
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

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-[#050505] text-white' : 'bg-[#fafafa] text-black'}`}>
      {/* Top Navbar */}
      <div className={`h-16 flex items-center justify-between px-4 sm:px-8 border-b z-50 sticky top-0 ${isDark ? 'bg-[#050505]/80 border-white/10 backdrop-blur-xl' : 'bg-white/80 border-black/10 backdrop-blur-xl'}`}>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`md:hidden p-2 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
            <Menu size={20} />
          </button>
          <Link href="/" className={`hidden sm:flex items-center gap-2 text-sm font-bold transition-colors ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'}`}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className="sm:hidden font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>QuantAdv Academy</div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Course Progress</span>
            <span className="text-sm font-bold">{Math.round(progress)}% Complete</span>
          </div>
          <div className={`w-24 sm:w-40 h-2.5 rounded-full overflow-hidden shadow-inner ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Navigation */}
        <AnimatePresence>
          {(isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
            <motion.div 
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`absolute md:relative z-40 w-72 h-[calc(100vh-4rem)] border-r flex flex-col shadow-2xl md:shadow-none ${isDark ? 'bg-[#0a0a0a] border-white/10' : 'bg-[#f8f9fa] border-black/10'}`}
            >
              <div className="p-6 overflow-y-auto h-full">
                <h2 className="text-sm font-bold uppercase tracking-widest mb-6 text-zinc-500">Syllabus</h2>
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
                        className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left transition-all font-medium ${
                          isActive 
                            ? (isDark ? 'bg-white/10 text-white shadow-sm' : 'bg-white text-black shadow-sm border border-black/5') 
                            : (isDark ? 'text-zinc-400 hover:bg-white/5 hover:text-white' : 'text-zinc-600 hover:bg-black/5 hover:text-black border border-transparent')
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`${isActive ? 'text-blue-500' : ''}`}>{module.icon}</div>
                          <span className="text-sm tracking-tight">{module.title}</span>
                        </div>
                        {isDone && <CheckCircle size={16} className="text-emerald-500" />}
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
          <div className="max-w-4xl mx-auto p-6 sm:p-12 lg:p-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="pb-32"
              >
                <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-blue-500/10 text-blue-500 border border-blue-500/20">
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
                <div className={`mt-16 pt-10 border-t flex flex-col sm:flex-row items-center justify-between gap-6 ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                  <button 
                    onClick={handleComplete}
                    disabled={!hasPassedCheck && !isCompleted}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold transition-all ${
                      isCompleted 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20' 
                        : hasPassedCheck
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20 hover:-translate-y-1'
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    {isCompleted ? (
                      <><Check size={20} /> Completed</>
                    ) : (
                      <><CheckCircle size={20} /> {hasPassedCheck ? 'Mark as Complete' : 'Pass Quiz to Complete'}</>
                    )}
                  </button>

                  <div className="flex gap-4 w-full sm:w-auto">
                    {activeModule > 0 && (
                      <button 
                        onClick={() => { setActiveModule(prev => prev - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5 border border-black/10'}`}
                      >
                        <ArrowLeft size={18} /> Prev
                      </button>
                    )}
                    {activeModule < courseModules.length - 1 && (
                      <button 
                        onClick={() => { setActiveModule(prev => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black text-white hover:bg-zinc-800'}`}
                      >
                        Next <ChevronRight size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
