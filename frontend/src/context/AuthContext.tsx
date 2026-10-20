import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, type UserRole, type User } from '../services/api';

export type { UserRole, User };

interface AuthContextType {
  user: User | null;
  login: (role: UserRole | 'ADMIN', email: string, password?: string) => Promise<{ mustChangePassword: boolean; user: User }>;
  logout: () => void;
  isLoading: boolean;
  updateProfile: (profile: Partial<User>) => void;
  completePasswordChange: (newPassword: string, confirmPassword?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Head credential storage key (must match api.ts STORAGE_KEYS.HEADS)
const HEADS_STORAGE_KEY = 'campus360_heads_v2';
// Passwords set by heads after first-time login
const HEAD_PASSWORDS_KEY = 'campus360_head_passwords';

function getStoredHeadPassword(headId: string): string | null {
  try {
    const raw = localStorage.getItem(HEAD_PASSWORDS_KEY);
    if (!raw) return null;
    const map: Record<string, string> = JSON.parse(raw);
    return map[headId] || null;
  } catch {
    return null;
  }
}

function saveHeadPassword(headId: string, password: string): void {
  try {
    const raw = localStorage.getItem(HEAD_PASSWORDS_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    map[headId] = password;
    localStorage.setItem(HEAD_PASSWORDS_KEY, JSON.stringify(map));
  } catch (err) {
    console.error('Failed to save head password:', err);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for session
    const storedUser = localStorage.getItem('campus360_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('campus360_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (role: UserRole | 'ADMIN', email: string, password: string = 'password123') => {
    setIsLoading(true);
    const normalizedRole = role === 'ADMIN' ? 'SUPER_ADMIN' : role;

    try {
      // Attempt backend login first
      const res = await api.login(email, password, normalizedRole);
      const authenticatedUser = res.user;

      setUser(authenticatedUser);
      localStorage.setItem('campus360_user', JSON.stringify(authenticatedUser));
      setIsLoading(false);

      return {
        mustChangePassword: !!authenticatedUser.mustChangePassword,
        user: authenticatedUser,
      };
    } catch (err: any) {
      // Fallback in-memory authentication if backend is unreachable
      console.warn('Backend login fallback:', err.message);

      let mockUser: User;
      let mustChange = false;

      if (normalizedRole === 'SUPER_ADMIN') {
        // Admin credentials check
        if (password !== 'admin123') {
          setIsLoading(false);
          throw new Error('Invalid admin credentials.');
        }
        mockUser = {
          id: 'admin-1',
          email,
          role: 'SUPER_ADMIN',
          name: 'Dr. Sarah Jenkins',
          organization: 'Central Administration',
          headTitle: 'Super Administrator & Dean',
          mustChangePassword: false,
        };
      } else if (normalizedRole === 'HEAD') {
        // Look up ALL stored head accounts (includes newly generated heads)
        let storedHeads: any[] = [];
        try {
          const raw = localStorage.getItem(HEADS_STORAGE_KEY);
          if (raw) storedHeads = JSON.parse(raw);
        } catch {}

        const matchedHead = storedHeads.find(
          (h: any) => h.email.toLowerCase() === email.trim().toLowerCase()
        );

        if (!matchedHead) {
          setIsLoading(false);
          throw new Error('Head account not found. Please check your email or contact Super Admin.');
        }

        // Verify password: check saved permanent password first, fallback to 'head123' for seed demo accounts
        const savedPermanentPassword = getStoredHeadPassword(matchedHead.id);
        const validPassword = savedPermanentPassword || 'head123';

        if (password !== validPassword) {
          setIsLoading(false);
          throw new Error('Incorrect password. Please try again.');
        }

        mustChange = matchedHead.mustChangePassword === true && !savedPermanentPassword;
        mockUser = {
          id: matchedHead.id,
          email: matchedHead.email,
          role: 'HEAD',
          name: matchedHead.name,
          organization: matchedHead.organization,
          headTitle: matchedHead.headTitle,
          mustChangePassword: mustChange,
        };
      } else {
        // STUDENT login (Google OAuth handles real login; this is demo fallback)
        mockUser = {
          id: 'student-1',
          email,
          role: 'STUDENT',
          name: 'Aarav Sharma',
          rollNumber: '2023CSE042',
          department: 'Computer Science & Engineering',
          year: 3,
          semester: 6,
          phone: '+91 98765 43210',
          mustChangePassword: false,
        };
      }

      setUser(mockUser);
      localStorage.setItem('campus360_user', JSON.stringify(mockUser));
      setIsLoading(false);

      return {
        mustChangePassword: mustChange,
        user: mockUser,
      };
    }
  };

  const completePasswordChange = async (newPassword: string, confirmPassword?: string) => {
    if (!user) throw new Error('No user is currently logged in');

    try {
      await api.changePassword({
        userId: user.id,
        email: user.email,
        newPassword,
        confirmPassword: confirmPassword || newPassword,
      });
    } catch (err) {
      console.warn('Backend change password fallback:', err);
    }

    // Save the new password locally so the head can log in with it next time
    if (user.role === 'HEAD') {
      saveHeadPassword(user.id, newPassword);

      // Also update the head account's mustChangePassword flag in the heads store
      try {
        const raw = localStorage.getItem(HEADS_STORAGE_KEY);
        if (raw) {
          const heads: any[] = JSON.parse(raw);
          const idx = heads.findIndex((h: any) => h.id === user.id);
          if (idx !== -1) {
            heads[idx].mustChangePassword = false;
            heads[idx].status = 'Active (Password Configured)';
            localStorage.setItem(HEADS_STORAGE_KEY, JSON.stringify(heads));
          }
        }
      } catch {}
    }

    const updatedUser = { ...user, mustChangePassword: false };
    setUser(updatedUser);
    localStorage.setItem('campus360_user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('campus360_user');
  };

  const updateProfile = (profile: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...profile };
      setUser(updated);
      localStorage.setItem('campus360_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        updateProfile,
        completePasswordChange,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
