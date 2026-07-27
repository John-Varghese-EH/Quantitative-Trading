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

import { useState } from 'react'
import NextLink from 'next/link'
import { motion } from 'framer-motion'
import { Zap, ArrowLeft } from 'lucide-react'
import api from '@/services/api'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
      toast.success('Reset link sent if email exists')
    } catch {
      toast.error('Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      backgroundImage: `radial-gradient(ellipse at 50% 50%, rgba(124, 58, 237, 0.1) 0%, transparent 60%)` }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 420 }}>
        <div className="glass" style={{ padding: 36 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 52, height: 52, margin: '0 auto 14px', background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 25px rgba(0,212,255,0.35)' }}>
              <Zap size={24} color="#fff" />
            </div>
            <h2 style={{ margin: 0, fontWeight: 700 }}>Reset Password</h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginTop: 6 }}>Enter your email to receive a reset link</p>
          </div>

          {sent ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>📧</div>
              <p style={{ color: 'var(--color-success)' }}>Reset email sent! Check your inbox.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--color-muted)', display: 'block', marginBottom: 5 }}>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required />
              </div>
              <motion.button type="submit" className="btn-primary" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ padding: '13px', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Sending…' : 'Send Reset NextLink'}
              </motion.button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <NextLink href="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ArrowLeft size={14} /> Back to Login
            </NextLink>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
