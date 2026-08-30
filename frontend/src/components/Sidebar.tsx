import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Megaphone,
  Briefcase,
  Calendar,
  Award,
  Trophy,
  CheckSquare,
  FolderOpen,
  Sparkles,
  Bookmark,
  User,
  Settings,
  LogOut,
  Users,
  Bell,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const studentLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Notices', path: '/notices', icon: Megaphone },
    { name: 'Opportunities', path: '/opportunities', icon: Briefcase },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Scholarships', path: '/scholarships', icon: Award },
    { name: 'Achievements', path: '/achievements', icon: Trophy },
    { name: 'Mock Tests', path: '/mock-tests', icon: CheckSquare },
    { name: 'Documents', path: '/documents', icon: FolderOpen },
    { name: 'AI Recommendations', path: '/ai-recommendations', icon: Sparkles },
    { name: 'Bookmarks', path: '/bookmarks', icon: Bookmark },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Notices', path: '/admin/notices', icon: Megaphone },
    { name: 'Opportunities', path: '/admin/opportunities', icon: Briefcase },
    { name: 'Events', path: '/admin/events', icon: Calendar },
    { name: 'Scholarships', path: '/admin/scholarships', icon: Award },
    { name: 'Achievements', path: '/admin/achievements', icon: Trophy },
    { name: 'Documents', path: '/admin/documents', icon: FolderOpen },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const links = user.role === 'ADMIN' ? adminLinks : studentLinks;

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white px-6 py-6 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-orange to-brand-pink text-white font-bold text-xl shadow-md">
            C
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-slate-800">Campus</span>
            <span className="font-bold text-xl tracking-tight text-brand-orange">360</span>
          </div>
        </div>

        {/* User Info Capsule */}
        <div className="mt-8 flex items-center gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-brand-blue to-brand-cyan flex items-center justify-center text-white font-bold shadow-sm">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h4 className="truncate font-semibold text-sm text-slate-800">{user.name}</h4>
            <span className="text-xs font-medium text-slate-400 capitalize">{user.role.toLowerCase()}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="mt-8 flex-1 space-y-1 overflow-y-auto px-1 pr-1 custom-scrollbar">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="mt-auto border-t border-slate-100 pt-4">
          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <LogOut className="h-5 w-5 text-rose-400" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};
