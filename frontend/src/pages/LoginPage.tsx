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
  AlertCircle,
  Phone,
  Globe,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';

// Simulated Google OAuth users (real integration would use Supabase OAuth)
const GOOGLE_DEMO_USERS = [
  { email: 'student@campus360.edu', name: 'Aarav Sharma', avatar: 'AS', dept: 'CSE' },
  { email: 'priya.verma@campus360.edu', name: 'Priya Verma', avatar: 'PV', dept: 'ECE' },
  { email: 'rohit.mehta@campus360.edu', name: 'Rohit Mehta', avatar: 'RM', dept: 'IT' },
];

type LoginStep =
  | 'role-select'
  | 'student-google'
  | 'student-setup'
  | 'head-email-pass'
  | 'admin-email-pass';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, completePasswordChange } = useAuth();

  const [step, setStep] = useState<LoginStep>('role-select');
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Google OAuth simulated state
  const [googleUser, setGoogleUser] = useState<(typeof GOOGLE_DEMO_USERS)[0] | null>(null);
  const [showGooglePicker, setShowGooglePicker] = useState(false);

  // Student setup form (after Google)
  const [phoneNumber, setPhoneNumber] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentConfirmPassword, setStudentConfirmPassword] = useState('');
  const [showStudentPass, setShowStudentPass] = useState(false);

  // Head login fields
  const [headEmail, setHeadEmail] = useState('');
  const [headPassword, setHeadPassword] = useState('');
  const [showHeadPass, setShowHeadPass] = useState(false);

  // Admin login fields
  const [adminEmail, setAdminEmail] = useState('admin@campus360.edu');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);

  // First-time Head password reset modal
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  // — Step: Role select
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError('');
    if (role === 'STUDENT') {
      setStep('student-google');
    } else if (role === 'HEAD') {
      setStep('head-email-pass');
    } else {
      setStep('admin-email-pass');
    }
  };

  // — Google OAuth simulation
  const handleGoogleSignIn = (gUser: (typeof GOOGLE_DEMO_USERS)[0]) => {
    setGoogleUser(gUser);
    setShowGooglePicker(false);
    setStep('student-setup');
    setError('');
  };

  // — Student setup submit (after Google)
  const handleStudentSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phoneNumber.trim() || phoneNumber.trim().length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    if (!studentPassword || studentPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (studentPassword !== studentConfirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      await login('STUDENT', googleUser!.email, 'student123');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // — Head login submit
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

  // — Admin login submit
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login('SUPER_ADMIN', adminEmail.trim(), adminPassword);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid admin credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // — Head first-time password change
  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    try {
      await completePasswordChange(newPassword, confirmPassword);
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

            {/* Head Option */}
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

            {/* Super Admin Option */}
            <button
              onClick={() => handleRoleSelect('SUPER_ADMIN')}
              className="w-full flex items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-5 text-left hover:border-slate-700 hover:bg-slate-50 transition-all group"
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
              <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 border border-slate-200">
                <Lock className="h-3 w-3" />
                Secure Access
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ====== STEP 2A: Student – Google Sign In ====== */}
      {step === 'student-google' && (
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl relative z-10 space-y-6">
          <button
            onClick={() => { setStep('role-select'); setError(''); }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>

          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-brand-orange mb-3">
              <GraduationCap className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Student Sign In</h2>
            <p className="text-xs text-slate-400 font-medium">
              Continue with your college Google account
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Button */}
          <button
            onClick={() => { setShowGooglePicker(true); setError(''); }}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-slate-200 bg-white py-4 text-sm font-bold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-all shadow-sm"
          >
            {/* Google SVG Icon */}
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="text-center">
            <p className="text-[11px] text-slate-400 font-medium">
              Use your <span className="font-bold text-slate-600">@campus360.edu</span> Google account to sign in securely
            </p>
          </div>

          {/* Demo: Google Account Picker */}
          {showGooglePicker && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
              <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center mb-3">
                    <svg className="h-10 w-10" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <h3 className="font-extrabold text-slate-900">Choose an account</h3>
                  <p className="text-xs text-slate-500 mt-1">to continue to Campus360</p>
                </div>
                <div className="space-y-2">
                  {GOOGLE_DEMO_USERS.map((u) => (
                    <button
                      key={u.email}
                      onClick={() => handleGoogleSignIn(u)}
                      className="w-full flex items-center gap-3 rounded-2xl border border-slate-200 p-3 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-brand-orange to-brand-pink text-white font-bold text-sm shadow-sm shrink-0">
                        {u.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowGooglePicker(false)}
                  className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 py-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====== STEP 2B: Student – Post-Google Setup (Phone + Password) ====== */}
      {step === 'student-setup' && googleUser && (
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl relative z-10 space-y-6">
          {/* Google user badge */}
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 p-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-brand-orange to-brand-pink text-white font-bold text-sm shadow-sm shrink-0">
              {googleUser.avatar}
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">{googleUser.name}</p>
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified via Google
              </p>
            </div>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900">Complete Your Profile</h2>
            <p className="text-xs text-slate-400 font-medium">
              Set your phone number and secure campus password
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleStudentSetup} className="space-y-4">
            {/* Phone Number */}
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
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-4 text-sm text-slate-800 outline-none transition-all focus:border-slate-400 focus:bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Create Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type={showStudentPass ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-12 text-sm text-slate-800 outline-none transition-all focus:border-slate-400 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowStudentPass(!showStudentPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showStudentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                  type={showStudentPass ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={studentConfirmPassword}
                  onChange={(e) => setStudentConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-4 text-sm text-slate-800 outline-none transition-all focus:border-slate-400 focus:bg-white"
                />
              </div>
            </div>

            {/* Validators */}
            <div className="flex items-center gap-4 text-[11px] text-slate-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${studentPassword.length >= 6 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                6+ characters
              </span>
              <span className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${studentPassword && studentPassword === studentConfirmPassword ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                Passwords match
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-pink py-3.5 text-sm font-bold text-white shadow-lg hover:opacity-95 hover:scale-[1.01] transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Setting up account...
                </span>
              ) : (
                <>
                  <span>Enter Campus360</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ====== STEP 3: Head Login ====== */}
      {step === 'head-email-pass' && (
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl relative z-10 space-y-6">
          <button
            onClick={() => { setStep('role-select'); setError(''); }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>

          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-3">
              <Building2 className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Head Login</h2>
            <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
              Use the email & password generated by the Super Admin. You'll be prompted to set a permanent password on first login.
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

          {/* Demo credentials */}
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
                  className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-2.5 text-left hover:bg-indigo-100/60 transition-colors"
                >
                  <p className="text-[11px] font-bold text-indigo-700">{demo.label}</p>
                  <p className="text-[10px] text-slate-500 font-medium truncate">{demo.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ====== STEP 4: Super Admin Login ====== */}
      {step === 'admin-email-pass' && (
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl relative z-10 space-y-6">
          <button
            onClick={() => { setStep('role-select'); setError(''); }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>

          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-800 mb-3">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Super Admin Login</h2>
            <p className="text-xs text-slate-400 font-medium">Restricted access – Authorized personnel only</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-4 text-sm text-slate-800 outline-none transition-all focus:border-slate-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type={showAdminPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-12 text-sm text-slate-800 outline-none transition-all focus:border-slate-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPass(!showAdminPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showAdminPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Authenticating...
                </span>
              ) : (
                <>
                  <span>Sign in as Super Admin</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs font-semibold text-amber-700">
            Demo: <span className="font-bold">admin@campus360.edu</span> / <span className="font-bold">admin123</span>
          </div>
        </div>
      )}

      {/* ====== HEAD FIRST-TIME PASSWORD CHANGE MODAL ====== */}
      {showPasswordChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
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
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                    <span className={`h-2 w-2 rounded-full ${newPassword && newPassword === confirmPassword ? 'bg-emerald-500' : 'bg-slate-300'}`} />
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

