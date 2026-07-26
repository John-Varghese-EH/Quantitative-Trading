"use client";
import { useState } from 'react'
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Zap, Eye, EyeOff } from 'lucide-react'
import api from '@/services/api'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email('Invalid email'),
  username: z.string().min(3, 'At least 3 characters'),
  password: z.string().min(8, 'At least 8 characters'),
  full_name: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await api.post('/auth/register', data)
      toast.success('Account created! Check your email to verify.')
      router.push('/login')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--color-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      backgroundImage: `radial-gradient(ellipse at 80% 20%, rgba(124, 58, 237, 0.15) 0%, transparent 50%),
                        radial-gradient(ellipse at 20% 80%, rgba(0, 212, 255, 0.1) 0%, transparent 50%)`,
    }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
            borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(0,212,255,0.4)',
          }}>
            <Zap size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }} className="gradient-text">QuantAdv</h1>
          <p style={{ color: 'var(--color-muted)', margin: '4px 0 0' }}>Create your sandbox account</p>
        </div>

        <div className="glass" style={{ padding: 32 }}>
          <h2 style={{ margin: '0 0 24px', fontWeight: 700 }}>Create Account</h2>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--color-muted)', display: 'block', marginBottom: 5 }}>Full Name</label>
              <input {...register('full_name')} className="input-field" placeholder="John Doe" />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--color-muted)', display: 'block', marginBottom: 5 }}>Email</label>
              <input {...register('email')} type="email" className="input-field" placeholder="you@example.com" />
              {errors.email && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{errors.email.message}</span>}
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--color-muted)', display: 'block', marginBottom: 5 }}>Username</label>
              <input {...register('username')} className="input-field" placeholder="tradingquant" />
              {errors.username && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{errors.username.message}</span>}
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--color-muted)', display: 'block', marginBottom: 5 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input {...register('password')} type={showPassword ? 'text' : 'password'} className="input-field" placeholder="Min 8 characters" style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{errors.password.message}</span>}
            </div>

            <motion.button type="submit" className="btn-primary" disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ padding: '14px', fontSize: '1rem', marginTop: 8, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating account…' : 'Create Account'}
            </motion.button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem', color: 'var(--color-muted)' }}>
            Already have an account?{' '}
            <NextLink href="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>Sign in</NextLink>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
