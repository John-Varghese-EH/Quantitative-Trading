"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Eye, EyeOff, ArrowLeft, Shield, BarChart3, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { useTheme } from 'next-themes';

const schema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string().min(3, 'At least 3 characters'),
  password: z.string().min(8, 'At least 8 characters'),
  full_name: z.string().min(1, 'Full name is required'),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register: authRegister } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await authRegister(data.email, data.password);
      toast.success('Account created!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-[#050505]' : 'bg-[#fafafa]'}`}>
      {/* ─── LEFT: ANIMATED ENTERPRISE BRANDING ───────────────────────────────── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-black text-white flex-col justify-between p-12 border-r border-white/10">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.04] pointer-events-none mix-blend-overlay z-10" />
        
        {/* Animated Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-10000" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

        {/* Floating Icons Animation */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-20">
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[30%] left-[20%]"
          >
            <Shield size={64} className="text-blue-400" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[40%] right-[25%]"
          >
            <BarChart3 size={80} className="text-purple-400" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -40, 0], rotate: [0, 15, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-[50%] left-[60%]"
          >
            <Database size={56} className="text-emerald-400" />
          </motion.div>
        </div>

        {/* Content */}
        <div className="relative z-20">
          <NextLink href="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shadow-lg shadow-white/10">
              <Activity size={24} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              QuantAdv
            </span>
          </NextLink>
        </div>

        <div className="relative z-20 max-w-lg">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-semibold tracking-tight leading-tight mb-6"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Build your quantitative empire safely.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-zinc-400 leading-relaxed"
          >
            Join thousands of institutional researchers deploying models in our resilient, adversarial-tested sandbox environment.
          </motion.p>
        </div>

        <div className="relative z-20 flex items-center justify-between text-sm text-zinc-500 font-medium tracking-wide">
          <span>&copy; {new Date().getFullYear()} QuantAdv</span>
          <span className="flex gap-4">
            <NextLink href="/terms" className="hover:text-zinc-300 transition-colors">Terms</NextLink>
            <NextLink href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy</NextLink>
          </span>
        </div>
      </div>

      {/* ─── RIGHT: AUTH FORM ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col relative justify-center items-center p-6 sm:p-12 overflow-y-auto">
        {/* Back to Home Mobile */}
        <NextLink href="/" className={`lg:hidden absolute top-8 left-8 flex items-center gap-2 text-sm font-medium transition-colors ${isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-500 hover:text-black'}`}>
          <ArrowLeft size={16} />
          Home
        </NextLink>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-[420px] my-auto"
        >
          <div className="mb-8 lg:mb-10">
            <h1 className={`text-3xl font-bold tracking-tight mb-3 ${isDark ? 'text-white' : 'text-black'}`} style={{ fontFamily: 'var(--font-heading)' }}>
              Create an account
            </h1>
            <p className={`${isDark ? 'text-zinc-400' : 'text-zinc-500'} text-base`}>
              Start building institutional-grade strategies today.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>
                Full Name
              </label>
              <input 
                {...register('full_name')} 
                type="text"
                className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                  isDark 
                    ? 'bg-black/40 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-white/40 focus:bg-white/5' 
                    : 'bg-white border-zinc-200 text-black placeholder:text-zinc-400 focus:border-black/30 focus:bg-zinc-50'
                }`}
                placeholder="John Doe" 
              />
              {errors.full_name && <span className="text-red-500 text-xs mt-1.5 font-medium block">{errors.full_name.message}</span>}
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>
                Email Address
              </label>
              <input 
                {...register('email')} 
                type="email"
                className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                  isDark 
                    ? 'bg-black/40 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-white/40 focus:bg-white/5' 
                    : 'bg-white border-zinc-200 text-black placeholder:text-zinc-400 focus:border-black/30 focus:bg-zinc-50'
                }`}
                placeholder="you@example.com" 
              />
              {errors.email && <span className="text-red-500 text-xs mt-1.5 font-medium block">{errors.email.message}</span>}
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>
                Username
              </label>
              <input 
                {...register('username')} 
                type="text"
                className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                  isDark 
                    ? 'bg-black/40 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-white/40 focus:bg-white/5' 
                    : 'bg-white border-zinc-200 text-black placeholder:text-zinc-400 focus:border-black/30 focus:bg-zinc-50'
                }`}
                placeholder="tradingquant" 
              />
              {errors.username && <span className="text-red-500 text-xs mt-1.5 font-medium block">{errors.username.message}</span>}
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full px-4 py-3 pr-12 rounded-xl border-2 outline-none transition-all ${
                    isDark 
                      ? 'bg-black/40 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-white/40 focus:bg-white/5' 
                      : 'bg-white border-zinc-200 text-black placeholder:text-zinc-400 focus:border-black/30 focus:bg-zinc-50'
                  }`}
                  placeholder="Min 8 characters"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="text-red-500 text-xs mt-1.5 font-medium block">{errors.password.message}</span>}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 mt-4 rounded-xl font-bold text-[15px] transition-all shadow-xl ${
                isDark 
                  ? 'bg-white text-black hover:bg-zinc-200 disabled:bg-white/50 shadow-white/10' 
                  : 'bg-black text-white hover:bg-zinc-800 disabled:bg-black/50 shadow-black/10'
              }`}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </motion.button>
          </form>

          <div className="mt-10 text-center">
            <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Already have an account?{' '}
              <NextLink href="/login" className={`font-bold transition-colors ${isDark ? 'text-white hover:text-zinc-300' : 'text-black hover:text-zinc-700'}`}>
                Sign in
              </NextLink>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
