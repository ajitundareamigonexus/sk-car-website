'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock, Mail, User, Phone, Eye, EyeOff, ShieldCheck,
  CheckCircle2, AlertCircle, ArrowRight, ArrowLeft
} from 'lucide-react';
import { login, registerUser, getCurrentUser } from '@/lib/authStore';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [isLogin, setIsLogin] = useState(true);
  const [showPwd, setShowPwd] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');

  // Status states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push(redirect);
      }
    }
  }, [router, redirect]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!isLogin) {
      if (!fullName.trim() || !mobile.trim()) {
        setError('Please fill in your name and mobile number.');
        return;
      }
      if (!/^[6-9]\d{9}$/.test(mobile)) {
        setError('Enter a valid 10-digit mobile number.');
        return;
      }
    }

    setLoading(true);
    // Simulate short loader for premium feel
    await new Promise(r => setTimeout(r, 600));

    if (isLogin) {
      const res = await login(email, password);
      if (res.success && res.user) {
        setSuccess(`Welcome back, ${res.user.fullName}!`);
        setTimeout(() => {
          if (res.user?.role === 'admin') {
            router.push('/admin');
          } else {
            router.push(redirect);
          }
        }, 800);
      } else {
        setError(res.error || 'Invalid credentials');
        setLoading(false);
      }
    } else {
      // Commented out API calls to work fully offline
      /*
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030/api";
        const response = await fetch(`${apiBase}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: fullName.trim(),
            email: email.trim(),
            mobile: mobile.trim(),
            password: password,
          }),
        });

        if (!response.ok) {
          let errText = 'Registration failed';
          try {
            const errJson = await response.json();
            errText = errJson.message || errText;
          } catch { }
          setError(errText);
          setLoading(false);
          return;
        }

        const data = await response.json();
        
        // Backend successfully registered and logged in the user
        setSuccess('Registration successful!');
        
        const normalizedRole = data.role === 'ADMIN' ? 'admin' : 'user';

        localStorage.setItem("token", data.token);
        localStorage.setItem("role", normalizedRole);
        localStorage.setItem("fullName", data.fullName);

        // Create session object
        const sessionUser = {
          id: data.id ? String(data.id) : `u-${Date.now()}`,
          fullName: data.fullName,
          email: data.email || email.trim(),
          mobile: data.mobile || mobile.trim(),
          role: normalizedRole,
        };

        const loginRes = await login(email.trim(), password);
        if (loginRes.success) {
          setTimeout(() => {
            router.push(redirect);
          }, 800);
        }

      } catch (err) {
        console.error("Backend register failed, attempting local fallback...", err);
      }
      */

      const res = registerUser({
        fullName: fullName.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        password: password,
      });

      if (res.success) {
        setSuccess('Registration successful! You can now log in.');
        setIsLogin(true);
        setPassword('');
      } else {
        setError(res.error || 'Registration failed');
      }
      setLoading(false);
    }
  };

  const fillCredentials = (type: 'admin' | 'user') => {
    if (type === 'admin') {
      setEmail('admin@sk.com');
      setPassword('SK@123');
    } else {
      setEmail('user@gmail.com');
      setPassword('user123');
    }
    setIsLogin(true);
    setError('');
  };

  return (
    <section className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-28 relative overflow-hidden">
      {/* Background radial effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-35 dark:opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(34,211,238,0.25) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-35 dark:opacity-15 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(20,184,166,0.2) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="w-full max-w-5xl grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center relative z-10">
        
        {/* Left Side: Brand Intro & Quick Credentials Cards */}
        <div className="space-y-6 lg:pr-6">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={32} className="text-teal-400" />
            <span className="text-3xl font-black text-primary tracking-wide">SK CAR RENTAL</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight">
            Premium travel starts with a <span className="text-teal-400">secure account</span>
          </h1>
          <p className="text-muted leading-relaxed text-sm">
            Sign up to track your rides in real-time, view invoice summaries, cancel bookings, and pre-fill details for faster future checkouts.
          </p>

          {/* Quick Demo Credentials Cards */}
          <div className="mt-8 pt-4 border-t border-border space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted">Test Account Helpers</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {/* User helper */}
              <button
                onClick={() => fillCredentials('user')}
                type="button"
                className="text-left p-4 rounded-2xl bg-card border border-card-border hover:border-primary/45 transition-all hover:scale-[1.02] text-xs space-y-2 cursor-pointer shadow-sm group"
              >
                <div className="flex justify-between items-center font-bold text-teal-400">
                  <span>Standard User</span>
                  <ArrowRight size={12} className="text-muted group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-muted">Username/Email: <span className="text-foreground font-semibold">user@gmail.com</span></div>
                <div className="text-muted">Password: <span className="text-foreground font-semibold">user123</span></div>
              </button>

              {/* Admin helper */}
              <button
                onClick={() => fillCredentials('admin')}
                type="button"
                className="text-left p-4 rounded-2xl bg-card border border-card-border hover:border-primary/45 transition-all hover:scale-[1.02] text-xs space-y-2 cursor-pointer shadow-sm group"
              >
                <div className="flex justify-between items-center font-bold text-primary">
                  <span>Admin Account</span>
                  <ArrowRight size={12} className="text-muted group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-muted">Username/Email: <span className="text-foreground font-semibold">admin@sk.com</span></div>
                <div className="text-muted">Password: <span className="text-foreground font-semibold">SK@123</span></div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Tabbed Login / Sign Up Card */}
        <div className="rounded-3xl border border-card-border bg-card p-8 shadow-lg relative">
          
          {/* Back link */}
          <button
            onClick={() => router.push('/')}
            type="button"
            className="absolute top-4 left-4 flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft size={12} />
            Back to Home
          </button>

          {/* Form Tabs */}
          <div className="flex border-b border-border mb-6 mt-4">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
                setSuccess('');
              }}
              type="button"
              className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${
                isLogin ? 'border-primary text-foreground' : 'border-transparent text-muted'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
                setSuccess('');
              }}
              type="button"
              className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${
                !isLogin ? 'border-primary text-foreground' : 'border-transparent text-muted'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {/* Full name (Sign Up only) */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full h-12 rounded-xl bg-background border border-border pl-11 pr-4 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full h-12 rounded-xl bg-background border border-border pl-11 pr-4 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Mobile (Sign Up only) */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted">Mobile Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="tel"
                    required
                    placeholder="Enter 10-digit mobile"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    className="w-full h-12 rounded-xl bg-background border border-border pl-11 pr-4 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-12 rounded-xl bg-background border border-border pl-11 pr-12 text-sm outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Notifications */}
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary text-primary-contrast font-bold text-sm hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md mt-4"
              style={{ boxShadow: '0 4px 16px var(--glow)' }}
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-primary-contrast border-t-transparent animate-spin" />
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
