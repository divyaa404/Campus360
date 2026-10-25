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
  BarChart3,
  Building2,
  KeyRound,
  MessageSquare
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
    { name: 'Events & Drives', path: '/events', icon: Calendar },
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
    { name: 'Generate Head IDs', path: '/admin/generate-heads', icon: KeyRound },
    { name: 'Events & Rosters', path: '/admin/events', icon: Calendar },
    { name: 'Notices', path: '/admin/notices', icon: Megaphone },
    { name: 'Opportunities', path: '/admin/opportunities', icon: Briefcase },
    { name: 'Scholarships', path: '/admin/scholarships', icon: Award },
    { name: 'Achievements', path: '/admin/achievements', icon: Trophy },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const headLinks = [
    { name: 'Head Dashboard', path: '/head/dashboard', icon: LayoutDashboard },
    { name: 'Events & Student Lists', path: '/head/dashboard', icon: Calendar },
    { name: 'Explore All Events', path: '/events', icon: Building2 },
    { name: 'Account Settings', path: '/settings', icon: Settings },
  ];

  let links = studentLinks;
  if (user.role === 'SUPER_ADMIN') {
    links = adminLinks;
  } else if (user.role === 'HEAD') {
    links = headLinks;
  }

  const roleBadge =
    user.role === 'SUPER_ADMIN'
      ? 'Super Admin'
      : user.role === 'HEAD'
      ? user.organization || 'Club / Dept Head'
      : 'Student';

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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-blue-800 text-white font-bold text-xl shadow-md">
            C
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-slate-800">Campus</span>
            <span className="font-bold text-xl tracking-tight text-blue-600">360</span>
          </div>
        </div>

        {/* User Info Capsule */}
        <div className="mt-7 flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
          <div
            className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${
              user.role === 'SUPER_ADMIN'
                ? 'bg-blue-900'
                : user.role === 'HEAD'
                ? 'bg-gradient-to-tr from-blue-600 to-blue-800'
                : 'bg-gradient-to-tr from-blue-500 to-sky-500'
            }`}
          >
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h4 className="truncate font-bold text-xs text-slate-900">{user.name}</h4>
            <span className="truncate block text-[10px] font-semibold text-indigo-600">{roleBadge}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 flex-1 space-y-1 overflow-y-auto px-1 pr-1 custom-scrollbar">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-blue-50 hover:text-blue-900'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span>{link.name}</span>
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
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <LogOut className="h-4.5 w-4.5 text-rose-400" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
