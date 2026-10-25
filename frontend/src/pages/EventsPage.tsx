import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, type EventItem } from '../services/api';
import { 
  Calendar, 
  Search, 
  MapPin, 
  Clock, 
  Users, 
  CalendarCheck, 
  Share2, 
  CheckCircle,
  Sparkles,
  Building2,
  X
} from 'lucide-react';

export const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Registration modal state
  const [selectedEventForReg, setSelectedEventForReg] = useState<EventItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regSuccessMessage, setRegSuccessMessage] = useState('');
  const [studentForm, setStudentForm] = useState({
    name: user?.name || '',
    rollNumber: user?.rollNumber || '',
    department: user?.department || '',
    year: user?.year || '',
    phone: user?.phone || '',
    email: user?.email || '',
  });

  const loadEvents = async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const data = await api.getEvents();
      setEvents(data);

      if (user?.id) {
        const myRegs = await api.getMyRegistrations(user.id, user.email);
        setRegisteredIds(myRegs.map((r) => r.eventId));
      }
    } catch (err) {
      console.error('Failed to load events:', err);
      setLoadError(err instanceof Error ? err.message : 'Unable to load events.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [user]);

  const categories = [
    'All',
    'Technical',
    'Hackathons',
    'Placement Drives',
    'Workshops',
    'Seminars',
    'Cultural',
    'Sports',
  ];

  const handleOpenRegisterModal = (evt: EventItem) => {
    setSelectedEventForReg(evt);
    setRegSuccessMessage('');
  };

  const handleConfirmRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventForReg) return;

    setIsSubmitting(true);
    try {
      await api.registerForEvent(selectedEventForReg.id, {
        studentId: user?.id || '',
        studentName: studentForm.name,
        studentEmail: studentForm.email,
        rollNumber: studentForm.rollNumber,
        department: studentForm.department,
        year: Number(studentForm.year),
        phone: studentForm.phone,
      });

      setRegisteredIds([...registeredIds, selectedEventForReg.id]);
      setRegSuccessMessage(`Registration Confirmed! You are registered for ${selectedEventForReg.title}. The organizing head will review your submission.`);
      setTimeout(() => {
        setSelectedEventForReg(null);
        setRegSuccessMessage('');
        loadEvents();
      }, 1800);
    } catch (err: any) {
      console.error('Failed to register:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.organizer.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeCategory === 'All') return matchesSearch;
    return evt.category.toLowerCase() === activeCategory.toLowerCase() && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {loadError && (
        <div role="alert" className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900">
          {loadError}
        </div>
      )}
      {/* Page Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Campus Events & Drives</h1>
          <p className="text-sm text-slate-500 font-medium">
            Discover official IEEE hackathons, T&P placement drives, technical workshops, and cultural fests.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm">
          <CalendarCheck className="h-4 w-4 text-emerald-500" />
          <span>My Active Registrations: {registeredIds.length}</span>
        </div>
      </div>

      {/* Filter panel */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search events, clubs, hackathons..."
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

      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {isLoading ? (
          <div className="col-span-2 rounded-3xl border border-blue-100 bg-white py-16 text-center text-sm font-semibold text-slate-500">Loading campus events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="col-span-2 py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200/80">
            <Calendar className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-500">No events found matching current criteria</p>
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const isRegistered = registeredIds.includes(evt.id);
            return (
              <div
                key={evt.id}
                className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
              >
                {/* Event Card Banner */}
                <div className="h-48 w-full bg-slate-200 relative overflow-hidden">
                  <img src={evt.image} alt={evt.title} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="rounded-xl bg-white/95 backdrop-blur-sm px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm">
                      {evt.category}
                    </span>
                  </div>
                  <span className="absolute top-4 right-4 rounded-xl bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                    {evt.registeredCount || 0} Registered
                  </span>
                </div>

                {/* Event Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-orange bg-brand-orange/10 px-3 py-1 rounded-xl">
                      Organized by: {evt.organizer}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-lg leading-snug">{evt.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{evt.desc}</p>
                  </div>

                  {/* Meta details horizontal */}
                  <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <CalendarCheck className="h-4.5 w-4.5 text-slate-400" />
                      <span>{evt.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4.5 w-4.5 text-slate-400" />
                      <span>{evt.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <MapPin className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                      <span className="truncate">{evt.venue}</span>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <button className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-500 hover:bg-slate-100 transition-colors">
                      <Share2 className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => handleOpenRegisterModal(evt)}
                      disabled={isRegistered}
                      className={`rounded-2xl px-6 py-2.5 text-xs font-bold shadow-sm transition-all ${
                        isRegistered
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-gradient-to-r from-brand-orange to-brand-pink text-white hover:opacity-95 hover:scale-[1.01]'
                      }`}
                    >
                      {isRegistered ? '✓ Registered' : 'Register Now'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ============================================================
          REGISTRATION MODAL
          ============================================================ */}
      {selectedEventForReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-brand-orange uppercase">
                  {selectedEventForReg.organizer}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">Confirm Event Registration</h3>
              </div>
              <button
                onClick={() => setSelectedEventForReg(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {regSuccessMessage ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="text-lg font-bold text-slate-900">{regSuccessMessage}</h4>
                <p className="text-xs text-slate-400">Updating event roster...</p>
              </div>
            ) : (
              <form onSubmit={handleConfirmRegistration} className="space-y-4 font-sans">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-1 text-xs">
                  <div className="font-bold text-slate-800 text-sm">{selectedEventForReg.title}</div>
                  <div className="text-slate-500 font-medium">
                    📅 {selectedEventForReg.date} at {selectedEventForReg.time} • 📍 {selectedEventForReg.venue}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase">Student Name</label>
                    <input
                      type="text"
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase">Roll Number</label>
                    <input
                      type="text"
                      value={studentForm.rollNumber}
                      onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase">Department</label>
                    <input
                      type="text"
                      value={studentForm.department}
                      onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase">Year / Sem</label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={studentForm.year}
                      onChange={(e) => setStudentForm({ ...studentForm, year: Number(e.target.value) })}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase">Email Address</label>
                    <input
                      type="email"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase">Phone Number</label>
                    <input
                      type="text"
                      value={studentForm.phone}
                      onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedEventForReg(null)}
                    className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-2xl bg-gradient-to-r from-brand-orange to-brand-pink px-6 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting Application...' : 'Confirm & Apply'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
