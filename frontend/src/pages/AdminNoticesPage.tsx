import React, { useState } from 'react';
import { Megaphone, Plus, Trash2, Edit, AlertCircle, Calendar } from 'lucide-react';

export const AdminNoticesPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [notices, setNotices] = useState([
    {
      id: 'n-1',
      title: 'T&P Placement Drive: Google India recruitment cycle open',
      source: 'T&P Cell',
      category: 'Placement',
      date: 'Aug 30, 2026',
      desc: 'Applications are open for 2027 batch CSE/IT students.',
      isImportant: true,
    },
    {
      id: 'n-2',
      title: 'R&D Cell: Project Expo Registration deadline extended',
      source: 'R&D Cell',
      category: 'Research',
      date: 'Aug 29, 2026',
      desc: 'Annual technical project competition registration has been extended.',
      isImportant: false,
    }
  ]);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Placement');
  const [desc, setDesc] = useState('');
  const [isImportant, setIsImportant] = useState(false);

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !desc) return;

    const newNotice = {
      id: `n-${Date.now()}`,
      title,
      source: 'College Admin',
      category,
      date: 'Today',
      desc,
      isImportant,
    };

    setNotices([newNotice, ...notices]);
    setTitle('');
    setDesc('');
    setIsImportant(false);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setNotices(notices.filter((n) => n.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Manage Notices</h1>
          <p className="text-sm text-slate-500 font-medium">Create, publish, and delete notices visible on student boards.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-all"
        >
          <Plus className="h-4.5 w-4.5" />
          Post Notice
        </button>
      </div>

      {/* Notices Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">Notice Info</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Importance</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {notices.map((n) => (
                <tr key={n.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all">
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-800 leading-snug">{n.title}</p>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">{n.source}</span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-500">{n.category}</td>
                  <td className="py-4 px-6">
                    {n.isImportant ? (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-orange-50 px-3 py-1 text-xs font-bold text-brand-orange">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Important
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold">Standard</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-slate-400 font-semibold">{n.date}</td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Post notice modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <form onSubmit={handlePost} className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-extrabold text-slate-900">Post New Notice</h3>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notice Title</label>
              <input
                type="text"
                placeholder="e.g. Mid Semester Exams Timetable"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-slate-400"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-slate-400 font-semibold text-slate-600"
              >
                <option value="Placement">T&P Placement</option>
                <option value="Research">R&D Research</option>
                <option value="Academic">Academic College</option>
                <option value="Cultural">Cultural Committee</option>
                <option value="Sports">Sports Department</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
              <textarea
                placeholder="Write detailed announcements and instructions..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-slate-400 h-28 resize-none"
                required
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isImportant}
                onChange={(e) => setIsImportant(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-slate-200 text-brand-orange focus:ring-brand-orange"
              />
              <span className="text-xs font-bold text-slate-600">Mark notice as Important (high visibility)</span>
            </label>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 shadow-sm"
              >
                Publish Notice
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
