"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CookiePolicyPage() {
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
            Cookie Policy
          </h1>
          <p className="text-sm mb-12 opacity-60">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-10 prose prose-zinc dark:prose-invert max-w-none">
            <section>
              <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>1. What are Cookies?</h2>
              <p>
                Cookies are small pieces of text sent by your web browser by a website you visit. A cookie file is stored in your web browser and allows the Platform or a third party to recognize you and make your next visit easier and the Platform more useful to you.
              </p>
            </section>
            
            <section>
              <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>2. How QuantAdv Uses Cookies</h2>
              <p>
                When you use and access the Platform, we may place a number of cookies files in your web browser. We use cookies for the following purposes:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li><strong>Essential Cookies:</strong> To authenticate users and prevent fraudulent use of user accounts. These are required for the operation of the trading dashboard.</li>
                <li><strong>Preferences Cookies:</strong> To remember information that changes the way the Platform behaves or looks, such as your UI theme (dark or light mode) or your preferred language.</li>
                <li><strong>Analytics Cookies:</strong> To track information how the Platform is used so that we can make improvements. We may also use analytics cookies to test new pages, features, or new functionality of the Platform to see how our users react to them.</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>3. Your Choices Regarding Cookies</h2>
              <p>
                If you'd like to delete cookies or instruct your web browser to delete or refuse cookies, please visit the help pages of your web browser. Please note, however, that if you delete cookies or refuse to accept them, you might not be able to use all of the features we offer, you may not be able to store your preferences, and some of our pages might not display properly.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
