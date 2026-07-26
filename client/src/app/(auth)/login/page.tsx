"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { useTheme } from 'next-themes';

const schema = z.object({
  username: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await login(data.username, data.password);
      toast.success(`Welcome back!`);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#000000]' : 'bg-[#fafafa]'}`}>
      {/* Background Effects */}
      {isDark ? (
        <>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
        </>
      ) : (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-black/5 rounded-full blur-[120px] pointer-events-none" />
      )}

      {/* Back to Home */}
      <NextLink href="/" className={`absolute top-8 left-8 sm:top-12 sm:left-12 flex items-center gap-2 text-sm font-medium transition-colors ${isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-500 hover:text-black'}`}>
        <ArrowLeft size={16} />
        Home
      </NextLink>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="text-center mb-10">
          <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-2xl transition-colors ${isDark ? 'bg-white text-black shadow-white/10' : 'bg-black text-white shadow-black/10'}`}>
            <Activity size={32} strokeWidth={2.5} />
          </div>
          <h1 className={`text-3xl font-bold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-black'}`} style={{ fontFamily: 'var(--font-heading)' }}>
            Welcome back
          </h1>
          <p className={`${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Sign in to access your quantitative models
          </p>
        </div>

        <div className={`p-8 sm:p-10 rounded-3xl border shadow-xl backdrop-blur-xl ${isDark ? 'bg-white/[0.03] border-white/10 shadow-black/50' : 'bg-white/70 border-black/5 shadow-black/5'}`}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                Email Address
              </label>
              <input 
                {...register('username')} 
                type="email"
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                  isDark 
                    ? 'bg-black/50 border-white/10 text-white placeholder:text-zinc-600 focus:border-white/30 focus:bg-white/5' 
                    : 'bg-white border-black/10 text-black placeholder:text-zinc-400 focus:border-black/30 focus:bg-black/5'
                }`}
                placeholder="you@example.com" 
              />
              {errors.username && <span className="text-red-500 text-xs mt-1.5 block">{errors.username.message}</span>}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full px-4 py-3 pr-12 rounded-xl border outline-none transition-all ${
                    isDark 
                      ? 'bg-black/50 border-white/10 text-white placeholder:text-zinc-600 focus:border-white/30 focus:bg-white/5' 
                      : 'bg-white border-black/10 text-black placeholder:text-zinc-400 focus:border-black/30 focus:bg-black/5'
                  }`}
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="text-red-500 text-xs mt-1.5 block">{errors.password.message}</span>}
            </div>

            <div className="flex justify-end">
              <NextLink href="/forgot-password" className={`text-sm font-medium transition-colors ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-black'}`}>
                Forgot password?
              </NextLink>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3.5 mt-2 rounded-xl font-semibold text-sm transition-all ${
                isDark 
                  ? 'bg-white text-black hover:bg-zinc-200 disabled:bg-white/50' 
                  : 'bg-black text-white hover:bg-zinc-800 disabled:bg-black/50'
              }`}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-500/10 text-center">
            <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Don't have an account?{' '}
              <NextLink href="/register" className={`font-semibold transition-colors ${isDark ? 'text-white hover:text-zinc-300' : 'text-black hover:text-zinc-700'}`}>
                Create an account
              </NextLink>
            </p>
          </div>
          
          <div className={`mt-6 p-4 rounded-xl text-center text-xs border ${isDark ? 'bg-white/5 border-white/10 text-zinc-400' : 'bg-black/5 border-black/10 text-zinc-600'}`}>
            <span className="opacity-70">Demo credentials: </span>
            <span className={`font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>admin@quantadv.io</span> / <span className={`font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>Admin@123456</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
