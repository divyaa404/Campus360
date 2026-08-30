import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../context/AuthContext';
import { ShieldCheck, GraduationCap, Lock, Mail, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Basic client-side check for demo
      if (!email || !password) {
        throw new Error('Please fill in all fields');
      }

      await login(role, email);
      
      if (role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (selectedRole: UserRole) => {
    setEmail(selectedRole === 'ADMIN' ? 'admin@campus360.edu' : 'student@campus360.edu');
    setPassword('password123');
    setRole(selectedRole);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-orange to-brand-pink text-white font-bold shadow-sm">
          C
        </div>
        <span className="font-bold text-lg text-slate-800">Campus360</span>
      </div>

      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900">Welcome to Campus360</h2>
          <p className="text-sm text-slate-400">One Campus. All Information. All Opportunities.</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="mt-8 flex rounded-2xl bg-slate-50 p-1.5 border border-slate-100">
          <button
            type="button"
            onClick={() => setRole('STUDENT')}
            className={`flex flex-1 items-center justify-center gap-2.5 rounded-xl py-3 text-sm font-semibold transition-all duration-200 ${
              role === 'STUDENT'
                ? 'bg-white text-brand-orange shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="h-4.5 w-4.5" />
            Student Portal
          </button>
          <button
            type="button"
            onClick={() => setRole('ADMIN')}
            className={`flex flex-1 items-center justify-center gap-2.5 rounded-xl py-3 text-sm font-semibold transition-all duration-200 ${
              role === 'ADMIN'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="h-4.5 w-4.5" />
            Admin Portal
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm outline-none transition-all focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm outline-none transition-all focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 cursor-pointer">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-200 text-brand-orange focus:ring-brand-orange" />
              Remember me
            </label>
            <a href="#" className="text-xs font-semibold text-brand-orange hover:underline">Forgot password?</a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-pink py-3.5 text-sm font-bold text-white shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </form>

        {/* Demo Fast Login Help */}
        <div className="mt-8 border-t border-slate-100 pt-6 text-center space-y-3">
          <p className="text-xs font-medium text-slate-400">Quick access for testing:</p>
          <div className="flex gap-3">
            <button
              onClick={() => handleQuickLogin('STUDENT')}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Demo Student
            </button>
            <button
              onClick={() => handleQuickLogin('ADMIN')}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Demo Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
