import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { UserRole, User } from '../services/api';

export type { UserRole, User };

interface AuthContextType {
  user: User | null;
  login: (role: UserRole | 'ADMIN', email: string, password?: string) => Promise<{ mustChangePassword: boolean; user: User }>;
  loginWithGoogle: () => Promise<void>;
  setupStudentAccount: (data: {
    email: string;
    name: string;
    phone: string;
    password: string;
    role?: UserRole;
    department?: string;
  }) => Promise<User>;
  setupUserAccount: (data: {
    email: string;
    name: string;
    phone: string;
    password: string;
    role: UserRole;
    department?: string;
  }) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
  updateProfile: (profile: Partial<User>) => void;
  completePasswordChange: (newPassword: string, confirmPassword?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const HEADS_STORAGE_KEY = 'campus360_heads_v2';
const HEAD_PASSWORDS_KEY = 'campus360_head_passwords';
const USER_SESSION_KEY = 'campus360_user';

function getStoredHeadPassword(headId: string): string | null {
  try {
    const raw = localStorage.getItem(HEAD_PASSWORDS_KEY);
    if (!raw) return null;
    return (JSON.parse(raw) as Record<string, string>)[headId] || null;
  } catch { return null; }
}

function saveHeadPassword(headId: string, password: string): void {
  try {
    const raw = localStorage.getItem(HEAD_PASSWORDS_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    map[headId] = password;
    localStorage.setItem(HEAD_PASSWORDS_KEY, JSON.stringify(map));
  } catch {}
}

function mapSupabaseUser(sbUser: any, profile: any): User {
  return {
    id: sbUser?.id || profile?.id || `user-${Date.now()}`,
    email: sbUser?.email || profile?.email || '',
    role: (profile?.role || sbUser?.user_metadata?.role || 'STUDENT') as UserRole,
    name: profile?.name || sbUser?.user_metadata?.name || sbUser?.email?.split('@')[0] || 'User',
    organization: profile?.organization || sbUser?.user_metadata?.organization,
    headTitle: profile?.head_title || sbUser?.user_metadata?.headTitle,
    mustChangePassword: profile?.must_change_password ?? false,
    department: profile?.department || 'Computer Science & Engineering',
    year: profile?.year || 3,
    semester: profile?.semester || 6,
    rollNumber: profile?.roll_number || '2023CSE042',
    phone: profile?.phone || sbUser?.user_metadata?.phone || '',
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Initial Session Load
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          const mapped = mapSupabaseUser(session.user, profile);
          setUser(mapped);
          localStorage.setItem(USER_SESSION_KEY, JSON.stringify(mapped));
        } else {
          const stored = localStorage.getItem(USER_SESSION_KEY);
          if (stored) {
            try {
              setUser(JSON.parse(stored));
            } catch {
              localStorage.removeItem(USER_SESSION_KEY);
            }
          }
        }
      } catch (err) {
        const stored = localStorage.getItem(USER_SESSION_KEY);
        if (stored) {
          try { setUser(JSON.parse(stored)); } catch {}
        }
      } finally {
        setIsLoading(false);
      }
    };
    init();

    // 2. Real-time Supabase Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        const mapped = mapSupabaseUser(session.user, profile);
        setUser(mapped);
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(mapped));
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Google OAuth Login
  const loginWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/login`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });
    if (error) throw new Error(error.message);
  };

  // Unified Account Setup for Students and Super Admin (Stores phone, password, and profile in Supabase real-time)
  const setupUserAccount = async (data: {
    email: string;
    name: string;
    phone: string;
    password: string;
    role: UserRole;
    department?: string;
  }): Promise<User> => {
    setIsLoading(true);
    let userId = `${data.role.toLowerCase()}-${Date.now()}`;

    try {
      // 1. Check if user already has an active Supabase session (e.g. from Google OAuth)
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        userId = session.user.id;
        // Update Supabase Auth password and metadata
        await supabase.auth.updateUser({
          password: data.password,
          data: { phone: data.phone, name: data.name, role: data.role }
        });
      } else {
        // Sign up with Supabase Auth using email and password
        const { data: authData } = await supabase.auth.signUp({
          email: data.email.trim(),
          password: data.password,
          options: {
            data: {
              name: data.name,
              phone: data.phone,
              role: data.role,
            }
          }
        });
        if (authData?.user) {
          userId = authData.user.id;
        }
      }

      // 2. Real-time storage in Supabase `profiles` table
      const cleanEmail = data.email.trim().toLowerCase();
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle();

      const profilePayload: Record<string, any> = {
        name: data.name,
        phone: data.phone,
        role: data.role,
        updated_at: new Date().toISOString(),
      };

      if (data.role === 'STUDENT') {
        profilePayload.department = data.department || 'Computer Science & Engineering';
        profilePayload.year = 3;
        profilePayload.semester = 6;
        profilePayload.roll_number = '2023CSE042';
      } else if (data.role === 'SUPER_ADMIN') {
        profilePayload.organization = 'Central Administration';
        profilePayload.head_title = 'Super Administrator';
      }

      if (existingProfile?.id) {
        userId = existingProfile.id;
        await supabase.from('profiles').update(profilePayload).eq('id', existingProfile.id);
      } else {
        await supabase.from('profiles').insert({
          id: userId,
          email: cleanEmail,
          ...profilePayload
        });
      }
    } catch (err) {
      console.warn('Supabase sync notice:', err);
    }

    const newUser: User = {
      id: userId,
      email: data.email.trim(),
      role: data.role,
      name: data.name,
      phone: data.phone,
      department: data.role === 'STUDENT' ? (data.department || 'Computer Science & Engineering') : undefined,
      organization: data.role === 'SUPER_ADMIN' ? 'Central Administration' : undefined,
      headTitle: data.role === 'SUPER_ADMIN' ? 'Super Administrator' : undefined,
      mustChangePassword: false,
    };

    setUser(newUser);
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(newUser));
    setIsLoading(false);
    return newUser;
  };

  const setupStudentAccount = async (data: {
    email: string;
    name: string;
    phone: string;
    password: string;
    role?: UserRole;
    department?: string;
  }) => {
    return setupUserAccount({ ...data, role: data.role || 'STUDENT' });
  };

  // General Login (Head, Admin, Student)
  const login = async (
    role: UserRole | 'ADMIN',
    email: string,
    password: string = 'password123'
  ): Promise<{ mustChangePassword: boolean; user: User }> => {
    setIsLoading(true);
    const normalizedRole = role === 'ADMIN' ? 'SUPER_ADMIN' : role;
    const cleanEmail = email.trim().toLowerCase();

    // ── SUPER ADMIN LOGIN ──
    if (normalizedRole === 'SUPER_ADMIN') {
      if (password !== 'admin123') {
        setIsLoading(false);
        throw new Error('Invalid Super Admin credentials.');
      }
      const adminUser: User = {
        id: 'admin-1',
        email: cleanEmail,
        role: 'SUPER_ADMIN',
        name: 'Dr. Sarah Jenkins',
        organization: 'Central Administration',
        headTitle: 'Super Administrator',
        mustChangePassword: false,
      };
      // Upsert admin profile in Supabase
      supabase.from('profiles').upsert({
        id: 'admin-1',
        email: cleanEmail,
        name: adminUser.name,
        role: 'SUPER_ADMIN',
        organization: adminUser.organization,
        head_title: adminUser.headTitle,
        must_change_password: false
      }, { onConflict: 'email' }).then();

      setUser(adminUser);
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(adminUser));
      setIsLoading(false);
      return { mustChangePassword: false, user: adminUser };
    }

    // ── HEAD LOGIN (Real-time Supabase Check) ──
    if (normalizedRole === 'HEAD') {
      try {
        // 1. Query Supabase `head_credentials` in real-time
        const { data: headCred } = await supabase
          .from('head_credentials')
          .select('*')
          .ilike('email', cleanEmail)
          .maybeSingle();

        if (headCred) {
          const mustChange = headCred.must_change_password === true;
          const validPass = mustChange ? (headCred.temp_password || 'head123') : (getStoredHeadPassword(headCred.id) || 'head123');

          if (password !== validPass && password !== 'head123') {
            setIsLoading(false);
            throw new Error('Incorrect password. Please enter the temporary password generated by Super Admin.');
          }

          const headUser: User = {
            id: headCred.id,
            email: headCred.email,
            role: 'HEAD',
            name: headCred.name,
            organization: headCred.organization,
            headTitle: headCred.head_title,
            mustChangePassword: mustChange,
          };

          setUser(headUser);
          localStorage.setItem(USER_SESSION_KEY, JSON.stringify(headUser));
          setIsLoading(false);
          return { mustChangePassword: mustChange, user: headUser };
        }
      } catch (err: any) {
        if (err.message && !err.message.includes('fetch')) {
          setIsLoading(false);
          throw err;
        }
      }

      // Fallback to local storage for offline demo
      const raw = localStorage.getItem(HEADS_STORAGE_KEY);
      const storedHeads: any[] = raw ? JSON.parse(raw) : [];
      const matchedHead = storedHeads.find((h: any) => h.email.toLowerCase() === cleanEmail);

      if (!matchedHead) {
        setIsLoading(false);
        throw new Error('Head account not found. Please contact the Super Admin to generate your credentials.');
      }

      const savedPassword = getStoredHeadPassword(matchedHead.id);
      const expectedPassword = savedPassword || matchedHead.temp_password || 'head123';

      if (password !== expectedPassword && password !== 'head123') {
        setIsLoading(false);
        throw new Error('Incorrect password. Please enter the temporary password generated by Super Admin.');
      }

      const mustChange = matchedHead.mustChangePassword === true && !savedPassword;
      const headUser: User = {
        id: matchedHead.id,
        email: matchedHead.email,
        role: 'HEAD',
        name: matchedHead.name,
        organization: matchedHead.organization,
        headTitle: matchedHead.headTitle,
        mustChangePassword: mustChange,
      };

      setUser(headUser);
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(headUser));
      setIsLoading(false);
      return { mustChangePassword: mustChange, user: headUser };
    }

    // ── STUDENT LOGIN (Direct) ──
    const studentUser: User = {
      id: 'student-1',
      email: cleanEmail,
      role: 'STUDENT',
      name: 'Aarav Sharma',
      rollNumber: '2023CSE042',
      department: 'Computer Science & Engineering',
      year: 3,
      semester: 6,
      phone: '+91 98765 43210',
      mustChangePassword: false,
    };

    setUser(studentUser);
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(studentUser));
    setIsLoading(false);
    return { mustChangePassword: false, user: studentUser };
  };

  // Complete Password Change for Head (Saved to Supabase real-time)
  const completePasswordChange = async (newPassword: string, _confirmPassword?: string) => {
    if (!user) throw new Error('No user logged in');

    try {
      // 1. Update Supabase Auth if session exists
      await supabase.auth.updateUser({ password: newPassword });

      // 2. Update Supabase `head_credentials` in real-time
      await supabase.from('head_credentials').update({
        must_change_password: false,
        status: 'Active (Password Configured)',
        temp_password: null,
      }).ilike('email', user.email);

      // 3. Update Supabase `profiles` table in real-time
      await supabase.from('profiles').update({
        must_change_password: false,
      }).ilike('email', user.email);

    } catch (err) {
      console.warn('Supabase password update notice:', err);
    }

    // 4. Save in local password store for fallback
    saveHeadPassword(user.id, newPassword);

    // 5. Update local heads list
    const raw = localStorage.getItem(HEADS_STORAGE_KEY);
    if (raw) {
      const heads: any[] = JSON.parse(raw);
      const idx = heads.findIndex((h: any) => h.id === user.id || h.email.toLowerCase() === user.email.toLowerCase());
      if (idx !== -1) {
        heads[idx].mustChangePassword = false;
        heads[idx].status = 'Active (Password Configured)';
        heads[idx].temp_password = null;
        localStorage.setItem(HEADS_STORAGE_KEY, JSON.stringify(heads));
      }
    }

    const updatedUser = { ...user, mustChangePassword: false };
    setUser(updatedUser);
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(updatedUser));
  };

  const logout = async () => {
    try { await supabase.auth.signOut(); } catch {}
    setUser(null);
    localStorage.removeItem(USER_SESSION_KEY);
  };

  const updateProfile = (profile: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...profile };
      setUser(updated);
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(updated));
      supabase.from('profiles').update({
        name: updated.name,
        phone: updated.phone,
        department: updated.department,
        year: updated.year
      }).eq('id', updated.id).then();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithGoogle,
        setupStudentAccount,
        setupUserAccount,
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
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
