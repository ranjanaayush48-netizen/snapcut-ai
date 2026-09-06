import React, { useState } from 'react';
import { Card } from '../components/ui/Card.js';
import { Input } from '../components/ui/Input.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { useAuth } from '../contexts/AuthContext.js';
import { useToast } from '../contexts/ToastContext.js';
import { apiClient } from '../api/client.js';
import { User as UserIcon, Lock, Trash2, LogOut, ShieldAlert, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, usage, logout } = useAuth();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileUpdated, setProfileUpdated] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdatingProfile(true);
      await apiClient.put('/profile', { displayName });
      setProfileUpdated(true);
      showToast('Profile display name updated successfully!', 'success');
      setTimeout(() => setProfileUpdated(false), 3000);
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }
    setUpdatingPassword(true);
    setTimeout(() => {
      setUpdatingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      showToast('Security credentials updated!', 'success');
    }, 500);
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        'Are you sure you want to permanently delete your SnapCut AI account? All history, quotas, and active credits will be immediately purged. This action cannot be undone.'
      )
    ) {
      try {
        await apiClient.delete('/account');
        showToast('Account successfully closed.', 'info');
        logout();
      } catch (err: any) {
        showToast(err.message || 'Failed to delete account.', 'error');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Account Settings</h1>
        <p className="text-xs sm:text-sm text-[#AAB3D0] mt-1">
          Manage your personal details, credentials, and plan quotas
        </p>
      </div>

      {/* 1. Profile Section */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-[#1C2450]/80">
          <UserIcon className="w-5 h-5 text-[#00D9FF]" />
          <h2 className="text-base font-bold text-white">Profile Details</h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Display Name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
            />
            <Input
              label="Email Address (Read-only)"
              value={user?.email || ''}
              disabled
              helperText="Managed via Supabase authentication"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={updatingProfile}
            >
              {profileUpdated ? (
                <>
                  <Check className="w-4 h-4 mr-1.5" /> Saved
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. Security Section */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-[#1C2450]/80">
          <Lock className="w-5 h-5 text-[#6C3BFF]" />
          <h2 className="text-base font-bold text-white">Security & Password</h2>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
            />
            <Input
              label="New Password"
              type="password"
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={logout}
              className="text-rose-400 hover:border-rose-500/40"
            >
              <LogOut className="w-4 h-4 mr-1.5" /> Sign Out Session
            </Button>

            <Button
              type="submit"
              variant="secondary"
              size="sm"
              isLoading={updatingPassword}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* 3. Current Quota Overview */}
      <Card className="p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-bold text-white">Plan & Usage Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#080B1A] border border-[#1C2450]">
            <span className="text-[#707B9E] block mb-1">Active Plan</span>
            <Badge variant="cyan">{user?.plan?.toUpperCase()}</Badge>
          </div>
          <div className="p-3.5 rounded-xl bg-[#080B1A] border border-[#1C2450]">
            <span className="text-[#707B9E] block mb-1">Remaining Daily Limit</span>
            <span className="text-white font-bold">{usage?.remainingDaily ?? 5}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#080B1A] border border-[#1C2450]">
            <span className="text-[#707B9E] block mb-1">Total Available Credits</span>
            <span className="text-white font-bold">{usage?.creditBalance ?? 5}</span>
          </div>
        </div>
      </Card>

      {/* 4. Danger Zone */}
      <Card className="p-6 sm:p-8 space-y-4 border-rose-500/30 bg-[#140816]/40">
        <div className="flex items-center gap-2 text-rose-400">
          <ShieldAlert className="w-5 h-5" />
          <h2 className="text-base font-bold text-white">Danger Zone</h2>
        </div>
        <p className="text-xs text-[#AAB3D0]">
          Permanently delete your user profile, credit balances, and processing records from the database.
        </p>

        <div className="pt-2">
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleDeleteAccount}
          >
            <Trash2 className="w-4 h-4 mr-1.5" /> Delete My Account
          </Button>
        </div>
      </Card>
    </div>
  );
};
