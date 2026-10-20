import React, { useState, useEffect } from 'react';
import { api, type WinnerItem } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Trophy,
  Plus,
  Search,
  Calendar,
  Award,
  Sparkles,
  Medal,
  Users,
  CheckCircle2,
  X,
  ExternalLink,
  Filter,
  Check,
  Building2,
  GraduationCap
} from 'lucide-react';

export const AchievementsPage: React.FC = () => {
  const { user } = useAuth();
  const [winners, setWinners] = useState<WinnerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Submit Winner Modal
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  const [winnerForm, setWinnerForm] = useState({
    studentName: user?.name || 'Aarav Sharma',
    rollNumber: user?.rollNumber || '2023CSE042',
    dept: user?.department || 'Computer Science (CSE)',
    year: '3rd Year (Batch 2027)',
    title: '',
    competition: '',
    organizer: '',
    category: 'Hackathons' as WinnerItem['category'],
    position: '1st Place Winner' as WinnerItem['position'],
    prize: '₹1,00,000 Cash Prize & Trophy',
    desc: '',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=60',
  });

  const presetPhotos = [
    { label: 'Hackathon / Tech Team', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=60' },
    { label: 'Research & Science', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=60' },
    { label: 'Robotics / Engineering', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60' },
    { label: 'Cultural / Arts', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60' },
    { label: 'Placement Winner', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60' },
  ];

  const categories = [
    'All',
    'Hackathons',
    'Research',
    'Academics',
    'Sports',
    'Cultural',
    'Placements',
  ];

  const loadWinners = async () => {
    setIsLoading(true);
    try {
      const data = await api.getWinners();
      setWinners(data);
    } catch (err) {
      console.error('Failed to load winners:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWinners();
  }, []);

  const handleAddWinner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!winnerForm.title.trim() || !winnerForm.competition.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await api.addWinner({
        studentName: winnerForm.studentName.trim(),
        rollNumber: winnerForm.rollNumber.trim(),
        dept: winnerForm.dept,
        year: winnerForm.year,
        title: winnerForm.title.trim(),
        competition: winnerForm.competition.trim(),
        organizer: winnerForm.organizer.trim() || 'National Organization',
        category: winnerForm.category,
        position: winnerForm.position,
        prize: winnerForm.prize.trim(),
        desc: winnerForm.desc.trim(),
        image: winnerForm.image,
      });

      setWinners([created, ...winners]);
      setShowAddForm(false);
      setSuccessToast(`Winner entry "${created.studentName}" added to the Hall of Fame!`);
      setTimeout(() => setSuccessToast(''), 4000);

      // Reset
      setWinnerForm({
        studentName: user?.name || 'Aarav Sharma',
        rollNumber: user?.rollNumber || '2023CSE042',
        dept: user?.department || 'Computer Science (CSE)',
        year: '3rd Year (Batch 2027)',
        title: '',
        competition: '',
        organizer: '',
        category: 'Hackathons',
        position: '1st Place Winner',
        prize: '₹1,00,000 Cash Prize & Trophy',
        desc: '',
        image: presetPhotos[0].url,
      });
    } catch (err) {
      console.error('Failed to add winner:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredWinners = winners.filter((w) => {
    const matchesSearch =
      w.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.competition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.prize.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedCategory === 'All') return matchesSearch;
    return w.category === selectedCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
              <Trophy className="h-3.5 w-3.5 text-amber-600" />
              Hall of Fame & All Winners List
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Campus Pride & National Recognitions</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Student Achievements & Winners Gallery
          </h1>
          <p className="text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
            Celebrating our students who brought laurels to the institution in national hackathons, research summits, international conferences, sports championships, and cultural fests.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-slate-800 transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Winner Achievement</span>
        </button>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-xs font-bold text-emerald-800 flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-emerald-700 hover:text-emerald-950 font-bold">✕</button>
        </div>
      )}

      {/* Summary Highlights */}
      <div className="grid gap-5 sm:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Winners</span>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{winners.length}</p>
            <span className="text-xs text-amber-600 font-semibold">Across all fields</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Trophy className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hackathons & Tech</span>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">
              {winners.filter((w) => w.category === 'Hackathons').length}
            </p>
            <span className="text-xs text-indigo-600 font-semibold">SIH, GSoC, Coding</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Research Awards</span>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">
              {winners.filter((w) => w.category === 'Research').length}
            </p>
            <span className="text-xs text-cyan-600 font-semibold">IEEE, Springer, Patents</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
            <Medal className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Placements</span>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">
              {winners.filter((w) => w.category === 'Placements').length}
            </p>
            <span className="text-xs text-emerald-600 font-semibold">Super-dream packages</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <GraduationCap className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Categories & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat === 'All' ? 'All Winners' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search winner, event, prize..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-9 pr-3.5 text-xs font-semibold outline-none focus:border-indigo-400 shadow-sm"
          />
        </div>
      </div>

      {/* ALL WINNERS SHOWCASE WITH PICTURES */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 text-sm font-semibold">
          Loading Hall of Fame winners...
        </div>
      ) : filteredWinners.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center space-y-3">
          <Trophy className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-700">No winners found in this category</h3>
          <p className="text-xs text-slate-400">Try selecting another category or submit a new winner achievement.</p>
        </div>
      ) : (
        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {filteredWinners.map((w) => (
            <div
              key={w.id}
              className="group rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Winner High-Res Photo Container */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                  <img
                    src={w.image}
                    alt={w.studentName}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

                  {/* Position Pill */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/90 backdrop-blur-md px-3 py-1 text-xs font-extrabold text-white shadow-md border border-amber-300/30">
                      <Medal className="h-3.5 w-3.5" />
                      {w.position}
                    </span>
                  </div>

                  {/* Category Pill */}
                  <div className="absolute top-3 right-3">
                    <span className="rounded-xl bg-slate-900/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white border border-white/10">
                      {w.category}
                    </span>
                  </div>

                  {/* Winner Name Banner on Photo */}
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="text-lg font-extrabold leading-snug drop-shadow-sm">
                      {w.studentName}
                    </h3>
                    <p className="text-xs text-amber-200 font-semibold drop-shadow-sm">
                      {w.dept} • {w.rollNumber}
                    </p>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                      Awarded at: {w.competition}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-base leading-snug">
                      {w.title}
                    </h4>
                    <p className="text-xs text-slate-400 font-semibold">
                      Organized by: {w.organizer}
                    </p>
                  </div>

                  {/* Prize / Reward Highlight Capsule */}
                  <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 p-3.5 border border-amber-200/80 flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5">
                      <Trophy className="h-4 w-4 text-amber-600 shrink-0" />
                      Prize Won:
                    </span>
                    <span className="font-extrabold text-amber-800 text-right">
                      {w.prize}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-3">
                    {w.desc}
                  </p>

                  {/* Team Members if any */}
                  {w.teamMembers && w.teamMembers.length > 0 && (
                    <div className="space-y-1.5 border-t border-slate-100 pt-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Team Members:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {w.teamMembers.map((m) => (
                          <span
                            key={m}
                            className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 pb-6 pt-0 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3">
                <span className="flex items-center gap-1 font-semibold">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {w.date}
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 text-[11px]">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified Winner
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================
          ADD WINNER ACHIEVEMENT MODAL
          ============================================================ */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Campus Hall of Fame
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                  Submit Winner / Team Achievement
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Add student competition winners, gold medalists, hackathon champions, and fellowship recipients.
                </p>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddWinner} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Winner / Team Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aarav Sharma & Team CyberGrid"
                    value={winnerForm.studentName}
                    onChange={(e) => setWinnerForm({ ...winnerForm, studentName: e.target.value })}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2023CSE042"
                    value={winnerForm.rollNumber}
                    onChange={(e) => setWinnerForm({ ...winnerForm, rollNumber: e.target.value })}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-mono font-bold text-slate-800 outline-none focus:border-indigo-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Department *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science (CSE)"
                    value={winnerForm.dept}
                    onChange={(e) => setWinnerForm({ ...winnerForm, dept: e.target.value })}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Batch / Year *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3rd Year (Batch 2027)"
                    value={winnerForm.year}
                    onChange={(e) => setWinnerForm({ ...winnerForm, year: e.target.value })}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Achievement / Project Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. National Champions - Smart India Hackathon 2026"
                  value={winnerForm.title}
                  onChange={(e) => setWinnerForm({ ...winnerForm, title: e.target.value })}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Competition / Conference Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SIH National Finals or IEEE Solid-State Conference"
                    value={winnerForm.competition}
                    onChange={(e) => setWinnerForm({ ...winnerForm, competition: e.target.value })}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Organizing Body *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ministry of Education / AICTE / IEEE"
                    value={winnerForm.organizer}
                    onChange={(e) => setWinnerForm({ ...winnerForm, organizer: e.target.value })}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Category *
                  </label>
                  <select
                    value={winnerForm.category}
                    onChange={(e) =>
                      setWinnerForm({ ...winnerForm, category: e.target.value as WinnerItem['category'] })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                  >
                    <option value="Hackathons">Hackathons</option>
                    <option value="Research">Research</option>
                    <option value="Academics">Academics</option>
                    <option value="Sports">Sports</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Placements">Placements</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Position Won *
                  </label>
                  <select
                    value={winnerForm.position}
                    onChange={(e) =>
                      setWinnerForm({ ...winnerForm, position: e.target.value as WinnerItem['position'] })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                  >
                    <option value="1st Place Winner">1st Place Winner</option>
                    <option value="2nd Runner-Up">2nd Runner-Up</option>
                    <option value="3rd Position">3rd Position</option>
                    <option value="Gold Medalist">Gold Medalist</option>
                    <option value="Best Innovation">Best Innovation</option>
                    <option value="Finalist">Finalist</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Prize / Award Won *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹1,50,000 Cash Prize"
                    value={winnerForm.prize}
                    onChange={(e) => setWinnerForm({ ...winnerForm, prize: e.target.value })}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                  />
                </div>
              </div>

              {/* Photo Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Winner Photo / Image URL *
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {presetPhotos.map((p) => (
                    <button
                      type="button"
                      key={p.label}
                      onClick={() => setWinnerForm({ ...winnerForm, image: p.url })}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                        winnerForm.image === p.url
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  value={winnerForm.image}
                  onChange={(e) => setWinnerForm({ ...winnerForm, image: e.target.value })}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Achievement Details & Project Summary *
                </label>
                <textarea
                  rows={4}
                  placeholder="Detail the problem solved, technology stack, competition evaluation, and impact..."
                  value={winnerForm.desc}
                  onChange={(e) => setWinnerForm({ ...winnerForm, desc: e.target.value })}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-2xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing Winner...' : 'Publish to Hall of Fame'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
