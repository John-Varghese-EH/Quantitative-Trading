"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RiskDisclaimerPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#050505] text-zinc-300' : 'bg-[#fafafa] text-zinc-600'} selection:bg-white/20 selection:text-white pt-24 pb-20`}>
      <div className="max-w-[800px] mx-auto px-6 sm:px-8">
        <Link href="/" className={`inline-flex items-center gap-2 mb-12 text-sm font-medium transition-colors ${isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-500 hover:text-black'}`}>
          <ArrowLeft size={16} />
          Back to Home
        </Link>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className={`text-4xl md:text-5xl font-bold mb-6 tracking-tight ${isDark ? 'text-white' : 'text-black'}`} style={{ fontFamily: 'var(--font-heading)' }}>
            Risk Disclaimer
          </h1>
          <p className="text-sm mb-12 opacity-60">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-10 prose prose-zinc dark:prose-invert max-w-none">
            <section>
              <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>1. High Risk Investment Warning</h2>
              <p>
                Trading foreign exchange, cryptocurrencies, equities, and other financial instruments on margin carries a high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite.
              </p>
              <p className="mt-4 font-semibold text-red-500 dark:text-red-400">
                You could sustain a loss of some or all of your initial investment and should not invest money that you cannot afford to lose.
              </p>
            </section>
            
            <section>
              <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>2. Algorithmic Trading Risks</h2>
              <p>
                QuantAdv provides tools for developing and executing algorithmic trading strategies. You are solely responsible for the logic, execution, and monitoring of any algorithms you deploy. Algorithmic trading carries specific risks, including but not limited to:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li><strong>Software Failures:</strong> Bugs or errors in your code may result in unintended trading behavior.</li>
                <li><strong>Connectivity Issues:</strong> Disruptions in internet connectivity or exchange APIs may prevent orders from being executed or canceled.</li>
                <li><strong>Market Volatility:</strong> Sudden market movements can result in slippage, where orders are executed at prices significantly different from expected.</li>
                <li><strong>Backtesting Bias:</strong> Historical performance (backtesting) is strictly not indicative of future results. Strategies that perform well on historical data may fail in live markets due to overfitting, changing market conditions, or unforeseen events.</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>3. No Financial Advice</h2>
              <p>
                Any opinions, news, research, analyses, prices, or other information contained on this website or provided by the QuantAdv platform are provided as general market commentary and do not constitute investment advice. QuantAdv will not accept liability for any loss or damage, including without limitation to, any loss of profit, which may arise directly or indirectly from use of or reliance on such information.
              </p>
            </section>
            
            <section>
              <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>4. Open Source Disclaimer</h2>
              <p>
                The QuantAdv platform is provided "as is", without warranty of any kind, express or implied. Under no circumstances will the authors or copyright holders be liable for any claim, damages, or other liability, whether in an action of contract, tort or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
