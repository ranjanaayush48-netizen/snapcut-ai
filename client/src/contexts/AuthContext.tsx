import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserUsage, PlanTier } from '../types/index.js';
import { apiClient } from '../api/client.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  usage: UserUsage | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, password?: string, displayName?: string) => Promise<void>;
  loginAsDemoUser: () => void;
  loginAsDemoAdmin: () => void;
  logout: () => void;
  refreshUsage: () => Promise<void>;
  updateUserPlan: (plan: PlanTier, creditsToAdd?: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('snapcut_auth_token'));
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUsage = async () => {
    try {
      const res = await apiClient.get<any>('/usage');
      if (res.data) {
        setUsage(res.data as UserUsage);
      }
    } catch (err) {
      console.error('Failed to fetch usage', err);
    }
  };

  // Sync session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('snapcut_auth_token');
      if (!storedToken) {
        // Automatically provide demo session so user can immediately test without friction
        loginAsDemoUser();
        setLoading(false);
        return;
      }

      try {
        const profileRes = await apiClient.get('/profile');
        if (profileRes.data) {
          setUser(profileRes.data);
          await refreshUsage();
        }
      } catch (err) {
        console.warn('Session expired or invalid token', err);
        loginAsDemoUser();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      // In production, invoke Supabase auth.signInWithPassword
      const demoToken = email.includes('admin') ? 'demo-token-admin' : 'demo-token-user';
      localStorage.setItem('snapcut_auth_token', demoToken);
      setToken(demoToken);

      const profileRes = await apiClient.get('/profile');
      if (profileRes.data) {
        setUser(profileRes.data);
        await refreshUsage();
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password?: string, displayName?: string) => {
    setLoading(true);
    try {
      const demoToken = 'demo-token-user';
      localStorage.setItem('snapcut_auth_token', demoToken);
      setToken(demoToken);

      if (displayName) {
        await apiClient.put('/profile', { displayName });
      }
      const profileRes = await apiClient.get('/profile');
      if (profileRes.data) {
        setUser(profileRes.data);
        await refreshUsage();
      }
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemoUser = () => {
    const demoToken = 'demo-token-user';
    localStorage.setItem('snapcut_auth_token', demoToken);
    setToken(demoToken);
    setUser({
      id: '00000000-0000-0000-0000-000000000001',
      email: 'demo@snapcut.ai',
      displayName: 'Alex Rivers',
      role: 'user',
      plan: 'free'
    });
    setUsage({
      plan: 'free',
      planName: 'Free',
      dailyUsed: 0,
      dailyLimit: 5,
      remainingDaily: 5,
      creditBalance: 5,
      maxFileSizeMB: 10
    });
  };

  const loginAsDemoAdmin = () => {
    const demoToken = 'demo-token-admin';
    localStorage.setItem('snapcut_auth_token', demoToken);
    setToken(demoToken);
    setUser({
      id: '00000000-0000-0000-0000-000000000002',
      email: 'admin@snapcut.ai',
      displayName: 'SnapCut Admin',
      role: 'admin',
      plan: 'business'
    });
    setUsage({
      plan: 'business',
      planName: 'Business',
      dailyUsed: 3,
      dailyLimit: 100,
      remainingDaily: 97,
      creditBalance: 500,
      maxFileSizeMB: 25
    });
  };

  const logout = () => {
    localStorage.removeItem('snapcut_auth_token');
    setUser(null);
    setToken(null);
    setUsage(null);
  };

  const updateUserPlan = (newPlan: PlanTier, creditsToAdd: number = 0) => {
    if (user) {
      setUser({ ...user, plan: newPlan });
    }
    if (usage) {
      setUsage({
        ...usage,
        plan: newPlan,
        creditBalance: usage.creditBalance + creditsToAdd
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        usage,
        loading,
        login,
        signup,
        loginAsDemoUser,
        loginAsDemoAdmin,
        logout,
        refreshUsage,
        updateUserPlan
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
