"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-sm mb-12 opacity-60">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-10 prose prose-zinc dark:prose-invert max-w-none">
            <section>
              <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>1. Acceptance of Terms</h2>
              <p>
                By accessing and using QuantAdv ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you must not access or use the Platform. The Platform provides tools for quantitative backtesting, strategy development, and automated trading. 
              </p>
            </section>
            
            <section>
              <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>2. License and Open Source</h2>
              <p>
                QuantAdv is open-source software distributed under the <strong>GNU Affero General Public License v3.0 (AGPLv3)</strong>. You are free to use, modify, and distribute the software in accordance with the AGPLv3. However, if you modify the software and make it available over a network (like a SaaS), you must provide the source code of your modified version to your users.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>3. Use of the Platform</h2>
              <p>
                You agree to use the Platform only for lawful purposes. You are solely responsible for all trading logic, algorithms, and automated processes executed through your account. QuantAdv does not provide financial advice. You acknowledge that algorithmic trading carries a high level of risk and may result in substantial financial loss.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>4. API and Rate Limiting</h2>
              <p>
                You may access the Platform via our API. You agree not to abuse or excessively request data from the API in a manner that degrades the performance of the Platform for others. We reserve the right to throttle, limit, or block access to the API if we detect malicious or abusive patterns.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>5. Limitation of Liability</h2>
              <p>
                IN NO EVENT SHALL QUANTADV OR ITS CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, PROFITS, OR FINANCIAL LOSSES) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>6. Termination</h2>
              <p>
                We reserve the right to terminate or suspend your account and access to the Platform immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
