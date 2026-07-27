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


import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-sm mb-12 opacity-60">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-10 prose prose-zinc dark:prose-invert max-w-none">
            <section>
              <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>1. Introduction</h2>
              <p>
                At QuantAdv, we respect your privacy and are committed to protecting it through our compliance with this policy. This Privacy Policy describes the types of information we may collect from you or that you may provide when you visit the QuantAdv platform and our practices for collecting, using, maintaining, protecting, and disclosing that information.
              </p>
            </section>
            
            <section>
              <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>2. Information We Collect</h2>
              <p>
                We may collect several types of information from and about users of our Platform, including:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li><strong>Personal Data:</strong> Email address, name, and authentication credentials when you create an account.</li>
                <li><strong>Usage Data:</strong> Information about your internet connection, the equipment you use to access our Platform, and usage details.</li>
                <li><strong>Trading Data:</strong> Algorithms, backtesting history, configurations, and API keys which are stored securely and encrypted.</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>3. How We Use Your Information</h2>
              <p>
                We use information that we collect about you or that you provide to us, including any personal information:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>To present our Platform and its contents to you.</li>
                <li>To provide you with information, products, or services that you request from us.</li>
                <li>To fulfill any other purpose for which you provide it.</li>
                <li>To carry out our obligations and enforce our rights arising from any contracts entered into between you and us.</li>
                <li>To notify you about changes to our Platform or any products or services we offer.</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>4. Data Security</h2>
              <p>
                We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. All information you provide to us is stored on our secure servers behind firewalls. API keys and sensitive trading infrastructure credentials are encrypted at rest using industry-standard encryption protocols.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>5. Open Source Disclosures</h2>
              <p>
                While the QuantAdv platform is open-source under the AGPLv3 license, any cloud-hosted versions of the service operated by us will handle your personal data in accordance with this Privacy Policy. Self-hosted deployments of QuantAdv are solely the responsibility of the operator of that deployment regarding data privacy and security.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
