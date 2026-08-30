import React, { useState } from 'react';
import { Plus, Trash2, Calendar, MapPin, Briefcase, Sparkles } from 'lucide-react';

export const AdminOpportunitiesPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [opportunities, setOpportunities] = useState([
    {
      id: 'opp-1',
      title: 'React Native Developer Intern',
      organization: 'TechStack Corp',
      category: 'Internships',
      location: 'Bangalore, India',
      mode: 'Hybrid',
      deadline: '2026-09-05',
    },
    {
      id: 'opp-2',
      title: 'Machine Learning Engineer',
      organization: 'AlphaLabs AI',
      category: 'Placements',
      location: 'Remote',
      mode: 'Online',
      deadline: '2026-09-12',
    }
  ]);

  const [title, setTitle] = useState('');
  const [org, setOrg] = useState('');
  const [category, setCategory] = useState('Internships');
  const [loc, setLoc] = useState('');
  const [mode, setMode] = useState('Online');
  const [deadline, setDeadline] = useState('');

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !org) return;

    const newOpp = {
      id: `opp-${Date.now()}`,
      title,
      organization: org,
      category,
      location: loc || 'Remote',
      mode,
      deadline: deadline || '2026-10-01',
    };

    setOpportunities([newOpp, ...opportunities]);
    setTitle('');
    setOrg('');
    setLoc('');
    setDeadline('');
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setOpportunities(opportunities.filter((o) => o.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-sans">Manage Opportunities</h1>
          <p className="text-sm text-slate-500 font-medium">Post internships, hackathons, and placement jobs with custom requirement match parameters.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-all"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Opportunity
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">Opportunity info</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Mode</th>
                <th className="py-4 px-6">Deadline</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((opp) => (
                <tr key={opp.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all">
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-800 leading-snug">{opp.title}</p>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{opp.organization}</span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-500">{opp.category}</td>
                  <td className="py-4 px-6">
                    <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-brand-blue border border-brand-blue/5">
                      {opp.mode}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-400">{opp.deadline}</td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => handleDelete(opp.id)}
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

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <form onSubmit={handlePost} className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-extrabold text-slate-900">Add New Opportunity</h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Opportunity Title</label>
              <input
                type="text"
                placeholder="e.g. Associate Software Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-slate-400"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Company / Organization</label>
              <input
                type="text"
                placeholder="e.g. Microsoft India"
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-slate-400"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-slate-400 font-semibold text-slate-600"
                >
                  <option value="Internships">Internships</option>
                  <option value="Placements">Placements</option>
                  <option value="Hackathons">Hackathons</option>
                  <option value="Research Opportunities">Research</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Work Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-slate-400 font-semibold text-slate-600"
                >
                  <option value="Online">Online / Remote</option>
                  <option value="Offline">Offline / In-Office</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Bangalore, India"
                  value={loc}
                  onChange={(e) => setLoc(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deadline Date</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-slate-400 font-semibold text-slate-600"
                />
              </div>
            </div>

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
                Add Posting
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
