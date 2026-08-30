import React, { useState } from 'react';
import { Megaphone, Search, AlertCircle, Bookmark, Download, Filter, Eye } from 'lucide-react';

export const NoticesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);

  // Expanded realistic mock database
  const notices = [
    {
      id: 'n-1',
      title: 'T&P Placement Drive: Google India recruitment cycle open',
      source: 'T&P Cell',
      category: 'T&P',
      date: '2026-08-30',
      desc: 'Applications are invited from 2027 batch CSE/IT students for Software Engineering internship role. Package details and links attached. Students must maintain a CGPA of 8.0 and above.',
      isImportant: true,
      attachment: 'google_jd_2027.pdf'
    },
    {
      id: 'n-2',
      title: 'R&D Cell: Project Expo Registration deadline extended',
      source: 'R&D Cell',
      category: 'R&D',
      date: '2026-08-29',
      desc: 'Annual technical project competition registration has been extended. Submit project abstract to head cell directly. Top 3 teams win cash rewards of up to 50k.',
      isImportant: false,
    },
    {
      id: 'n-3',
      title: 'Mid-Sem Examination Schedule Fall Semester',
      source: 'Academic Admin',
      category: 'College',
      date: '2026-08-28',
      desc: 'Mid semester exams will commence from September 18. Detailed date sheet is now available for download. Ensure you clear all outstanding library dues.',
      isImportant: true,
      attachment: 'datesheet_midsem_2026.pdf'
    },
    {
      id: 'n-4',
      title: 'Annual Cultural Fest "Echoes 2026" Registrations Open',
      source: 'Cultural Committee',
      category: 'Cultural',
      date: '2026-08-27',
      desc: 'Registrations for stage play, group dance, fashion show and battle of bands are officially open. Contact student representatives at cultural room.',
      isImportant: false,
    },
    {
      id: 'n-5',
      title: 'Inter-College Sports Meet: Squad selection trials',
      source: 'Sports Department',
      category: 'Sports',
      date: '2026-08-26',
      desc: 'Trials for Cricket, Football, Basketball, and Athletics squads start tomorrow at 7:00 AM on the main fields. Carry college ID card.',
      isImportant: false,
    },
    {
      id: 'n-6',
      title: 'Hackathon: CodeCraft 2.0 registrations started',
      source: 'Coding Club',
      category: 'Clubs',
      date: '2026-08-25',
      desc: 'Coding Club presents CodeCraft 2.0 Hackathon on Sept 10. Win prize pool of 1 Lakh. Theme will be revealed on site.',
      isImportant: true,
      attachment: 'hackathon_rules_2.0.pdf'
    }
  ];

  const categories = ['All', 'College', 'Department', 'T&P', 'R&D', 'Clubs', 'Sports', 'Cultural', 'Important'];

  const handleBookmarkToggle = (id: string) => {
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds(bookmarkedIds.filter((bId) => bId !== id));
    } else {
      setBookmarkedIds([...bookmarkedIds, id]);
    }
  };

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          notice.desc.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'All') return matchesSearch;
    if (activeTab === 'Important') return notice.isImportant && matchesSearch;
    return notice.category.toLowerCase() === activeTab.toLowerCase() && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">College Notices</h1>
        <p className="text-sm text-slate-500 font-medium">Browse verified updates from all college administration cells and committees.</p>
      </div>

      {/* Search & Tabs Panel */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search notices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm outline-none focus:border-slate-400 focus:bg-white"
          />
        </div>

        {/* Tab buttons */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`rounded-2xl px-4.5 py-2.5 text-xs font-bold transition-all border ${
                activeTab === cat
                  ? 'bg-slate-950 text-white border-slate-950'
                  : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredNotices.length === 0 ? (
          <div className="col-span-2 py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200/80">
            <Megaphone className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-500">No notices found matching current criteria</p>
          </div>
        ) : (
          filteredNotices.map((notice) => (
            <div
              key={notice.id}
              className={`rounded-3xl border bg-white p-6 shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${
                notice.isImportant ? 'border-l-4 border-l-brand-orange border-slate-200' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex flex-wrap items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                      {notice.category}
                    </span>
                    {notice.isImportant && (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-orange-50 px-3 py-1 text-xs font-bold text-brand-orange">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Important
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">{notice.date}</span>
                </div>

                <h3 className="mt-4 font-bold text-slate-800 text-lg leading-snug">
                  {notice.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-3">
                  {notice.desc}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Source: {notice.source}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBookmarkToggle(notice.id)}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-pink transition-colors"
                  >
                    <Bookmark
                      className={`h-4.5 w-4.5 ${
                        bookmarkedIds.includes(notice.id) ? 'fill-brand-pink text-brand-pink' : ''
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => setSelectedNotice(notice)}
                    className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <Eye className="h-4.5 w-4.5" />
                    Read
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detailed View Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                  {selectedNotice.category}
                </span>
                {selectedNotice.isImportant && (
                  <span className="inline-flex items-center gap-1 rounded-xl bg-orange-50 px-3 py-1 text-xs font-bold text-brand-orange">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Important Notice
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400 font-semibold">{selectedNotice.date}</span>
            </div>

            <div className="mt-4 space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900 leading-snug">{selectedNotice.title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">{selectedNotice.desc}</p>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Posted by: {selectedNotice.source}</div>
            </div>

            {selectedNotice.attachment && (
              <div className="mt-6 flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-center gap-2.5">
                  <Megaphone className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs font-bold text-slate-700">{selectedNotice.attachment}</p>
                    <p className="text-[10px] text-slate-400">PDF Document</p>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors">
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => handleBookmarkToggle(selectedNotice.id)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {bookmarkedIds.includes(selectedNotice.id) ? 'Remove Bookmark' : 'Bookmark'}
              </button>
              <button
                onClick={() => setSelectedNotice(null)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
