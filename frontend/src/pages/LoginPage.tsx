import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { UserRole } from '../context/AuthContext';
import {
  ShieldCheck,
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  Building2,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Phone,
  Globe,
  Sparkles,
  ChevronLeft,
  User,
  BookOpen,
  Calendar,
  Layers,
} from 'lucide-react';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';

type LoginStep =
  | 'role-select'
  | 'google-continue'
  | 'user-setup'
  | 'head-email-pass';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, setupUserAccount, completePasswordChange, logout } = useAuth();

  const [step, setStep] = useState<LoginStep>('role-select');
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Google OAuth / Account state
  const [googleEmail, setGoogleEmail] = useState('');

  // Setup fields after Google Login (Full Name, Phone Number, Department, Year, Semester, Password)
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [year, setYear] = useState('3');
  const [semester, setSemester] = useState('6');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Direct email & password sign in fallback
  const [showDirectPasswordLogin, setShowDirectPasswordLogin] = useState(false);
  const [directEmail, setDirectEmail] = useState('');
  const [directPassword, setDirectPassword] = useState('');
  const [showDirectPass, setShowDirectPass] = useState(false);

  // Head login fields
  const [headEmail, setHeadEmail] = useState('');
  const [headPassword, setHeadPassword] = useState('');
  const [showHeadPass, setShowHeadPass] = useState(false);

  // Head first-time password reset modal
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const processedOAuthUserId = useRef<string | null>(null);
  const authActions = useRef({ login, logout });

  useEffect(() => {
    authActions.current = { login, logout };
  }, [login, logout]);

  // Check if user just returned from real Google OAuth redirect
  useEffect(() => {
    const processSessionUser = async (sessionUser: SupabaseAuthUser) => {
      if (!sessionUser) return;
      if (processedOAuthUserId.current === sessionUser.id) return;
      processedOAuthUserId.current = sessionUser.id;

      const userEmail = sessionUser.email || '';
      const userName =
        sessionUser.user_metadata?.full_name ||
        sessionUser.user_metadata?.name ||
        userEmail.split('@')[0] ||
        '';

      setGoogleEmail(userEmail);
      if (userName) setFullName(userName);
      const savedRole = localStorage.getItem('campus360_login_role');
      const intendedRole: UserRole = savedRole === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'STUDENT';
      setSelectedRole(intendedRole);
      setIsLoading(true);

      try {
        if (intendedRole === 'SUPER_ADMIN') {
          const { data: adminRec, error: adminError } = await supabase
            .from('admins')
            .select('*')
            .eq('email', userEmail.toLowerCase())
            .maybeSingle();
          if (adminError) throw new Error(`Unable to verify administrator access: ${adminError.message}`);
          if (!adminRec) {
            await authActions.current.logout();
            setError('This Google account is not registered as a Super Admin. Choose the Student role or contact your administrator.');
            setStep('google-continue');
            return;
          }

          if (adminRec) {
            if (adminRec.name) setFullName(adminRec.name);
            if (adminRec.phone) setPhoneNumber(adminRec.phone);
          }
          if (adminRec.name?.trim() && adminRec.phone?.replace(/\D/g, '').length >= 10) {
            navigate('/admin/dashboard', { replace: true });
            return;
          }
        } else {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', userEmail.toLowerCase())
            .maybeSingle();
          if (profileError) throw new Error(`Unable to load your student profile: ${profileError.message}`);
          if (profile) {
            if (profile.name) setFullName(profile.name);
            if (profile.phone) setPhoneNumber(profile.phone);
            if (profile.department) setDepartment(profile.department);
            if (profile.year) setYear(String(profile.year));
            if (profile.semester) setSemester(String(profile.semester));
            if (
              profile.phone?.replace(/\D/g, '').length >= 10 &&
              profile.department &&
              profile.year &&
              profile.semester
            ) {
              await authActions.current.login('STUDENT', userEmail);
              navigate('/dashboard', { replace: true });
              return;
            }
          }
        }
        setStep('user-setup');
      } catch (err) {
        processedOAuthUserId.current = null;
        console.error('Failed to finish Google sign-in:', err);
        setError(err instanceof Error ? err.message : 'Unable to finish Google sign-in. Please try again.');
        setStep('google-continue');
      } finally {
        setIsLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        window.setTimeout(() => {
          void processSessionUser(session.user);
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        processedOAuthUserId.current = null;
      }
    });

    void supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      if (sessionError) throw sessionError;
      if (session?.user) {
        window.setTimeout(() => {
          void processSessionUser(session.user);
        }, 0);
      }
    }).catch((err: unknown) => {
      console.error('Unable to restore Google sign-in:', err);
      setError(err instanceof Error ? err.message : 'Unable to restore your sign-in session.');
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);

  // Handle role selection
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError('');
    setShowDirectPasswordLogin(false);
    if (role === 'STUDENT' || role === 'SUPER_ADMIN') {
      setStep('google-continue');
      if (role === 'SUPER_ADMIN') {
        setDirectEmail('admin@campus360.edu');
      } else {
        setDirectEmail('student@campus360.edu');
      }
    } else {
      setStep('head-email-pass');
    }
  };

  // Handle clicking "Continue with Google" -> launches real Google OAuth directly
  const handleContinueWithGoogle = async () => {
    setError('');
    setIsLoading(true);
    localStorage.setItem('campus360_login_role', selectedRole);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error('Google OAuth redirect failed:', err);
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Google sign-in could not start. Please try again.');
    }
  };

  // Submit setup fields after Google (Full Name, Phone Number, Department, Year, Semester, Password)
  const handleUserSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    const cleanPhone = phoneNumber.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    if (selectedRole === 'STUDENT') {
      if (!department.trim()) {
        setError('Please select or enter your department.');
        return;
      }
      if (!year) {
        setError('Please select your academic year.');
        return;
      }
      if (!semester) {
        setError('Please select your semester.');
        return;
      }
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      await setupUserAccount({
        email: googleEmail.trim().toLowerCase(),
        name: fullName.trim(),
        phone: phoneNumber.trim(),
        password: password,
        role: selectedRole,
        department: selectedRole === 'STUDENT' ? department.trim() : undefined,
        year: selectedRole === 'STUDENT' ? Number(year) : undefined,
        semester: selectedRole === 'STUDENT' ? Number(semester) : undefined,
      });

      if (selectedRole === 'SUPER_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Account setup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Direct email & password submit (for users who already completed setup)
  const handleDirectPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(selectedRole, directEmail.trim(), directPassword);
      if (selectedRole === 'SUPER_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. If first time, please use Continue with Google.');
    } finally {
      setIsLoading(false);
    }
  };

  // Head login submit
  const handleHeadLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await login('HEAD', headEmail.trim(), headPassword);
      if (result.mustChangePassword) {
        setShowPasswordChangeModal(true);
        setIsLoading(false);
        return;
      }
      navigate('/head/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid head credentials. Please check with Super Admin.');
    } finally {
      setIsLoading(false);
    }
  };

  // Head first-time password change submit
  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    try {
      await completePasswordChange(newPassword, confirmNewPassword);
      setPasswordChangeSuccess(true);
      setTimeout(() => navigate('/head/dashboard'), 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 h-72 w-72 rounded-full bg-brand-orange/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 h-72 w-72 rounded-full bg-brand-pink/10 blur-3xl pointer-events-none" />

      {/* Top Left Logo */}
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-orange to-brand-pink text-white font-bold shadow-md">
          C
        </div>
        <div>
          <span className="font-bold text-lg text-slate-800">Campus</span>
          <span className="font-bold text-lg text-brand-orange">360</span>
        </div>
      </div>

      {/* ====== STEP 1: Role Select ====== */}
      {step === 'role-select' && (
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-xl relative z-10">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-orange to-brand-pink text-white mb-4 shadow-lg">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome to Campus360
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              One Campus. All Information. All Opportunities.
            </p>
          </div>

          <p className="mt-8 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
            Sign in as
          </p>

          <div className="mt-4 space-y-3">
            {/* Student Option */}
            <button
              onClick={() => handleRoleSelect('STUDENT')}
              className="w-full flex items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-5 text-left hover:border-brand-orange hover:bg-orange-50/30 transition-all group"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-orange to-brand-pink text-white shadow-sm">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-extrabold text-slate-900">Student</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Access notices, events, placements & semester resources
                </p>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-brand-orange border border-orange-100">
                <Globe className="h-3 w-3" />
                Google Login
              </div>
            </button>

            {/* Super Admin Option */}
            <button
              onClick={() => handleRoleSelect('SUPER_ADMIN')}
              className="w-full flex items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-5 text-left hover:border-slate-800 hover:bg-slate-50 transition-all group"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-extrabold text-slate-900">Super Admin</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Generate Head IDs, manage notices, scholarships & campus data
                </p>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700 border border-slate-200">
                <Globe className="h-3 w-3" />
                Google Login
              </div>
            </button>

            {/* Club / Department Head Option */}
            <button
              onClick={() => handleRoleSelect('HEAD')}
              className="w-full flex items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-5 text-left hover:border-indigo-500 hover:bg-indigo-50/30 transition-all group"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-sm">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-extrabold text-slate-900">Club / Department Head</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  IEEE, T&P, ACM, Cultural — post events & manage applicants
                </p>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-600 border border-indigo-100">
                <KeyRound className="h-3 w-3" />
                Admin Credentials
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ====== STEP 2: ONE BUTTON "CONTINUE WITH GOOGLE" (For Student and Super Admin) ====== */}
      {step === 'google-continue' && (
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl relative z-10 space-y-6">
          <button
            onClick={() => { setStep('role-select'); setError(''); }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to roles
          </button>

          <div className="text-center space-y-2">
            <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl mb-3 shadow-sm ${
              selectedRole === 'SUPER_ADMIN' ? 'bg-slate-900 text-white' : 'bg-orange-50 text-brand-orange'
            }`}>
              {selectedRole === 'SUPER_ADMIN' ? (
                <ShieldCheck className="h-7 w-7" />
              ) : (
                <GraduationCap className="h-7 w-7" />
              )}
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              {selectedRole === 'SUPER_ADMIN' ? 'Super Admin Portal' : 'Student Sign In'}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Continue with your Google account to access Campus360
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* GOOGLE SIGN IN OPTIONS */}
          <div className="pt-2 space-y-3">
            {/* Primary Browser Google OAuth */}
            <button
              type="button"
              id="google-continue-button"
              disabled={isLoading}
              onClick={handleContinueWithGoogle}
              className="w-full flex items-center justify-center gap-3.5 rounded-2xl border-2 border-slate-200 bg-white py-3.5 px-6 text-sm sm:text-base font-bold text-slate-800 shadow-md hover:border-slate-400 hover:bg-slate-50/80 hover:shadow-lg transition-all active:scale-[0.99] group disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
                  <span>Connecting to Google...</span>
                </div>
              ) : (
                <>
                  <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

          </div>

          {/* Fallback Direct Password Login toggle */}
          <div className="border-t border-slate-100 pt-4 text-center">
            <button
              type="button"
              onClick={() => setShowDirectPasswordLogin(!showDirectPasswordLogin)}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold underline transition-colors"
            >
              {showDirectPasswordLogin ? 'Hide password sign in' : 'Already set up password? Sign in with email'}
            </button>

            {showDirectPasswordLogin && (
              <form onSubmit={handleDirectPasswordSubmit} className="mt-4 space-y-3.5 text-left">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={directEmail}
                      onChange={(e) => setDirectEmail(e.target.value)}
                      required
                      placeholder="e.g. divyagsharma1415@gmail.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3.5 text-xs text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showDirectPass ? 'text' : 'password'}
                      value={directPassword}
                      onChange={(e) => setDirectPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-xs text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDirectPass(!showDirectPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showDirectPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Signing In...' : 'Sign In with Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ====== STEP 3: ASKS (1) FULL NAME, (2) PHONE NUMBER, (3) PASSWORD, (4) CONFIRM PASSWORD ====== */}
      {step === 'user-setup' && (
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl relative z-10 space-y-6">
          <button
            onClick={() => { setStep('google-continue'); setError(''); }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>

          {/* Connected Google Account Banner */}
          <div className="flex items-center justify-between rounded-2xl bg-emerald-50 border border-emerald-100 p-3.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-xs shrink-0 shadow-sm">
                {(fullName || googleEmail || 'U').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-xs truncate">{googleEmail}</p>
                <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Google Connected • {selectedRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Student'}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="hidden"
            />
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900">Set Up Your Profile & Password</h2>
            <p className="text-xs text-slate-400 font-medium">
              {selectedRole === 'STUDENT'
                ? 'Please enter your full name, phone number, academic details, and secure password'
                : 'Please enter your full name, phone number, and secure password'}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleUserSetupSubmit} className="space-y-4">
            {/* FIELD 1: Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Divya Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-4 text-sm text-slate-800 outline-none transition-all focus:border-brand-orange focus:bg-white"
                />
              </div>
            </div>

            {/* FIELD 2: Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-4 text-sm text-slate-800 outline-none transition-all focus:border-brand-orange focus:bg-white"
                />
              </div>
            </div>

            {/* ACADEMIC FIELDS: Department, Year & Semester (STUDENTS ONLY) */}
            {selectedRole === 'STUDENT' && (
              <>
                {/* FIELD 3: Department */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Department
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-10 text-sm text-slate-800 outline-none transition-all focus:border-brand-orange focus:bg-white appearance-none cursor-pointer"
                    >
                      <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                      <option value="Information Technology">Information Technology (IT)</option>
                      <option value="Electronics & Communication">Electronics & Communication (ECE)</option>
                      <option value="Mechanical Engineering">Mechanical Engineering (ME)</option>
                      <option value="Civil Engineering">Civil Engineering (CE)</option>
                      <option value="Electrical Engineering">Electrical Engineering (EE)</option>
                      <option value="Artificial Intelligence & Data Science">AI & Data Science (AI & DS)</option>
                      <option value="Business Administration">Business Administration (MBA / BBA)</option>
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                      ▼
                    </div>
                  </div>
                </div>

                {/* FIELDS 4 & 5: Year & Semester side-by-side */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Year
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        required
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-10 pr-6 text-sm text-slate-800 outline-none transition-all focus:border-brand-orange focus:bg-white appearance-none cursor-pointer"
                      >
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                        ▼
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Semester
                    </label>
                    <div className="relative">
                      <Layers className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        required
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-10 pr-6 text-sm text-slate-800 outline-none transition-all focus:border-brand-orange focus:bg-white appearance-none cursor-pointer"
                      >
                        <option value="1">Sem 1</option>
                        <option value="2">Sem 2</option>
                        <option value="3">Sem 3</option>
                        <option value="4">Sem 4</option>
                        <option value="5">Sem 5</option>
                        <option value="6">Sem 6</option>
                        <option value="7">Sem 7</option>
                        <option value="8">Sem 8</option>
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                        ▼
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* FIELD 3: Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-12 text-sm text-slate-800 outline-none transition-all focus:border-brand-orange focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* FIELD 4: Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-12 text-sm text-slate-800 outline-none transition-all focus:border-brand-orange focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Validation indicators */}
            <div className="flex items-center gap-4 text-[11px] text-slate-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${password.length >= 6 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                6+ characters
              </span>
              <span className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${password && password === confirmPassword ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                Passwords match
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white shadow-lg hover:opacity-95 hover:scale-[1.01] transition-all disabled:opacity-50 ${
                selectedRole === 'SUPER_ADMIN'
                  ? 'bg-slate-900 hover:bg-slate-800'
                  : 'bg-gradient-to-r from-brand-orange to-brand-pink'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving in Supabase...
                </span>
              ) : (
                <>
                  <span>
                    {selectedRole === 'SUPER_ADMIN' ? 'Enter Super Admin Dashboard' : 'Enter Campus360'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ====== STEP 4: Head Login ====== */}
      {step === 'head-email-pass' && (
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl relative z-10 space-y-6">
          <button
            onClick={() => { setStep('role-select'); setError(''); }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to roles
          </button>

          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-3">
              <Building2 className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Head Login</h2>
            <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
              Use the email & password generated by the Super Admin. You will set your own secure password on first login.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleHeadLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Admin-Generated Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="e.g. ieee.head@campus360.edu"
                  value={headEmail}
                  onChange={(e) => setHeadEmail(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-4 text-sm text-slate-800 outline-none transition-all focus:border-indigo-400 focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  Change on 1st login
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type={showHeadPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={headPassword}
                  onChange={(e) => setHeadPassword(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-12 text-sm text-slate-800 outline-none transition-all focus:border-indigo-400 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowHeadPass(!showHeadPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showHeadPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 text-sm font-bold text-white shadow-lg hover:opacity-95 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Authenticating...
                </span>
              ) : (
                <>
                  <span>Sign in as Head</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Head Accounts */}
          <div className="border-t border-slate-100 pt-4 space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Demo Head Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'IEEE Head', email: 'ieee.head@campus360.edu', pass: 'head123' },
                { label: 'T&P Head', email: 'tnp.head@campus360.edu', pass: 'head123' },
                { label: 'Cultural Head', email: 'cultural.head@campus360.edu', pass: 'head123' },
                { label: 'ACM Head', email: 'acm.head@campus360.edu', pass: 'head123' },
              ].map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => { setHeadEmail(demo.email); setHeadPassword(demo.pass); setError(''); }}
                  className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-2 text-left hover:bg-indigo-100/60 transition-colors"
                >
                  <p className="text-[11px] font-bold text-indigo-700">{demo.label}</p>
                  <p className="text-[10px] text-slate-500 font-medium truncate">{demo.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ====== HEAD FIRST-TIME PASSWORD CHANGE MODAL ====== */}
      {showPasswordChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <KeyRound className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">Set Your Permanent Password</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your account was created by the Super Admin. Please set your own secure password to continue.
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-600">
                {error}
              </div>
            )}

            {passwordChangeSuccess ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="font-bold text-slate-900">Password Set Successfully!</h4>
                <p className="text-xs text-slate-500">Redirecting to your Head Control Panel...</p>
              </div>
            ) : (
              <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-12 text-sm text-slate-800 outline-none transition-all focus:border-indigo-400 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-800 outline-none transition-all focus:border-indigo-400 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-400 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${newPassword.length >= 6 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    6+ characters
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${newPassword && newPassword === confirmNewPassword ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    Passwords match
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Password & Enter Dashboard'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
