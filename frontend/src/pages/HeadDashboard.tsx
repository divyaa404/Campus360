import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, type EventItem, type EventRegistration } from '../services/api';
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
  Phone,
  Mail,
  GraduationCap,
  X,
  Share2,
  Check,
  AlertCircle
} from 'lucide-react';

export const HeadDashboard: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // New Event Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    category: 'Technical',
    date: '',
    time: '10:00 AM',
    venue: '',
    desc: '',
    deadline: '',
    maxCapacity: 100,
    eligibility: 'All Departments & Semesters',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=60',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allEvents = await api.getEvents();
      // STRICT ISOLATION: Only show events created by this specific head
      // A head can NEVER see other heads' events
      const myEvents = allEvents.filter(
        (e) => e.createdByHeadId === user?.id
      );

      setEvents(myEvents);
      if (myEvents.length > 0) {
        const defaultEvtId = myEvents[0].id;
        setSelectedEventId(defaultEvtId);
        loadEventRegistrations(defaultEvtId);
      } else {
        setRegistrations([]);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEventRegistrations = async (eventId: string) => {
    try {
      const res = await api.getEventRegistrations(eventId);
      setRegistrations(res.students);
    } catch (err) {
      console.error('Failed to fetch registrations:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSelectEvent = (id: string) => {
    setSelectedEventId(id);
    loadEventRegistrations(id);
  };

  const handleStatusChange = async (regId: string, newStatus: EventRegistration['status']) => {
    try {
      await api.updateRegistrationStatus(selectedEventId, regId, newStatus);
      setRegistrations((prev) =>
        prev.map((r) => (r.id === regId ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await api.postEvent({
        ...eventForm,
        organizer: user?.organization || 'Campus Organization',
        organizerRole: user?.headTitle,
        headId: user?.id,
      });

      setCreateSuccess(true);
      setTimeout(() => {
        setCreateSuccess(false);
        setShowCreateModal(false);
        loadData();
      }, 1200);
    } catch (err) {
      console.error('Failed to create event:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (registrations.length === 0) return;
    const currentEvt = events.find((e) => e.id === selectedEventId);
    const headers = 'Student Name,Roll Number,Email,Department,Year,Phone,Registered At,Status\n';
    const rows = registrations
      .map(
        (r) =>
          `"${r.studentName}","${r.rollNumber}","${r.studentEmail}","${r.department}","${r.year}","${r.phone}","${r.registeredAt}","${r.status}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(currentEvt?.title || 'event').replace(/[^a-z0-9]/gi, '_')}_applicants.csv`;
    a.click();
  };

  const currentEvent = events.find((e) => e.id === selectedEventId);

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.studentEmail.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'All') return matchesSearch;
    return reg.status.toLowerCase() === statusFilter.toLowerCase() && matchesSearch;
  });

  const totalRegisteredCount = events.reduce((acc, ev) => acc + (ev.registeredCount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Top Head Welcome Banner */}
      <div className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3.5 py-1 text-xs font-bold text-indigo-200 border border-indigo-400/30">
                <Building2 className="h-3.5 w-3.5 text-indigo-300" />
                {user?.organization || 'Club / Department Head Portal'}
              </span>
              <span className="text-xs text-indigo-300 font-semibold">• Official Management Cell</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {user?.name || 'Head Dashboard'}
            </h1>
            <p className="text-sm text-indigo-200/90 max-w-2xl leading-relaxed">
              Post new events, review registered student applicants, track attendance, and broadcast official updates to students.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-pink px-6 py-3.5 text-sm font-bold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            <Plus className="h-5 w-5" />
            <span>Post New Event</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Events Posted</span>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">{events.length}</p>
            <span className="text-[11px] font-semibold text-indigo-600">Active campus listings</span>
          </div>
          <div className="rounded-2xl bg-indigo-50 p-4 text-indigo-600">
            <Calendar className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Applicants</span>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">{totalRegisteredCount || registrations.length}</p>
            <span className="text-[11px] font-semibold text-emerald-600">Registered across events</span>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-600">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Selected / Shortlisted</span>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">
              {registrations.filter((r) => r.status === 'Shortlisted' || r.status === 'Selected').length}
            </p>
            <span className="text-[11px] font-semibold text-amber-600">In current selected event</span>
          </div>
          <div className="rounded-2xl bg-amber-50 p-4 text-amber-600">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Head Authority</span>
            <p className="text-base font-extrabold text-slate-800 mt-2 truncate max-w-44">
              {user?.headTitle || 'Designated Lead'}
            </p>
            <span className="text-[11px] font-semibold text-slate-400">Campus360 Verified</span>
          </div>
          <div className="rounded-2xl bg-slate-100 p-4 text-slate-700">
            <Building2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Section 1: Posted Events Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Your Posted Events</h2>
            <p className="text-xs text-slate-500 font-semibold">Click on any event below to inspect its student applicants list</p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
            {events.length} Events Organized
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {events.map((evt) => {
            const isSelected = evt.id === selectedEventId;
            return (
              <div
                key={evt.id}
                onClick={() => handleSelectEvent(evt.id)}
                className={`cursor-pointer rounded-3xl border bg-white p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-xl bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 border border-indigo-100">
                      {evt.category}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                      <Users className="h-3.5 w-3.5 text-slate-500" />
                      {evt.registeredCount ?? registrations.length} Applied
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2">
                    {evt.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{evt.date} • {evt.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{evt.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {isSelected ? '✓ Currently Viewing Applicants' : 'Click to View Applicants'}
                  </span>
                  <span className="text-[10px] text-slate-400">Cap: {evt.maxCapacity || 100}</span>
                </div>
              </div>
            );
          })}

          {events.length === 0 && !isLoading && (
            <div className="col-span-3 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 mb-4">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">No Events Posted Yet</h3>
              <p className="text-sm text-slate-500 font-medium mt-2 max-w-sm mx-auto">
                You haven't posted any events yet. Click "Post New Event" above to create your first event — it will be published to the student campus feed automatically.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-6 flex items-center gap-2 mx-auto rounded-2xl bg-gradient-to-r from-brand-orange to-brand-pink px-6 py-3 text-sm font-bold text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
              >
                <Plus className="h-4 w-4" />
                Post Your First Event
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Applied Students List */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                Applicant Roster
              </span>
              <span className="text-xs font-bold text-slate-400">
                {currentEvent ? currentEvent.title : 'Selected Event'}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              Registered Students ({filteredRegistrations.length})
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, roll number, dept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-400 focus:bg-white"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            {['All', 'Registered', 'Shortlisted', 'Selected', 'Attended'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  statusFilter === status
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table of Applied Students */}
        <div className="overflow-x-auto">
          {filteredRegistrations.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Users className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">No applicants match your criteria</p>
              <p className="text-xs text-slate-400">
                Students will appear here as soon as they register from the events portal.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Student Name & Roll</th>
                  <th className="py-3 px-4">Department & Year</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRegistrations.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Student Name */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-blue to-indigo-500 text-white font-bold text-sm shadow-sm">
                          {student.studentName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm">{student.studentName}</p>
                          <span className="font-mono text-xs text-slate-400">{student.rollNumber}</span>
                        </div>
                      </div>
                    </td>

                    {/* Department & Year */}
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-700 text-xs">{student.department}</p>
                      <span className="text-[11px] text-slate-400">Year {student.year}</span>
                    </td>

                    {/* Contact */}
                    <td className="py-4 px-4 text-xs font-semibold space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span className="truncate max-w-44">{student.studentEmail}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{student.phone}</span>
                      </div>
                    </td>

                    {/* Applied Date */}
                    <td className="py-4 px-4 text-xs font-semibold text-slate-400">
                      {new Date(student.registeredAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block rounded-xl px-3 py-1 text-xs font-bold ${
                          student.status === 'Shortlisted'
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : student.status === 'Selected'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : student.status === 'Attended'
                            ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                            : 'bg-blue-50 text-blue-600 border border-blue-200'
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>

                    {/* Action Selector */}
                    <td className="py-4 px-4 text-right">
                      <select
                        value={student.status}
                        onChange={(e) =>
                          handleStatusChange(student.id, e.target.value as EventRegistration['status'])
                        }
                        className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none hover:border-indigo-400 focus:border-indigo-500"
                      >
                        <option value="Registered">Registered</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Selected">Selected</option>
                        <option value="Attended">Attended</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ============================================================
          CREATE / POST EVENT MODAL
          ============================================================ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  {user?.organization || 'Head Organizer'}
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900">Post New Event</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {createSuccess ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="text-xl font-bold text-slate-900">Event Published Successfully!</h4>
                <p className="text-xs text-slate-500">
                  Event is now visible on Campus360 and student registrations are active.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Event Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Annual IEEE HackMatrix 2026 or T&P Mock Interview Drive"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Category *</label>
                    <select
                      value={eventForm.category}
                      onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                    >
                      <option value="Technical">Technical</option>
                      <option value="Workshops">Workshops</option>
                      <option value="Seminars">Seminars</option>
                      <option value="Hackathons">Hackathons</option>
                      <option value="Placement Drives">Placement Drives</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Sports">Sports</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Max Capacity</label>
                    <input
                      type="number"
                      placeholder="100"
                      value={eventForm.maxCapacity}
                      onChange={(e) => setEventForm({ ...eventForm, maxCapacity: Number(e.target.value) })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Event Date *</label>
                    <input
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Time</label>
                    <input
                      type="text"
                      placeholder="10:00 AM - 04:00 PM"
                      value={eventForm.time}
                      onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Venue / Location *</label>
                  <input
                    type="text"
                    placeholder="e.g. Turing Computing Lab or Main Auditorium"
                    value={eventForm.venue}
                    onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Eligibility</label>
                  <input
                    type="text"
                    placeholder="e.g. Open to all B.Tech students (Year 2 to 4)"
                    value={eventForm.eligibility}
                    onChange={(e) => setEventForm({ ...eventForm, eligibility: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Description *</label>
                  <textarea
                    rows={3}
                    placeholder="Provide event overview, schedule, rules, and rewards..."
                    value={eventForm.desc}
                    onChange={(e) => setEventForm({ ...eventForm, desc: e.target.value })}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-2xl border border-slate-200 px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-2xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Publishing...' : 'Publish Event'}
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
