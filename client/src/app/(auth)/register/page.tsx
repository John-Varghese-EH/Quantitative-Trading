"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import LineWaves from '@/components/LineWaves';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from 'next-themes';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  username: z.string().min(3, 'At least 3 characters'),
  password: z.string().min(8, 'At least 8 characters'),
  full_name: z.string().min(1, 'Full name is required'),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const { user, register: authRegister, loginWithGoogle } = useAuth();
  const { theme, systemTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await authRegister(data.email, data.password, data.username, data.full_name);
      toast.success('Account created successfully');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Authentication successful');
    } catch (err: any) {
      console.error(err);
      toast.error(`Google authentication failed: ${err.message || 'Unknown error'}`);
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Determine current effective theme
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isLight = mounted && currentTheme === 'light';

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-black selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-300">
      
      {/* ─── LEFT: BRANDING & ANIMATION ────────────────────────────────────────── */}
      <div className="hidden lg:flex w-[45%] relative flex-col justify-between p-12 overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-black dark:text-white border-r border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
        
        {/* LineWaves Background - Professional Emerald Theme for Register */}
        <div className="absolute inset-0 z-0 opacity-80 dark:opacity-70 dark:mix-blend-screen transition-all duration-500">
          <LineWaves
            speed={0.15}
            innerLineCount={32}
            outerLineCount={48}
            warpIntensity={1.2}
            rotation={-45}
            edgeFadeWidth={0.1}
            colorCycleSpeed={0.5}
            brightness={isLight ? 1.6 : 1.2}
            color1={isLight ? "#0ea5e9" : "#064e3b"} // Sky Blue : deep emerald
            color2={isLight ? "#10b981" : "#059669"} // Emerald : emerald 600
            color3={isLight ? "#f59e0b" : "#34d399"} // Amber : light emerald
            enableMouseInteraction={true}
            mouseInfluence={3.0}
          />
        </div>
        
        {/* Vignette to ensure text readability over the waves */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-50/60 via-zinc-50/20 to-zinc-50/90 dark:from-zinc-950/60 dark:via-zinc-950/20 dark:to-zinc-950/90 pointer-events-none z-10 transition-colors duration-300" />

        {/* Header */}
        <div className="relative z-20 flex items-center justify-between">
          <NextLink href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg transition-colors duration-300">
              <Activity size={20} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-black dark:text-white transition-colors duration-300" style={{ fontFamily: 'var(--font-heading)' }}>
              QuantAdv
            </span>
          </NextLink>
          <NextLink href="/" className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
            <ArrowLeft size={16} />
            Back to home
          </NextLink>
        </div>

        {/* Footer Typography */}
        <div className="relative z-20 mt-auto">
          <h2 className="text-4xl font-medium tracking-tight mb-4 text-black dark:text-white transition-colors duration-300" style={{ fontFamily: 'var(--font-heading)' }}>
            Build your quantitative edge.
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed max-w-sm transition-colors duration-300">
            Deploy your models into a secure, adversarial-tested sandbox built for elite quantitative research.
          </p>
        </div>
      </div>

      {/* ─── RIGHT: FORM ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 relative">
        
        {/* Mobile Header */}
        <NextLink href="/" className="lg:hidden absolute top-6 left-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
          <ArrowLeft size={16} />
          Home
        </NextLink>
        
        {/* Top Right Actions */}
        <div className="absolute top-6 right-6 flex items-center gap-4">
          <ThemeToggle />
          <NextLink href="/login" className="text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
            Sign in &rarr;
          </NextLink>
        </div>

        <div className="w-full max-w-[380px] animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-white mb-2 transition-colors duration-300">
              Create an account
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 transition-colors duration-300">
              Start building your institutional workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            className="w-full h-10 flex items-center justify-center gap-3 bg-transparent border border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            {googleLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Sign up with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-200 dark:border-zinc-800 transition-colors duration-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-white dark:bg-black px-2 text-zinc-500 transition-colors duration-300">Or register with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 transition-colors duration-300">
                Full Name
              </label>
              <input 
                {...register('full_name')} 
                type="text"
                className="w-full px-4 py-2.5 bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:border-zinc-300 dark:focus:border-zinc-700 transition-all text-sm"
                placeholder="John Doe" 
              />
              {errors.full_name && <span className="text-red-500 text-xs">{errors.full_name.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 transition-colors duration-300">
                Email
              </label>
              <input 
                {...register('email')} 
                type="email"
                className="w-full px-4 py-2.5 bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:border-zinc-300 dark:focus:border-zinc-700 transition-all text-sm"
                placeholder="name@company.com" 
                autoComplete="email"
              />
              {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 transition-colors duration-300">
                Username
              </label>
              <input 
                {...register('username')} 
                type="text"
                className="w-full px-4 py-2.5 bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:border-zinc-300 dark:focus:border-zinc-700 transition-all text-sm"
                placeholder="tradingquant" 
              />
              {errors.username && <span className="text-red-500 text-xs">{errors.username.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 transition-colors duration-300">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                className="w-full px-4 py-2.5 bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:border-zinc-300 dark:focus:border-zinc-700 transition-all text-sm"
                placeholder="Min 8 characters"
                autoComplete="new-password"
              />
              {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full h-10 flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create account'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}
