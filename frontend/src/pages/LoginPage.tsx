import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  AlertCircle
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, completePasswordChange } = useAuth();
  
  // 3 distinct roles: STUDENT, SUPER_ADMIN, HEAD
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // First-time password reset state for Heads
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!email.trim() || !password) {
        throw new Error('Please enter your login ID / email and password');
      }

      const result = await login(role, email.trim(), password);

      // If user is a Head with mustChangePassword flag set
      if (result.mustChangePassword) {
        setShowPasswordChangeModal(true);
        setIsLoading(false);
        return;
      }

      // Normal navigation based on role
      redirectBasedOnRole(result.user.role);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const redirectBasedOnRole = (userRole: UserRole) => {
    if (userRole === 'SUPER_ADMIN') {
      navigate('/admin/dashboard');
    } else if (userRole === 'HEAD') {
      navigate('/head/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match! Please check confirm password.');
      return;
    }

    setIsLoading(true);
    try {
      await completePasswordChange(newPassword, confirmPassword);
      setPasswordChangeSuccess(true);
      setTimeout(() => {
        navigate('/head/dashboard');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Try again.');
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (selectedRole: UserRole, demoEmail: string, demoPass: string) => {
    setError('');
    setRole(selectedRole);
    setEmail(demoEmail);
    setPassword(demoPass);
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

      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-xl relative z-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Portal Login
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            One Campus. All Information. All Opportunities.
          </p>
        </div>

        {/* 3 Role Selector Tabs */}
        <div className="mt-8 grid grid-cols-3 gap-1 rounded-2xl bg-slate-100/80 p-1.5 border border-slate-200/60">
          {/* Tab 1: Student */}
          <button
            type="button"
            onClick={() => {
              setRole('STUDENT');
              setError('');
            }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-xl py-2.5 px-2 text-xs font-bold transition-all ${
              role === 'STUDENT'
                ? 'bg-white text-brand-orange shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Student</span>
          </button>

          {/* Tab 2: Super Admin */}
          <button
            type="button"
            onClick={() => {
              setRole('SUPER_ADMIN');
              setError('');
            }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-xl py-2.5 px-2 text-xs font-bold transition-all ${
              role === 'SUPER_ADMIN'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Super Admin</span>
          </button>

          {/* Tab 3: Head (IEEE, T&P, etc.) */}
          <button
            type="button"
            onClick={() => {
              setRole('HEAD');
              setError('');
            }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-xl py-2.5 px-2 text-xs font-bold transition-all ${
              role === 'HEAD'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Club / Dept Head</span>
          </button>
        </div>

        {/* Role Sub-caption */}
        <div className="mt-3 text-center">
          {role === 'STUDENT' && (
            <span className="text-[11px] font-semibold text-slate-400">
              Access notices, events, placements, and semester resources
            </span>
          )}
          {role === 'SUPER_ADMIN' && (
            <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Super Admin: Generate Head IDs, monitor social feed & manage all campus posts
            </span>
          )}
          {role === 'HEAD' && (
            <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              IEEE Head, T&P Head, ACM Head & Club Leads: Post events & view applied students
            </span>
          )}
        </div>

        {error && (
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-600">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Email / Login ID */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              {role === 'HEAD' ? 'Generated Head Login ID / Email' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder={
                  role === 'HEAD'
                    ? 'e.g. ieee.head@campus360.edu'
                    : role === 'SUPER_ADMIN'
                    ? 'admin@campus360.edu'
                    : 'student@campus360.edu'
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-4 text-sm text-slate-800 outline-none transition-all focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                {role === 'HEAD' ? 'Temporary or Permanent Password' : 'Password'}
              </label>
              {role === 'HEAD' && (
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  Prompted to change on 1st login
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-12 text-sm text-slate-800 outline-none transition-all focus:border-slate-400 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white shadow-lg transition-all disabled:opacity-50 ${
              role === 'SUPER_ADMIN'
                ? 'bg-slate-900 hover:bg-slate-800'
                : role === 'HEAD'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95'
                : 'bg-gradient-to-r from-brand-orange to-brand-pink hover:opacity-95 hover:scale-[1.01]'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Authenticating...
              </span>
            ) : (
              <>
                <span>Sign in as {role === 'SUPER_ADMIN' ? 'Super Admin' : role === 'HEAD' ? 'Club / Dept Head' : 'Student'}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Click Demo Access Pills */}
        <div className="mt-8 border-t border-slate-100 pt-6 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
            One-Click Demo Credentials:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleQuickLogin('STUDENT', 'student@campus360.edu', 'student123')}
              className="rounded-xl border border-orange-200 bg-orange-50/50 p-2 text-left text-orange-900 hover:bg-orange-100/60 transition-colors"
            >
              <div className="font-bold flex items-center gap-1.5 text-brand-orange">
                <GraduationCap className="h-3.5 w-3.5" />
                Student
              </div>
              <span className="text-[10px] text-slate-500 font-normal">student@campus360.edu</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('SUPER_ADMIN', 'admin@campus360.edu', 'admin123')}
              className="rounded-xl border border-slate-300 bg-slate-100/60 p-2 text-left text-slate-900 hover:bg-slate-200/60 transition-colors"
            >
              <div className="font-bold flex items-center gap-1.5 text-slate-800">
                <ShieldCheck className="h-3.5 w-3.5" />
                Super Admin
              </div>
              <span className="text-[10px] text-slate-500 font-normal">admin@campus360.edu</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('HEAD', 'ieee.head@campus360.edu', 'head123')}
              className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-2 text-left text-indigo-900 hover:bg-indigo-100/60 transition-colors"
            >
              <div className="font-bold flex items-center gap-1.5 text-indigo-700">
                <Building2 className="h-3.5 w-3.5" />
                IEEE Head (1st Login)
              </div>
              <span className="text-[10px] text-slate-500 font-normal">ieee.head@campus360.edu</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('HEAD', 'tnp.head@campus360.edu', 'head123')}
              className="rounded-xl border border-purple-200 bg-purple-50/50 p-2 text-left text-purple-900 hover:bg-purple-100/60 transition-colors"
            >
              <div className="font-bold flex items-center gap-1.5 text-purple-700">
                <Building2 className="h-3.5 w-3.5" />
                T&P Head (1st Login)
              </div>
              <span className="text-[10px] text-slate-500 font-normal">tnp.head@campus360.edu</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
          FIRST-TIME LOGIN PASSWORD SETUP MODAL FOR CLUB/DEPT HEADS
          (Requested: "when head put there login id pass they will get an option of password and confirm password")
          ============================================================ */}
      {showPasswordChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <KeyRound className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">Set Your Permanent Password</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Welcome, Head! Your account was generated by the Super Admin with a temporary password. Please configure your new secure password to proceed.
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
                <h4 className="font-bold text-slate-900">Password Configured Successfully!</h4>
                <p className="text-xs text-slate-500">Redirecting to your Head Control Panel...</p>
              </div>
            ) : (
              <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    New Password
                  </label>
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

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-800 outline-none transition-all focus:border-indigo-400 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Validation helper badge */}
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${newPassword.length >= 6 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  At least 6 characters
                  <span className={`h-2 w-2 rounded-full ml-3 ${newPassword && newPassword === confirmPassword ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  Passwords match
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Saving Password...' : 'Save Password & Enter Dashboard'}
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
