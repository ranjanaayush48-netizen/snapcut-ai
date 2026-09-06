import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card.js';
import { Input } from '../components/ui/Input.js';
import { Button } from '../components/ui/Button.js';
import { Logo } from '../components/layout/Logo.js';
import { useToast } from '../contexts/ToastContext.js';
import { KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleResetRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      showToast('Password reset instructions sent to your email.', 'info');
    }, 600);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-white">Reset password</h1>
          <p className="text-xs text-[#AAB3D0]">
            Enter your email to receive a password recovery link
          </p>
        </div>

        <Card className="p-8 space-y-6">
          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-[#00D9FF]/10 text-[#00D9FF] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Check your email</h3>
              <p className="text-xs text-[#AAB3D0] leading-relaxed">
                If an account exists for <strong className="text-white">{email}</strong>, we've sent password reset instructions.
              </p>
              <Link to="/login" className="inline-block pt-2">
                <Button variant="outline" size="sm">
                  Return to login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleResetRequest} className="space-y-4">
              <Input
                label="Registered Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full shadow-glow-brand"
                isLoading={loading}
              >
                <KeyRound className="w-4 h-4 mr-2" />
                Send Reset Link
              </Button>
            </form>
          )}

          <div className="text-center pt-2 border-t border-[#1C2450]/80">
            <Link
              to="/login"
              className="text-xs text-[#AAB3D0] hover:text-white inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to log in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
