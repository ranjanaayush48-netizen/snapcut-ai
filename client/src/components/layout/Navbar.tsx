import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo.js';
import { Button } from '../ui/Button.js';
import { useAuth } from '../../contexts/AuthContext.js';
import {
  Menu,
  X,
  Sparkles,
  Layers,
  History as HistoryIcon,
  CreditCard,
  Settings as SettingsIcon,
  ShieldCheck,
  LogOut,
  User as UserIcon,
  Coins
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, usage, logout } = useAuth();
  const location = useLocation();

  const isCurrent = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1C2450]/80 bg-[#050816]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo size="md" />

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {!user ? (
            <>
              <a
                href="/#features"
                className="px-3 py-2 text-sm text-[#AAB3D0] hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="/#how-it-works"
                className="px-3 py-2 text-sm text-[#AAB3D0] hover:text-white transition-colors"
              >
                How It Works
              </a>
              <Link
                to="/pricing"
                className={`px-3 py-2 text-sm transition-colors ${
                  isCurrent('/pricing') ? 'text-[#00D9FF] font-semibold' : 'text-[#AAB3D0] hover:text-white'
                }`}
              >
                Pricing
              </Link>
              <Link
                to="/faq"
                className={`px-3 py-2 text-sm transition-colors ${
                  isCurrent('/faq') ? 'text-[#00D9FF] font-semibold' : 'text-[#AAB3D0] hover:text-white'
                }`}
              >
                FAQ
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/remove-background"
                className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                  isCurrent('/remove-background')
                    ? 'bg-[#10173A] text-[#00D9FF] font-medium'
                    : 'text-[#AAB3D0] hover:text-white hover:bg-white/5'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#00D9FF]" />
                Remove Background
              </Link>
              <Link
                to="/dashboard"
                className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                  isCurrent('/dashboard')
                    ? 'bg-[#10173A] text-[#00D9FF] font-medium'
                    : 'text-[#AAB3D0] hover:text-white hover:bg-white/5'
                }`}
              >
                <Layers className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                to="/history"
                className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                  isCurrent('/history')
                    ? 'bg-[#10173A] text-[#00D9FF] font-medium'
                    : 'text-[#AAB3D0] hover:text-white hover:bg-white/5'
                }`}
              >
                <HistoryIcon className="w-4 h-4" />
                History
              </Link>
              <Link
                to="/billing"
                className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                  isCurrent('/billing')
                    ? 'bg-[#10173A] text-[#00D9FF] font-medium'
                    : 'text-[#AAB3D0] hover:text-white hover:bg-white/5'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Billing
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                    isCurrent('/admin')
                      ? 'bg-rose-500/20 text-rose-300 font-medium'
                      : 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Action Controls */}
        <div className="hidden md:flex items-center space-x-3">
          {!user ? (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">
                  Get Started Free
                </Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              {/* Credit Pill */}
              <Link
                to="/billing"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#080B1A] border border-[#1C2450] hover:border-[#00D9FF]/40 rounded-full text-xs transition-colors"
                title="Your available credits"
              >
                <Coins className="w-3.5 h-3.5 text-[#00D9FF]" />
                <span className="font-semibold text-white">
                  {usage?.creditBalance ?? 5}
                </span>
                <span className="text-[#707B9E]">credits</span>
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-[#1C2450] bg-[#080B1A] hover:border-[#2A3777] transition-all"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center text-white text-xs font-bold">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-white max-w-[100px] truncate">
                    {user.displayName}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-[#0B1026] border border-[#1C2450] rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-[#1C2450]/60">
                      <p className="text-xs font-semibold text-white truncate">{user.displayName}</p>
                      <p className="text-[11px] text-[#707B9E] truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#00D9FF]/10 text-[#00D9FF]">
                        {user.plan} Plan
                      </span>
                    </div>

                    <Link
                      to="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#AAB3D0] hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <SettingsIcon className="w-4 h-4" />
                      Settings
                    </Link>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center space-x-2">
          {user && (
            <Link
              to="/billing"
              className="flex items-center gap-1 px-2.5 py-1 bg-[#080B1A] border border-[#1C2450] rounded-full text-xs text-white"
            >
              <Coins className="w-3 h-3 text-[#00D9FF]" />
              <span>{usage?.creditBalance ?? 5}</span>
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#AAB3D0] hover:text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#1C2450] bg-[#080B1A] px-4 pt-3 pb-6 space-y-3">
          {!user ? (
            <>
              <a
                href="/#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm text-[#AAB3D0] hover:text-white"
              >
                Features
              </a>
              <a
                href="/#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm text-[#AAB3D0] hover:text-white"
              >
                How It Works
              </a>
              <Link
                to="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm text-[#AAB3D0] hover:text-white"
              >
                Pricing
              </Link>
              <Link
                to="/faq"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm text-[#AAB3D0] hover:text-white"
              >
                FAQ
              </Link>
              <div className="pt-3 border-t border-[#1C2450] flex flex-col gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full">Log In</Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">Get Started Free</Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/remove-background"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-sm text-white"
              >
                <Sparkles className="w-4 h-4 text-[#00D9FF]" />
                Remove Background
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-sm text-[#AAB3D0]"
              >
                <Layers className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-sm text-[#AAB3D0]"
              >
                <HistoryIcon className="w-4 h-4" />
                History
              </Link>
              <Link
                to="/billing"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-sm text-[#AAB3D0]"
              >
                <CreditCard className="w-4 h-4" />
                Billing
              </Link>
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-sm text-[#AAB3D0]"
              >
                <SettingsIcon className="w-4 h-4" />
                Settings
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-sm text-rose-400"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              )}
              <div className="pt-3 border-t border-[#1C2450]">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left py-2 text-sm text-rose-400 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};
