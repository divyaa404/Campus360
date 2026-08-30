import React, { useState } from 'react';
import { FolderOpen, Search, Download, FileText, ExternalLink, Bookmark } from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const documents = [
    {
      id: 'd-1',
      title: 'B.Tech CSE Syllabus 2024-2028',
      category: 'Syllabus',
      desc: 'Complete academic course structures, credit breakdowns, and examination guidelines.',
      file: 'btech_cse_syllabus.pdf',
      date: 'Aug 10, 2026'
    },
    {
      id: 'd-2',
      title: 'College Scholarship Application Form A',
      category: 'Forms',
      desc: 'Official tuition waiver and scholarship submission form for EWS/Merit schemes.',
      file: 'scholarship_application_form_a.pdf',
      date: 'Aug 12, 2026'
    },
    {
      id: 'd-3',
      title: 'Placement Preparation Guidebook',
      category: 'Placement Resources',
      desc: 'Top interview preparation questions, DSA cheat-sheets, and HR sample answers from T&P Cell.',
      file: 'tp_placement_guide_v2.pdf',
      date: 'Aug 25, 2026'
    },
    {
      id: 'd-4',
      title: 'Supabase Database Integration Guidelines',
      category: 'Notes',
      desc: 'Student notes on integrating Supabase backend, configuring storage buckets, and handling OAuth.',
      file: 'supabase_db_integration.pdf',
      date: 'Aug 28, 2026'
    }
  ];

  const categories = ['All', 'Syllabus', 'Forms', 'Placement Resources', 'Notes'];

  const filtered = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.desc.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeCategory === 'All') return matchesSearch;
    return doc.category.toLowerCase() === activeCategory.toLowerCase() && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Documents & Resources</h1>
        <p className="text-sm text-slate-500 font-medium">Quickly download academic syllabi, official clearance forms, study notes, and placement resources.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm outline-none focus:border-slate-400 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-2xl px-4.5 py-2.5 text-xs font-bold transition-all border ${
                activeCategory === cat
                  ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filtered.length === 0 ? (
          <div className="col-span-2 py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200/80">
            <FolderOpen className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-500">No resources found</p>
          </div>
        ) : (
          filtered.map((doc) => (
            <div key={doc.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-brand-blue/10 p-3 text-brand-blue shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      {doc.category}
                    </span>
                    <h3 className="mt-1.5 font-extrabold text-slate-800 text-base leading-snug">{doc.title}</h3>
                    <p className="mt-2 text-xs text-slate-500 leading-relaxed font-semibold">{doc.desc}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4 text-xs">
                <span className="font-semibold text-slate-400">Added: {doc.date}</span>
                <div className="flex gap-2">
                  <button className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-500 hover:bg-slate-100 transition-colors">
                    <Bookmark className="h-4.5 w-4.5" />
                  </button>
                  <button className="flex items-center gap-1.5 rounded-2xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors">
                    <Download className="h-4 w-4 text-white" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
