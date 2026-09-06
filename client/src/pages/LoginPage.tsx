import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card.js';
import { Input } from '../components/ui/Input.js';
import { Button } from '../components/ui/Button.js';
import { Logo } from '../components/layout/Logo.js';
import { useAuth } from '../contexts/AuthContext.js';
import { useToast } from '../contexts/ToastContext.js';
import { Eye, EyeOff, LogIn, Sparkles, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, loginAsDemoUser, loginAsDemoAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      showToast('Logged in successfully!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: 'user' | 'admin') => {
    if (role === 'admin') {
      loginAsDemoAdmin();
      showToast('Logged in as Administrator', 'info');
      navigate('/admin');
    } else {
      loginAsDemoUser();
      showToast('Logged in as Demo User', 'info');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-xs text-[#AAB3D0]">
            Enter your credentials to access your SnapCut AI dashboard
          </p>
        </div>

        <Card className="p-8 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <div className="space-y-1.5 relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-[#707B9E] hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <Link to="/forgot-password" className="text-[#00D9FF] hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full shadow-glow-brand"
              isLoading={loading}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Log In
            </Button>
          </form>

          {/* Quick Demo Logins for Instant Testing */}
          <div className="space-y-3 pt-4 border-t border-[#1C2450]/80">
            <p className="text-[11px] uppercase tracking-wider text-center text-[#707B9E] font-semibold">
              Instant Test Profiles
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleQuickDemo('user')}
                className="text-xs flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00D9FF]" />
                Demo User
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleQuickDemo('admin')}
                className="text-xs flex items-center justify-center gap-1.5 text-rose-300"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                Demo Admin
              </Button>
            </div>
          </div>
        </Card>

        <p className="text-center text-xs text-[#AAB3D0]">
          Don't have an account yet?{' '}
          <Link to="/signup" className="text-[#00D9FF] font-semibold hover:underline">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
};
