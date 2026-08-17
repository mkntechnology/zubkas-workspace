import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Receipt, TrendingUp, FolderKanban, Zap } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Receipt,
    title: 'Smart Invoicing & GST Billing',
    desc: 'Create professional invoices with automatic GST calculations, partial payment tracking, and instant PDF export.',
  },
  {
    icon: TrendingUp,
    title: 'Real-time Expense & Profit Tracking',
    desc: 'Monitor cash flow, log expenses, and generate profit & loss statements with live accounting sync.',
  },
  {
    icon: FolderKanban,
    title: 'Automated Project & Task Management',
    desc: 'Projects auto-create from invoice payments. Track tasks, deadlines, and budgets in one unified workspace.',
  },
];

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const success = login(email, password);
      if (!success) {
        setError('Invalid email or password. Please try again.');
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left showcase panel — hidden on mobile/tablet */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-sidebar">
        {/* Deep gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar via-sidebar to-primary/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Decorative orbs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-0 -left-32 w-80 h-80 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-blue-500/10 blur-[80px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 h-full text-sidebar-foreground">
          {/* Brand header */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-400 shadow-2xl shadow-primary/30">
              <Zap className="w-6 h-6 text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Zubkas Workspace</h1>
              <p className="text-xs text-sidebar-foreground/60 mt-0.5">All-in-One Business OS</p>
            </div>
          </div>

          {/* Hero text */}
          <div className="max-w-md">
            <h2 className="text-3xl xl:text-4xl font-bold leading-tight tracking-tight">
              Run your entire business from one workspace.
            </h2>
            <p className="text-sm text-sidebar-foreground/60 mt-3 leading-relaxed">
              Invoicing, Accounting & Project Management — seamlessly integrated so every payment automatically syncs across your books, receipts, and projects.
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-5 max-w-md">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex items-start gap-4 group">
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/5 border border-white/10 shrink-0 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-300">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{f.title}</p>
                    <p className="text-xs text-sidebar-foreground/50 mt-1 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust badge */}
          <div className="flex items-center gap-2 text-xs text-sidebar-foreground/40">
            <ShieldCheck className="w-4 h-4" />
            <span>Powered by Zubkas Technology</span>
            <span className="mx-2">·</span>
            <span>Bank-grade security</span>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 relative overflow-hidden">
        {/* Subtle background for mobile */}
        <div className="absolute inset-0 lg:hidden bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-primary/5 blur-[80px] hidden lg:block" />

        <div className="relative z-10 w-full max-w-md animate-slide-up">
          {/* Mobile brand header */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-400 shadow-2xl shadow-primary/30 mb-3">
              <Zap className="w-7 h-7 text-white" fill="white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Zubkas Workspace</h1>
            <p className="text-xs text-muted-foreground mt-1">All-in-One Business OS</p>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-black/5 p-7 sm:p-8">
            <div className="mb-6">
              <h2 className="font-bold text-xl tracking-tight">Welcome back</h2>
              <p className="text-sm text-muted-foreground mt-1">Sign in to your workspace to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="zubkastechnology@gmail.com"
                    className="pl-10 h-11 transition-all focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-11 transition-all focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 text-destructive text-sm px-3.5 py-2.5 animate-fade-in border border-destructive/20">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
                  <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer select-none">Remember me</Label>
                </div>
                <button type="button" className="text-sm text-primary hover:underline font-medium transition-colors">
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full h-11 gap-2 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <>Sign In to Workspace <ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            </form>

            {/* Credentials helper pill */}
            <div className="mt-6 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-muted/60 border border-border px-4 py-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>Default: <span className="font-medium text-foreground">zubkastechnology@gmail.com</span> / <span className="font-medium text-foreground">Zubkas@2036</span></span>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            &copy; {new Date().getFullYear()} Zubkas Workspace. Powered by Zubkas Technology Private Limited.
          </p>
        </div>
      </div>
    </div>
  );
}
