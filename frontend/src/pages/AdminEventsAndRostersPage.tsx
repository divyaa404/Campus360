import React, { useState, useEffect } from 'react';
import { api, type EventItem, type EventRegistration } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Users,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  MapPin,
  Download,
  Building2,
  Sparkles,
  Send,
  X,
  Eye,
  Trash2,
  Check,
  AlertCircle,
  FileSpreadsheet,
  Award
} from 'lucide-react';

export const AdminEventsAndRostersPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Publish Modal State
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');
  const [eventForm, setEventForm] = useState({
    title: '',
    category: 'Hackathons',
    organizer: user?.organization || 'Central Administration',
    date: '2026-11-10',
    time: '10:00 AM',
    venue: 'Main Campus Auditorium & Seminar Hall 1',
    desc: '',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=60',
    deadline: '2026-11-05',
    maxCapacity: '150',
    eligibility: 'Open to all students (CSE, ECE, IT, ME, EE)',
  });

  // Roster Inspector State
  const [selectedEventForRoster, setSelectedEventForRoster] = useState<EventItem | null>(null);
  const [rosterStudents, setRosterStudents] = useState<EventRegistration[]>([]);
  const [rosterSearch, setRosterSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loadingRoster, setLoadingRoster] = useState(false);

  const categories = [
    'All',
    'Hackathons',
    'Placement Drives',
    'Technical',
    'Workshops',
    'Seminars',
    'Cultural',
    'Sports',
  ];

  const presetImages = [
    { label: 'Hackathon / Tech', url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=60' },
    { label: 'Placement / Corporate', url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=60' },
    { label: 'Workshop / AI', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=60' },
    { label: 'Cultural Fest', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60' },
  ];

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const openRoster = async (evt: EventItem) => {
    setSelectedEventForRoster(evt);
    setLoadingRoster(true);
    try {
      const data = await api.getEventRegistrations(evt.id);
      setRosterStudents(data.students || []);
    } catch (err) {
      console.error('Failed to fetch event roster:', err);
    } finally {
      setLoadingRoster(false);
    }
  };

  const handleStatusChange = async (regId: string, newStatus: EventRegistration['status']) => {
    if (!selectedEventForRoster) return;
    try {
      await api.updateRegistrationStatus(selectedEventForRoster.id, regId, newStatus);
      setRosterStudents((prev) =>
        prev.map((r) => (r.id === regId ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handlePublishEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim() || !eventForm.desc.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.postEvent({
        title: eventForm.title.trim(),
        category: eventForm.category,
        organizer: eventForm.organizer,
        date: eventForm.date,
        time: eventForm.time,
        venue: eventForm.venue,
        desc: eventForm.desc.trim(),
        image: eventForm.image,
        deadline: eventForm.deadline,
        maxCapacity: Number(eventForm.maxCapacity) || 100,
        eligibility: eventForm.eligibility,
        organizerRole: user?.role === 'HEAD' ? user.headTitle || 'Head Convener' : 'Super Admin',
        headId: user?.role === 'HEAD' ? user.id : undefined,
      });

      setSuccessNotice(`"${res.event.title}" published! It is now live in the students' Events & Drives section.`);
      setShowPublishModal(false);
      // Reset form
      setEventForm({
        title: '',
        category: 'Hackathons',
        organizer: user?.organization || 'Central Administration',
        date: '2026-11-10',
        time: '10:00 AM',
        venue: 'Main Campus Auditorium & Seminar Hall 1',
        desc: '',
        image: presetImages[0].url,
        deadline: '2026-11-05',
        maxCapacity: '150',
        eligibility: 'Open to all students',
      });
      await loadEvents();
      setTimeout(() => setSuccessNotice(''), 6000);
    } catch (err) {
      console.error('Failed to publish event:', err);
      alert(err instanceof Error ? `Failed to publish event: ${err.message}` : 'Failed to publish event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (event: EventItem) => {
    if (!window.confirm(`Delete "${event.title}" and all of its registrations?`)) return;
    try {
      await api.deleteEvent(event.id);
      setEvents((current) => current.filter((item) => item.id !== event.id));
      setSuccessNotice(`"${event.title}" was deleted.`);
      if (selectedEventForRoster?.id === event.id) setSelectedEventForRoster(null);
      setTimeout(() => setSuccessNotice(''), 5000);
    } catch (err) {
      console.error('Failed to delete event:', err);
      alert(err instanceof Error ? `Failed to delete event: ${err.message}` : 'Failed to delete event.');
    }
  };

  const handleExportCSV = () => {
    if (rosterStudents.length === 0 || !selectedEventForRoster) return;
    const headers = 'Student Name,Roll Number,Email,Department,Year,Phone,Registered At,Status\n';
    const rows = rosterStudents
      .map(
        (r) =>
          `"${r.studentName}","${r.rollNumber}","${r.studentEmail}","${r.department}","${r.year}","${r.phone}","${r.registeredAt}","${r.status}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedEventForRoster.title.replace(/[^a-z0-9]/gi, '_')}_Student_Roster.csv`;
    a.click();
  };

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.venue.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedCategory === 'All') return matchesSearch;
    return evt.category.toLowerCase() === selectedCategory.toLowerCase() && matchesSearch;
  });

  const filteredRoster = rosterStudents.filter((r) => {
    const matches =
      r.studentName.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      r.rollNumber.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      r.department.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      r.studentEmail.toLowerCase().includes(rosterSearch.toLowerCase());

    if (statusFilter === 'All') return matches;
    return r.status.toLowerCase() === statusFilter.toLowerCase() && matches;
  });

  const totalApplicantsCount = events.reduce((acc, e) => acc + (e.registeredCount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-200">
              <Calendar className="h-3.5 w-3.5 text-indigo-600" />
              Event & Rosters Management
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Live Student Feed Sync</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Events, Drives & Student Rosters
          </h1>
          <p className="text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
            Publish hackathons, placement drives, workshops, and fests directly to student dashboards and the student events page. Track registrations and manage rosters in real time.
          </p>
        </div>

        <button
          onClick={() => setShowPublishModal(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Publish Event / Drive</span>
        </button>
      </div>

      {/* Success Notification */}
      {successNotice && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-xs font-bold text-emerald-800 flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice('')} className="text-emerald-700 hover:text-emerald-950 font-bold">✕</button>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Published Events</span>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{events.length}</p>
            <span className="text-xs text-indigo-600 font-semibold">Active in student portal</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Calendar className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Registrations</span>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{totalApplicantsCount}</p>
            <span className="text-xs text-emerald-600 font-semibold">Across all campus drives</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Student Feed Status</span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              Live & Synced
            </p>
            <span className="text-xs text-slate-400 font-semibold">Updates display immediately</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search events, organizers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 text-sm font-semibold">
          Loading events & rosters...
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center space-y-3">
          <Calendar className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-700">No events found</h3>
          <p className="text-xs text-slate-400">Try adjusting your search or publish a new event.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((evt) => {
            const registeredCount = evt.registeredCount || 0;
            const maxCap = evt.maxCapacity || 100;
            const percentage = Math.min(100, Math.round((registeredCount / maxCap) * 100));

            return (
              <div
                key={evt.id}
                className="group rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Banner Image */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={evt.image}
                      alt={evt.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="rounded-xl bg-slate-900/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shadow-sm border border-white/10">
                        {evt.category}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-amber-300">
                        {evt.organizer}
                      </span>
                      <h3 className="text-base font-extrabold text-white leading-tight line-clamp-1">
                        {evt.title}
                      </h3>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                      {evt.desc}
                    </p>

                    <div className="space-y-1.5 text-xs text-slate-600 font-semibold border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{evt.date} • {evt.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>Deadline: {evt.deadline || evt.date}</span>
                      </div>
                    </div>

                    {/* Capacity Indicator */}
                    <div className="space-y-1 pt-2">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-500">Registrations</span>
                        <span className="text-slate-900">{registeredCount} / {maxCap} students</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="flex gap-2 p-5 pt-0">
                  <button
                    onClick={() => openRoster(evt)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Student Roster ({registeredCount})</span>
                  </button>
                  {user?.role === 'SUPER_ADMIN' && (
                    <button
                      onClick={() => handleDeleteEvent(evt)}
                      aria-label={`Delete ${evt.title}`}
                      title="Delete event"
                      className="rounded-2xl border border-rose-200 bg-rose-50 px-3 text-rose-600 hover:bg-rose-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================
          ROSTER VIEWER MODAL
          ============================================================ */}
      {selectedEventForRoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl max-h-[90vh] rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl flex flex-col space-y-6 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="rounded-xl bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700">
                  {selectedEventForRoster.category} • {selectedEventForRoster.organizer}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                  {selectedEventForRoster.title}
                </h2>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  Live Registered Student Roster ({rosterStudents.length} total applicants)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  disabled={rosterStudents.length === 0}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => setSelectedEventForRoster(null)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Search & Status Filter */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by student name, roll number, department..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-bold text-slate-700 outline-none focus:border-indigo-400"
                >
                  <option value="All">All Statuses</option>
                  <option value="Registered">Registered</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Selected">Selected</option>
                  <option value="Attended">Attended</option>
                  <option value="Waitlisted">Waitlisted</option>
                </select>
              </div>
            </div>

            {/* Students Table */}
            <div className="flex-1 overflow-y-auto max-h-[50vh] border border-slate-100 rounded-2xl">
              {loadingRoster ? (
                <div className="py-16 text-center text-xs font-semibold text-slate-400">
                  Loading applicant roster...
                </div>
              ) : filteredRoster.length === 0 ? (
                <div className="py-16 text-center space-y-2 text-slate-400">
                  <Users className="h-8 w-8 mx-auto text-slate-300" />
                  <p className="text-xs font-bold">No registered applicants match your filter</p>
                </div>
              ) : (
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
                    <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-3">Roll No</th>
                      <th className="py-3 px-3">Department & Year</th>
                      <th className="py-3 px-3">Contact</th>
                      <th className="py-3 px-3">Registered At</th>
                      <th className="py-3 px-4 text-right">Roster Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRoster.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 text-xs">
                          {reg.studentName}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-xs text-indigo-700">
                          {reg.rollNumber}
                        </td>
                        <td className="py-3.5 px-3 text-xs text-slate-600 font-semibold">
                          {reg.department} (Yr {reg.year})
                        </td>
                        <td className="py-3.5 px-3 text-xs text-slate-500">
                          <div>{reg.studentEmail}</div>
                          <div className="text-[10px] text-slate-400">{reg.phone}</div>
                        </td>
                        <td className="py-3.5 px-3 text-xs text-slate-400">
                          {new Date(reg.registeredAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <select
                            value={reg.status}
                            onChange={(e) =>
                              handleStatusChange(reg.id, e.target.value as EventRegistration['status'])
                            }
                            className={`rounded-xl px-2.5 py-1 text-xs font-bold outline-none cursor-pointer border ${
                              reg.status === 'Selected'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : reg.status === 'Shortlisted'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : reg.status === 'Attended'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <option value="Registered">Registered</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Selected">Selected</option>
                            <option value="Attended">Attended</option>
                            <option value="Waitlisted">Waitlisted</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-slate-400">
              <span>Showing {filteredRoster.length} of {rosterStudents.length} student records</span>
              <button
                onClick={() => setSelectedEventForRoster(null)}
                className="rounded-2xl border border-slate-200 px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          PUBLISH EVENT TO CAMPUS FEED MODAL
          ============================================================ */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Campus Feed Publishing
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                  Publish Event to Student Portal
                </h2>
                <p className="text-xs text-slate-400 font-semibold">
                  Events published here appear on students' Events & Drives page and Student Dashboard.
                </p>
              </div>
              <button
                onClick={() => setShowPublishModal(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePublishEvent} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Event / Drive Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. IEEE National Hackathon 2026 or Google Campus Placement Drive"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Category *
                  </label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                  >
                    <option value="Hackathons">Hackathons</option>
                    <option value="Placement Drives">Placement Drives</option>
                    <option value="Technical">Technical</option>
                    <option value="Workshops">Workshops</option>
                    <option value="Seminars">Seminars</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Organizer Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IEEE Student Branch or T&P Cell"
                    value={eventForm.organizer}
                    onChange={(e) => setEventForm({ ...eventForm, organizer: e.target.value })}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Time *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Registration Deadline
                  </label>
                  <input
                    type="date"
                    value={eventForm.deadline}
                    onChange={(e) => setEventForm({ ...eventForm, deadline: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Venue / Lab Location *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alan Turing Lab & Main Auditorium"
                    value={eventForm.venue}
                    onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Maximum Capacity
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 150"
                    value={eventForm.maxCapacity}
                    onChange={(e) => setEventForm({ ...eventForm, maxCapacity: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Eligibility Criteria
                </label>
                <input
                  type="text"
                  placeholder="e.g. Open to all B.Tech students (Year 2, 3, 4)"
                  value={eventForm.eligibility}
                  onChange={(e) => setEventForm({ ...eventForm, eligibility: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                />
              </div>

              {/* Preset Image Chooser */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Banner Image URL
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {presetImages.map((img) => (
                    <button
                      type="button"
                      key={img.label}
                      onClick={() => setEventForm({ ...eventForm, image: img.url })}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                        eventForm.image === img.url
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {img.label}
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  value={eventForm.image}
                  onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Event Description & Guidelines *
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide comprehensive details, themes, rules, prize pools, and requirements..."
                  value={eventForm.desc}
                  onChange={(e) => setEventForm({ ...eventForm, desc: e.target.value })}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{isSubmitting ? 'Publishing to Student Feed...' : 'Publish to Student Campus Feed'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
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
