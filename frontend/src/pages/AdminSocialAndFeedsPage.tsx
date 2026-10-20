import React, { useState, useEffect } from 'react';
import { api, type EventItem, type SocialPost, type OpportunityItem } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Calendar,
  Briefcase,
  Plus,
  Heart,
  Pin,
  Search,
  Filter,
  Users,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  Send,
  Building2,
  CheckCircle,
  Eye,
  X
} from 'lucide-react';

export const AdminSocialAndFeedsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'social' | 'events' | 'opportunities'>('social');
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [events, setEvents] = useState<(EventItem & { registeredCount: number; registrations: any[] })[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);

  // Post Social Modal / Form
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTag, setNewPostTag] = useState('Event Announcement');
  const [isPosting, setIsPosting] = useState(false);

  // New Opportunity Modal
  const [showOppModal, setShowOppModal] = useState(false);
  const [oppForm, setOppForm] = useState({
    title: '',
    organization: '',
    category: 'Internship',
    location: 'Hybrid',
    stipend: '₹50,000 / month',
    deadline: '2026-11-30',
    description: '',
  });

  // Selected Event to view registered students
  const [inspectedEvent, setInspectedEvent] = useState<any | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const overview = await api.getAdminOverview();
      setSocialPosts(overview.socialPosts);
      setEvents(overview.events);
      setOpportunities(overview.opportunities);
    } catch (err) {
      console.error('Failed to load overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setIsPosting(true);
    try {
      const created = await api.createSocialPost({
        authorName: user?.name || 'Super Admin',
        authorRole: 'SUPER_ADMIN',
        authorOrg: 'Central Administration',
        content: newPostContent.trim(),
        tag: newPostTag,
      });

      setSocialPosts([created, ...socialPosts]);
      setNewPostContent('');
    } catch (err) {
      console.error('Failed to post:', err);
    } finally {
      setIsPosting(false);
    }
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In real or fallback API:
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(oppForm),
      });
      const data = await res.json();
      setOpportunities([data, ...opportunities]);
      setShowOppModal(false);
    } catch (err) {
      console.error('Failed to create opportunity:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-orange" />
            Super Admin Feed Center
          </span>
          <span className="text-xs text-slate-400 font-semibold">• Unified Cross-Campus Hub</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Campus Social Media, All Events & Opportunities
        </h1>
        <p className="text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
          Monitor all published events from club and department heads, inspect student application rosters, and manage campus-wide social updates and career opportunities.
        </p>

        {/* 3 Unified Tabs */}
        <div className="flex flex-wrap gap-2 pt-4">
          <button
            onClick={() => setActiveTab('social')}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'social'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Campus Social Feed ({socialPosts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'events'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>All Campus Events & Rosters ({events.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('opportunities')}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'opportunities'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>Opportunity Posts ({opportunities.length})</span>
          </button>
        </div>
      </div>

      {/* ============================================================
          TAB 1: SOCIAL MEDIA & COMMUNITY FEED
          ============================================================ */}
      {activeTab === 'social' && (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Compose Official Social Post */}
          <div className="lg:col-span-1 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div>
              <span className="text-xs font-bold text-brand-orange uppercase tracking-wider">Super Admin Post</span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">Broadcast Announcement</h2>
              <p className="text-xs text-slate-400 font-medium">Post to all student and head social streams</p>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Tag / Channel</label>
                <select
                  value={newPostTag}
                  onChange={(e) => setNewPostTag(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-slate-400 focus:bg-white"
                >
                  <option value="Event Announcement">Event Announcement</option>
                  <option value="Placement Alert">Placement Alert</option>
                  <option value="Campus Life">Campus Life</option>
                  <option value="Achievement">Achievement</option>
                  <option value="General">General Notice</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Message</label>
                <textarea
                  rows={4}
                  placeholder="Share important updates, festival announcements, or placement alerts..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-xs font-semibold outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isPosting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-pink py-3 text-xs font-bold text-white shadow-md hover:opacity-95 transition-all disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>{isPosting ? 'Publishing...' : 'Publish to Campus Feed'}</span>
              </button>
            </form>
          </div>

          {/* Right: Social Stream */}
          <div className="lg:col-span-2 space-y-4">
            {socialPosts.map((post) => (
              <div
                key={post.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-orange to-brand-pink text-white font-bold text-sm shadow-sm">
                      {post.authorName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm">{post.authorName}</h4>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            post.authorRole === 'SUPER_ADMIN'
                              ? 'bg-slate-900 text-white'
                              : post.authorRole === 'HEAD'
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {post.authorRole === 'SUPER_ADMIN' ? 'Super Admin' : post.authorRole === 'HEAD' ? 'Club Head' : 'Student'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">{post.authorOrg}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {post.isPinned && (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 border border-amber-200">
                        <Pin className="h-3 w-3" /> Pinned
                      </span>
                    )}
                    <span className="rounded-xl bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                      {post.tag}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm text-slate-700 leading-relaxed font-normal">{post.content}</p>

                {/* Attached Image if any */}
                {post.imageUrl && (
                  <div className="rounded-2xl overflow-hidden max-h-72 border border-slate-100">
                    <img src={post.imageUrl} alt="post visual" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Post Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400 font-semibold">
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-slate-600">
                      <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                      {post.likes} likes
                    </span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <MessageSquare className="h-4 w-4 text-slate-400" />
                      {post.commentsCount} comments
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 2: ALL CAMPUS EVENTS & ROSTERS
          ============================================================ */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-xl bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-100">
                      {evt.category}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
                      <Users className="h-3.5 w-3.5" />
                      {evt.registeredCount} Applicants
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900 leading-snug">{evt.title}</h3>
                  <span className="text-xs font-bold text-brand-orange bg-orange-50 px-2.5 py-1 rounded-lg">
                    Organized by: {evt.organizer}
                  </span>

                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{evt.desc}</p>

                  <div className="space-y-1.5 text-xs text-slate-500 font-medium border-t border-slate-50 pt-3">
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

                <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between">
                  <button
                    onClick={() => setInspectedEvent(evt)}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Student Applicants ({evt.registeredCount})</span>
                  </button>
                  <span className="text-[11px] text-slate-400">Cap: {evt.maxCapacity || 100}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 3: OPPORTUNITY POSTS
          ============================================================ */}
      {activeTab === 'opportunities' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Career & Placement Opportunities</h2>
              <p className="text-xs text-slate-500 font-medium">Internships, campus placements, and research fellowships</p>
            </div>
            <button
              onClick={() => setShowOppModal(true)}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-pink px-5 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95"
            >
              <Plus className="h-4 w-4" />
              <span>Post New Opportunity</span>
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-xl bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      {opp.category}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{opp.location}</span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">{opp.title}</h3>
                  <p className="text-xs font-bold text-indigo-600">{opp.organization}</p>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{opp.description}</p>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-600">{opp.stipend}</span>
                  <span className="text-slate-400 font-semibold">{opp.applicantsCount} Applied</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: APPLIED STUDENTS ROSTER FOR SELECTED EVENT (Super Admin view)
          ============================================================ */}
      {inspectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-brand-orange uppercase tracking-wider">
                  Event Applicant Roster • {inspectedEvent.organizer}
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900">{inspectedEvent.title}</h3>
                <p className="text-xs text-slate-400 font-medium">Total Registered Students: {inspectedEvent.registrations?.length || 0}</p>
              </div>
              <button
                onClick={() => setInspectedEvent(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {!inspectedEvent.registrations || inspectedEvent.registrations.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm font-semibold">
                  No student has registered for this event yet.
                </div>
              ) : (
                <table className="w-full text-left text-sm text-slate-600">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Roll Number</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">Email</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inspectedEvent.registrations.map((st: any) => (
                      <tr key={st.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-bold text-slate-900">{st.studentName}</td>
                        <td className="py-3 px-3 font-mono text-xs text-slate-500">{st.rollNumber}</td>
                        <td className="py-3 px-3 text-xs">{st.department}</td>
                        <td className="py-3 px-3 text-xs text-slate-500">{st.studentEmail}</td>
                        <td className="py-3 px-3 text-right">
                          <span className="inline-block rounded-xl px-2.5 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {st.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectedEvent(null)}
                className="rounded-2xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: ADD OPPORTUNITY POST
          ============================================================ */}
      {showOppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xl font-extrabold text-slate-900">Post Opportunity</h3>
              <button onClick={() => setShowOppModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOpportunity} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Role / Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Frontend Developer Intern"
                  value={oppForm.title}
                  onChange={(e) => setOppForm({ ...oppForm, title: e.target.value })}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">Organization *</label>
                  <input
                    type="text"
                    placeholder="e.g. Adobe"
                    value={oppForm.organization}
                    onChange={(e) => setOppForm({ ...oppForm, organization: e.target.value })}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">Category</label>
                  <select
                    value={oppForm.category}
                    onChange={(e) => setOppForm({ ...oppForm, category: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:bg-white"
                  >
                    <option value="Internship">Internship</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Fellowship">Fellowship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">Stipend / CTC</label>
                  <input
                    type="text"
                    value={oppForm.stipend}
                    onChange={(e) => setOppForm({ ...oppForm, stipend: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">Deadline</label>
                  <input
                    type="date"
                    value={oppForm.deadline}
                    onChange={(e) => setOppForm({ ...oppForm, deadline: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Description *</label>
                <textarea
                  rows={3}
                  value={oppForm.description}
                  onChange={(e) => setOppForm({ ...oppForm, description: e.target.value })}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOppModal(false)}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-slate-800"
                >
                  Publish Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
