import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { UserRole, User } from '../services/api';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';

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
    year?: number | string;
    semester?: number | string;
    rollNumber?: string;
  }) => Promise<User>;
  setupUserAccount: (data: {
    email: string;
    name: string;
    phone: string;
    password: string;
    role: UserRole;
    department?: string;
    year?: number | string;
    semester?: number | string;
    rollNumber?: string;
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

export function isValidUUID(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function mapSupabaseUser(sbUser: any, profile: any): User {
  return {
    id: profile?.id || sbUser?.id || generateUUID(),
    email: profile?.email || sbUser?.email || '',
    role: (profile?.role || sbUser?.user_metadata?.role || 'STUDENT') as UserRole,
    name: profile?.name || sbUser?.user_metadata?.name || sbUser?.email?.split('@')[0] || 'User',
    organization: profile?.organization || sbUser?.user_metadata?.organization,
    headTitle: profile?.head_title || sbUser?.user_metadata?.headTitle,
    mustChangePassword: profile?.must_change_password ?? false,
    department: profile?.department || undefined,
    year: profile?.year || undefined,
    semester: profile?.semester || undefined,
    rollNumber: profile?.roll_number || undefined,
    phone: profile?.phone || sbUser?.user_metadata?.phone || '',
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const syncUserFromSession = async (sessionUser: SupabaseAuthUser) => {
      const email = sessionUser.email;
      if (!email) throw new Error('Google did not return an email address.');

      const { data: adminRec, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      if (adminError) throw new Error(`Unable to load administrator profile: ${adminError.message}`);

      let appUser: User;
      if (adminRec) {
        appUser = {
          id: adminRec.id,
          email: adminRec.email,
          role: 'SUPER_ADMIN',
          name: adminRec.name,
          phone: adminRec.phone,
          organization: adminRec.organization,
          headTitle: adminRec.head_title,
          mustChangePassword: false,
        };
      } else {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionUser.id)
          .maybeSingle();
        if (profileError) throw new Error(`Unable to load student profile: ${profileError.message}`);
        appUser = mapSupabaseUser(sessionUser, profile);
      }

      setUser(appUser);
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(appUser));
    };

    const init = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session?.user) {
          await syncUserFromSession(session.user);
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
        console.error('Failed to restore Campus360 session:', err);
        const stored = localStorage.getItem(USER_SESSION_KEY);
        if (stored) {
          try { setUser(JSON.parse(stored)); } catch {}
        }
      } finally {
        setIsLoading(false);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        window.setTimeout(() => {
          void syncUserFromSession(session.user).catch((err: unknown) => {
            console.error('Failed to sync signed-in Campus360 user:', err);
          });
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem(USER_SESSION_KEY);
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

  // Account Setup for Students — writes to `profiles` table
  // Account Setup for Super Admin — writes to `admins` table
  const setupUserAccount = async (data: {
    email: string;
    name: string;
    phone: string;
    password: string;
    role: UserRole;
    department?: string;
    year?: number | string;
    semester?: number | string;
    rollNumber?: string;
  }): Promise<User> => {
    setIsLoading(true);
    const cleanEmail = data.email.trim().toLowerCase();
    let userId: string = generateUUID();

    try {
      // 1. Check or establish Supabase Auth session
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        userId = session.user.id;
        try {
          await supabase.auth.updateUser({
            password: data.password,
            data: { phone: data.phone, name: data.name, role: data.role }
          });
        } catch (e) {
          console.warn('Supabase auth update notice:', e);
        }
      } else {
        try {
          const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email: cleanEmail,
            password: data.password,
            options: { data: { name: data.name, phone: data.phone, role: data.role } }
          });
          if (authData?.user?.id) {
            userId = authData.user.id;
          } else if (signUpError) {
            const { data: signInData } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: data.password });
            if (signInData?.user?.id) {
              userId = signInData.user.id;
              await supabase.auth.updateUser({ password: data.password, data: { phone: data.phone, name: data.name, role: data.role } });
            }
          }
        } catch (authErr) {
          console.warn('Supabase auth signup attempt:', authErr);
        }
      }

      // 2a. SUPER_ADMIN → write to `admins` table (no academic fields)
      if (data.role === 'SUPER_ADMIN') {
        const adminPayload = {
          email: cleanEmail,
          name: data.name,
          phone: data.phone || null,
          organization: 'Central Administration',
          head_title: 'Super Administrator',
          updated_at: new Date().toISOString(),
        };
        const { data: existingAdmin } = await supabase.from('admins').select('id').eq('email', cleanEmail).maybeSingle();
        if (existingAdmin?.id) {
          userId = existingAdmin.id;
          await supabase.from('admins').update(adminPayload).eq('id', existingAdmin.id);
        } else {
          const { data: inserted } = await supabase.from('admins').insert({ id: userId, ...adminPayload }).select().maybeSingle();
          if (inserted?.id) userId = inserted.id;
        }
      } else {
        // 2b. STUDENT → write to `profiles` table (with academic fields)
        const profilePayload: Record<string, any> = {
          email: cleanEmail,
          name: data.name,
          phone: data.phone,
          role: data.role,
          department: data.department || 'Computer Science & Engineering',
          year: data.year ? Number(data.year) : 3,
          semester: data.semester ? Number(data.semester) : 6,
          updated_at: new Date().toISOString(),
        };
        const { data: existingProfile } = await supabase.from('profiles').select('id').eq('email', cleanEmail).maybeSingle();
        if (existingProfile?.id) {
          userId = existingProfile.id;
          await supabase.from('profiles').update(profilePayload).eq('id', existingProfile.id);
        } else {
          const { data: inserted, error: insertErr } = await supabase.from('profiles').insert({ id: userId, ...profilePayload }).select().maybeSingle();
          if (inserted?.id) userId = inserted.id;
          if (insertErr) await supabase.from('profiles').update(profilePayload).eq('email', cleanEmail);
        }
      }
    } catch (err) {
      console.warn('Supabase sync notice:', err);
    }

    const newUser: User = {
      id: userId,
      email: cleanEmail,
      role: data.role,
      name: data.name,
      phone: data.phone,
      department: data.role === 'STUDENT' ? (data.department || 'Computer Science & Engineering') : undefined,
      year: data.role === 'STUDENT' ? (data.year ? Number(data.year) : 3) : undefined,
      semester: data.role === 'STUDENT' ? (data.semester ? Number(data.semester) : 6) : undefined,
      rollNumber: data.role === 'STUDENT' ? (data.rollNumber || '2023CSE042') : undefined,
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
    year?: number | string;
    semester?: number | string;
    rollNumber?: string;
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

    // ── SUPER ADMIN LOGIN (reads from `admins` table) ──
    if (normalizedRole === 'SUPER_ADMIN') {
      if (password !== 'admin123') {
        setIsLoading(false);
        throw new Error('Invalid Super Admin credentials.');
      }

      let adminId = generateUUID();
      let adminName = 'Dr. Sarah Jenkins';
      let adminPhone: string | undefined;
      try {
        const { data: adminRec } = await supabase
          .from('admins')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();
        if (adminRec) {
          adminId = adminRec.id;
          adminName = adminRec.name || adminName;
          adminPhone = adminRec.phone;
        } else {
          // Insert into admins table
          const { data: newAdmin } = await supabase.from('admins').insert({
            id: adminId,
            email: cleanEmail,
            name: adminName,
            organization: 'Central Administration',
            head_title: 'Super Administrator',
          }).select().maybeSingle();
          if (newAdmin?.id) adminId = newAdmin.id;
        }
      } catch (e) {
        console.warn('Admin lookup notice:', e);
      }

      const adminUser: User = {
        id: adminId,
        email: cleanEmail,
        role: 'SUPER_ADMIN',
        name: adminName,
        phone: adminPhone,
        organization: 'Central Administration',
        headTitle: 'Super Administrator',
        mustChangePassword: false,
      };

      setUser(adminUser);
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(adminUser));
      setIsLoading(false);
      return { mustChangePassword: false, user: adminUser };
    }

    // ── HEAD LOGIN (queries `heads` table first, falls back to `head_credentials`) ──
    if (normalizedRole === 'HEAD') {
      try {
        // Use the credential table configured for the head management workflow first.
        let headCred: any = null;
        const { data: credentialRec, error: credentialError } = await supabase
          .from('head_credentials')
          .select('*')
          .ilike('email', cleanEmail)
          .maybeSingle();
        if (credentialError) throw new Error(`Unable to look up head credentials: ${credentialError.message}`);
        if (credentialRec) {
          headCred = credentialRec;
        } else {
          const { data: headRec, error: headError } = await supabase
            .from('heads')
            .select('*')
            .ilike('email', cleanEmail)
            .maybeSingle();
          if (headError) throw new Error(`Unable to look up the head account: ${headError.message}`);
          if (headRec) headCred = headRec;
        }

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
            phone: headCred.phone,
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
    let studentId = generateUUID();
    let studentName = 'Aarav Sharma';
    let rollNum = '2023CSE042';
    let dept = 'Computer Science & Engineering';
    let phoneNum = '+91 98765 43210';

    try {
      const { data: stdProf } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();
      if (stdProf) {
        studentId = stdProf.id;
        studentName = stdProf.name || studentName;
        rollNum = stdProf.roll_number || rollNum;
        dept = stdProf.department || dept;
        phoneNum = stdProf.phone || phoneNum;
      }
    } catch (e) {}

    const studentUser: User = {
      id: studentId,
      email: cleanEmail,
      role: 'STUDENT',
      name: studentName,
      rollNumber: rollNum,
      department: dept,
      year: 3,
      semester: 6,
      phone: phoneNum,
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

      // 2. Update `heads` table (primary)
      await supabase.from('heads').update({
        must_change_password: false,
        status: 'Active (Password Configured)',
        temp_password: null,
      }).ilike('email', user.email);

      // 3. Also update legacy `head_credentials` for compatibility
      await supabase.from('head_credentials').update({
        must_change_password: false,
        status: 'Active (Password Configured)',
        temp_password: null,
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
