'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'subscriber' | 'manager';
  parent_user_id?: number;
  can_add_users: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to check if auth cookie exists (synchronous)
function hasAuthCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some(c => c.trim().startsWith('auth-token='));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Check cookie synchronously on initialization to prevent flash
  const [user, setUser] = useState<User | null>(null);
  // If cookie exists, we need to check auth; otherwise we know user is null
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      return hasAuthCookie();
    }
    return true; // SSR: always start loading
  });

  const fetchUser = async () => {
    // If no cookie, skip fetch and set loading to false immediately
    if (typeof window !== 'undefined' && !hasAuthCookie()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

