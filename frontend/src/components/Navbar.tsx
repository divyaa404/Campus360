import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, Menu, X, Sparkles, Megaphone, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onMenuClick: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick, searchTerm, onSearchChange }) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock notifications for demonstration
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'T&P Placement Drive',
      message: 'Google has opened applications for Software Engineering Internships. Apply before Sept 15.',
      category: 'placement',
      isRead: false,
      icon: Briefcase,
      color: 'text-brand-blue bg-brand-blue/10',
    },
    {
      id: '2',
      title: 'Mid-Sem Exam Schedule Out',
      message: 'The Mid-Semester Examination schedule is published. Check the notice page for details.',
      category: 'notice',
      isRead: false,
      icon: Megaphone,
      color: 'text-brand-orange bg-brand-orange/10',
    },
    {
      id: '3',
      title: 'AI Recommendation Match',
      message: 'A new Machine Learning Hackathon matches your skills by 88%! Check recommendations.',
      category: 'ai',
      isRead: true,
      icon: Sparkles,
      color: 'text-brand-purple bg-brand-purple/10',
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
      {/* Mobile Toggle & Brand */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Global Search Bar */}
        {user && (
          <div className="relative hidden w-80 sm:block md:w-96">
            <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search notices, opportunities, events..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-slate-400 focus:bg-white"
            />
          </div>
        )}
      </div>

      {/* Right Actions */}
      {user && (
        <div className="flex items-center gap-4">
          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-2xl border border-slate-100 bg-slate-50 p-2.5 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 flex h-2.5 w-2.5 rounded-full bg-brand-pink ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Dropdown Panel */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-3.5 z-50 w-80 sm:w-96 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-800">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs font-semibold text-brand-blue hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="mt-3 space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-sm text-slate-400">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const Icon = n.icon;
                        return (
                          <div
                            key={n.id}
                            className={`flex gap-3 rounded-2xl p-3 transition-colors ${
                              n.isRead ? 'bg-white' : 'bg-slate-50/70 border border-slate-100'
                            }`}
                          >
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${n.color}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="overflow-hidden">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="truncate font-semibold text-sm text-slate-800">{n.title}</h4>
                                {!n.isRead && (
                                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-blue" />
                                )}
                              </div>
                              <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{n.message}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile Navigation */}
          <Link
            to={user.role === 'SUPER_ADMIN' ? '/admin/settings' : user.role === 'HEAD' ? '/settings' : '/profile'}
            className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-1.5 pr-3 hover:bg-slate-100 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-blue-800 flex items-center justify-center text-white text-sm font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-xs font-bold text-slate-800 truncate max-w-28">{user.name}</p>
              <p className="text-[10px] font-medium text-slate-400">{user.role}</p>
            </div>
          </Link>
        </div>
      )}
    </header>
  );
};
