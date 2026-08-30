import React, { useState } from 'react';
import { Bookmark, Search, Trash2, Megaphone, Briefcase, Calendar, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BookmarksPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [bookmarks, setBookmarks] = useState([
    { id: 'b-1', title: 'T&P Placement Drive: Google India recruitment', type: 'Notice', path: '/notices', icon: Megaphone, color: 'text-brand-orange bg-brand-orange/10' },
    { id: 'b-2', title: 'React Native Developer Intern at TechStack', type: 'Opportunity', path: '/opportunity/opp-1', icon: Briefcase, color: 'text-brand-blue bg-brand-blue/10' },
    { id: 'b-3', title: 'Web Dev Mastery Workshop by Coding Club', type: 'Event', path: '/events', icon: Calendar, color: 'text-brand-green bg-brand-green/10' },
    { id: 'b-4', title: 'Placement Preparation Guidebook PDF', type: 'Document', path: '/documents', icon: FileText, color: 'text-brand-cyan bg-brand-cyan/10' },
  ]);

  const handleRemove = (id: string) => {
    setBookmarks(bookmarks.filter((b) => b.id !== id));
  };

  const filtered = bookmarks.filter((b) => {
    if (activeTab === 'All') return true;
    return b.type.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Your Bookmarks</h1>
        <p className="text-sm text-slate-500 font-medium">Quickly access your saved college notices, job postings, event registrations, and study papers.</p>
      </div>

      {/* Tabs selectors */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
        {['All', 'Notice', 'Opportunity', 'Event', 'Document'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-2xl px-4.5 py-2.5 text-xs font-bold transition-all border ${
              activeTab === tab
                ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {tab}s
          </button>
        ))}
      </div>

      {/* Bookmarks list */}
      <div className="space-y-4 max-w-4xl">
        {filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200/80">
            <Bookmark className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-500">No bookmarked items found in this category</p>
          </div>
        ) : (
          filtered.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 overflow-hidden">
                  <div className={`rounded-xl p-3 shrink-0 ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">
                      {item.type}
                    </span>
                    <h3 className="mt-1 font-bold text-slate-800 text-sm sm:text-base truncate leading-snug">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={item.path}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
