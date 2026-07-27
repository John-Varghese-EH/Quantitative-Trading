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

import { motion } from 'framer-motion'
import { FlaskConical, Play } from 'lucide-react'
import NextLink from 'next/link'

const SANDBOX_STEPS = [
  { step: 1, title: 'Fetch Market Data', desc: 'Select a stock or crypto and date range', link: '/market', color: '#00d4ff', icon: '📈' },
  { step: 2, title: 'Train AI Model', desc: 'Choose from 5 ML architectures', link: '/ai-prediction', color: '#7c3aed', icon: '🧠' },
  { step: 3, title: 'Backtest Strategy', desc: 'Test your strategy on historical data', link: '/trading', color: '#10b981', icon: '💹' },
  { step: 4, title: 'Launch Attack', desc: 'Simulate adversarial attacks on your model', link: '/adversarial', color: '#ef4444', icon: '⚔️' },
  { step: 5, title: 'Apply Defense', desc: 'Harden the model against attacks', link: '/defense', color: '#f59e0b', icon: '🛡️' },
  { step: 6, title: 'Analyze Results', desc: 'Review performance with explainable AI', link: '/analytics', color: '#06b6d4', icon: '📊' },
]

export default function SandboxPage() {
  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 32 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: '1.8rem', fontWeight: 800 }}>
          <FlaskConical size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} color="var(--color-primary)" />
          Sandbox <span className="gradient-text">Environment</span>
        </h1>
        <p style={{ color: 'var(--color-muted)', margin: 0 }}>
          Complete risk-free ML trading research environment — no real money, no limits.
        </p>
      </motion.div>

      {/* Warning Banner */}
      <div style={{
        padding: '16px 20px', marginBottom: 32, borderRadius: 12,
        background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontSize: '1.5rem' }}>⚠️</span>
        <div>
          <div style={{ fontWeight: 700, color: '#f59e0b' }}>Paper Trading Mode — No Real Money</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: 2 }}>
            All trades, models, and attacks in this sandbox are simulated. This is a research and educational environment.
          </div>
        </div>
      </div>

      {/* Workflow Steps */}
      <h2 style={{ margin: '0 0 20px', fontWeight: 700, fontSize: '1.2rem' }}>🔄 ML Trading Workflow</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 40 }}>
        {SANDBOX_STEPS.map((s, i) => (
          <motion.div
            key={s.step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <NextLink href={s.link} style={{ textDecoration: 'none' }}>
              <motion.div
                className="glass"
                whileHover={{ scale: 1.03, boxShadow: `0 20px 60px ${s.color}25` }}
                style={{ padding: 24, cursor: 'pointer', borderTop: `3px solid ${s.color}` }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, fontSize: '1.5rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${s.color}18`, border: `1px solid ${s.color}33`,
                  }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: s.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      STEP {s.step}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{s.title}</div>
                  </div>
                </div>
                <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.88rem' }}>{s.desc}</p>
                <div style={{ marginTop: 14, color: s.color, fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Go to {s.title} →
                </div>
              </motion.div>
            </NextLink>
          </motion.div>
        ))}
      </div>

      {/* Workflow Diagram */}
      <div className="glass" style={{ padding: 28 }}>
        <h3 style={{ margin: '0 0 20px', fontWeight: 700 }}>Complete Workflow Diagram</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          {['Data Collection', 'Feature Engineering', 'Model Training', 'Prediction', 'Strategy Backtest', 'Adversarial Attack', 'Defense', 'Evaluation'].map((step, i, arr) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                padding: '8px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
                background: `hsl(${195 + i * 18}, 70%, 20%)`,
                border: `1px solid hsl(${195 + i * 18}, 70%, 40%)`,
                color: `hsl(${195 + i * 18}, 80%, 70%)`,
                whiteSpace: 'nowrap',
              }}>{step}</div>
              {i < arr.length - 1 && <span style={{ color: 'var(--color-muted)', fontWeight: 700 }}>→</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
