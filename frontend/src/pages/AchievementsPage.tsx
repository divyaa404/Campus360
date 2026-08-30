import React, { useState } from 'react';
import { Trophy, Plus, Search, MapPin, Calendar, Check } from 'lucide-react';

export const AchievementsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [achievements, setAchievements] = useState([
    {
      id: 'a-1',
      studentName: 'Aarav Sharma',
      dept: 'Computer Science (CSE)',
      title: '1st Place Winner - Smart India Hackathon 2026',
      competition: 'SIH National Finals',
      date: 'Aug 20, 2026',
      desc: 'Our team built a decentralized supply chain monitoring network using IoT protocols, solving the real-world tracking issue for the Ministry of Electronics.',
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=60'
    },
    {
      id: 'a-2',
      studentName: 'Priya Patel',
      dept: 'Electronics (ECE)',
      title: 'Best Research Paper Award',
      competition: 'IEEE International Solid-State Circuits Conference',
      date: 'Aug 15, 2026',
      desc: 'Published a high-performance analog filter circuit design with low power footprint using sub-14nm FinFET arrays.',
      image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&auto=format&fit=crop&q=60'
    }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newComp, setNewComp] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newComp) return;

    const newItem = {
      id: `a-${Date.now()}`,
      studentName: 'Aarav Sharma', // Currently logged student
      dept: 'Computer Science (CSE)',
      title: newTitle,
      competition: newComp,
      date: 'Today',
      desc: newDesc,
      image: 'https://images.unsplash.com/photo-1496469888073-80de7e9b2f53?w=800&auto=format&fit=crop&q=60'
    };

    setAchievements([newItem, ...achievements]);
    setNewTitle('');
    setNewComp('');
    setNewDesc('');
    setShowAddForm(false);
  };

  const filtered = achievements.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.competition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Student Achievements</h1>
          <p className="text-sm text-slate-500 font-medium">Showcasing academic, hackathon, sports, and research success in our college campus.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-all"
        >
          <Plus className="h-4.5 w-4.5" />
          Share Achievement
        </button>
      </div>

      <div className="relative w-full md:w-80">
        <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search achievements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm outline-none focus:border-slate-400 focus:bg-white"
        />
      </div>

      {/* Grid Showcase */}
      <div className="grid gap-6 md:grid-cols-2">
        {filtered.map((ach) => (
          <div key={ach.id} className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
            <div className="h-48 w-full bg-slate-200">
              <img src={ach.image} alt={ach.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-brand-orange">
                    {ach.dept}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{ach.date}</span>
                </div>
                <h3 className="font-extrabold text-slate-800 text-lg leading-snug">{ach.title}</h3>
                <p className="text-sm font-semibold text-slate-400">Awarded at: {ach.competition}</p>
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">{ach.desc}</p>
              </div>

              <div className="border-t border-slate-50 pt-4 flex items-center gap-2 text-xs font-bold text-slate-700">
                <Trophy className="h-4.5 w-4.5 text-brand-orange" />
                <span>Submitted by: {ach.studentName}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Achievement Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <form onSubmit={handleAdd} className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-extrabold text-slate-900">Share Your Achievement</h3>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Achievement Title</label>
              <input
                type="text"
                placeholder="e.g. Winner - CodeFest 2026"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-slate-400"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Competition / Event Organizer</label>
              <input
                type="text"
                placeholder="e.g. IIT Bombay Techfest"
                value={newComp}
                onChange={(e) => setNewComp(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-slate-400"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Short Description</label>
              <textarea
                placeholder="Describe what you built or achieved, and what the competition was about..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-slate-400 h-28 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
              >
                Publish Success
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
