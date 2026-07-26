"use client";
import { useState } from 'react'
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Zap, Eye, EyeOff, TrendingUp } from 'lucide-react'
import api from '@/services/api'
import { useAppStore } from '@/store/useAppStore'
import toast from 'react-hot-toast'

const schema = z.object({
  username: z.string().min(1, 'Required'),
  password: z.string().min(1, 'Required'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAppStore()
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const form = new URLSearchParams()
      form.append('username', data.username)
      form.append('password', data.password)
      const res = await api.post('/auth/login', form, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
      setAuth(res.data.user, res.data.access_token, res.data.refresh_token)
      toast.success(`Welcome back, ${res.data.user.username}!`)
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--color-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      backgroundImage: `radial-gradient(ellipse at 20% 50%, rgba(124, 58, 237, 0.15) 0%, transparent 60%),
                        radial-gradient(ellipse at 80% 50%, rgba(0, 212, 255, 0.1) 0%, transparent 60%)`,
    }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
            borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(0,212,255,0.4)',
          }}>
            <Zap size={32} color="#fff" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px' }} className="gradient-text">QuantAdv</h1>
          <p style={{ color: 'var(--color-muted)', margin: 0 }}>Adversarial ML Trading Sandbox</p>
        </div>

        {/* Card */}
        <div className="glass" style={{ padding: 32 }}>
          <h2 style={{ margin: '0 0 24px', fontWeight: 700, fontSize: '1.25rem' }}>Sign In</h2>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--color-muted)', display: 'block', marginBottom: 6 }}>
                Email or Username
              </label>
              <input {...register('username')} className="input-field" placeholder="admin@quantadv.io" />
              {errors.username && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{errors.username.message}</span>}
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--color-muted)', display: 'block', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="••••••••"
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)',
                }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{errors.password.message}</span>}
            </div>

            <div style={{ textAlign: 'right' }}>
              <NextLink href="/forgot-password" style={{ fontSize: '0.83rem', color: 'var(--color-primary)', textDecoration: 'none' }}>
                Forgot password?
              </NextLink>
            </div>

            <motion.button
              type="submit"
              className="btn-primary"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ padding: '14px', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </motion.button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem', color: 'var(--color-muted)' }}>
            No account?{' '}
            <NextLink href="/register" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
              Create one
            </NextLink>
          </div>

          {/* Demo credentials */}
          <div className="glass-light" style={{ marginTop: 20, padding: 14, fontSize: '0.8rem' }}>
            <div style={{ color: 'var(--color-muted)', marginBottom: 6 }}>Demo credentials:</div>
            <div><span style={{ color: 'var(--color-primary)' }}>admin@quantadv.io</span> / <span style={{ color: 'var(--color-primary)' }}>Admin@123456</span></div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
