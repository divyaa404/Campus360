import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  api,
  type ScholarshipItem,
  type ScholarshipApplicant,
  type MissingStudentAlert,
  type ScholarshipNotice
} from '../services/api';
import {
  Award,
  Search,
  CircleDollarSign,
  Calendar,
  FileText,
  Users,
  AlertTriangle,
  Bell,
  Plus,
  CheckCircle2,
  Clock,
  Filter,
  Check,
  X,
  FileSpreadsheet,
  Send,
  UserCheck,
  AlertCircle,
  Sparkles,
  Building2,
  Mail,
  ExternalLink,
  Trash2
} from 'lucide-react';

export const ScholarshipsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'available' | 'applied' | 'missing' | 'notices'>('available');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Data states
  const [scholarships, setScholarships] = useState<ScholarshipItem[]>([]);
  const [applications, setApplications] = useState<ScholarshipApplicant[]>([]);
  const [missingStudents, setMissingStudents] = useState<MissingStudentAlert[]>([]);
  const [notices, setNotices] = useState<ScholarshipNotice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Apply Modal State
  const [selectedScholarshipForApply, setSelectedScholarshipForApply] = useState<ScholarshipItem | null>(null);
  const [showCreateScholarship, setShowCreateScholarship] = useState(false);
  const [isCreatingScholarship, setIsCreatingScholarship] = useState(false);
  const [scholarshipForm, setScholarshipForm] = useState({
    name: '',
    provider: '',
    category: 'Merit' as ScholarshipItem['category'],
    benefits: '',
    amount: '',
    eligibility: '',
    deadline: '',
    documents: '',
    totalQuota: '50',
    description: '',
  });
  const [applyForm, setApplyForm] = useState({
    studentName: user?.name || '',
    studentEmail: user?.email || '',
    rollNumber: user?.rollNumber || '',
    department: user?.department || '',
    year: user?.year || '',
    cgpa: '',
    familyIncome: '',
    category: 'General',
    hasTranscripts: true,
    hasIncomeCert: true,
    hasCollegeId: true,
  });
  const [isSubmittingApply, setIsSubmittingApply] = useState(false);
  const [applySuccessModal, setApplySuccessModal] = useState<ScholarshipApplicant | null>(null);

  // Post Notice Modal State
  const [showPostNoticeModal, setShowPostNoticeModal] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    source: 'Scholarship Disbursal & Welfare Cell',
    category: 'Merit Scheme',
    priority: 'High' as 'Urgent' | 'High' | 'General',
    deadline: '2026-11-25',
    desc: '',
    attachment: 'Official_Notification_2026.pdf',
  });
  const [isPostingNotice, setIsPostingNotice] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Status Filter in Roster
  const [rosterStatusFilter, setRosterStatusFilter] = useState('All');
  const [remindedIds, setRemindedIds] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const [schs, apps, missing, nots] = await Promise.all([
        api.getScholarships(),
        api.getScholarshipApplications(
          user?.role === 'STUDENT' ? user.id : undefined,
          user?.role === 'STUDENT' ? user.email : undefined
        ),
        api.getMissingStudents(),
        api.getScholarshipNotices(),
      ]);
      setScholarships(schs);
      setApplications(apps);
      setMissingStudents(missing);
      setNotices(nots);
    } catch (err) {
      console.error('Failed to load scholarships data:', err);
      setLoadError(err instanceof Error ? err.message : 'Unable to load scholarship data.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateScholarship = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingScholarship(true);
    setLoadError('');
    try {
      const created = await api.createScholarship({
        ...scholarshipForm,
        totalQuota: Number(scholarshipForm.totalQuota),
      });
      setScholarships((current) => [created, ...current]);
      setShowCreateScholarship(false);
      setScholarshipForm({
        name: '',
        provider: '',
        category: 'Merit',
        benefits: '',
        amount: '',
        eligibility: '',
        deadline: '',
        documents: '',
        totalQuota: '50',
        description: '',
      });
      setSuccessToast(`Scholarship "${created.name}" published.`);
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Unable to create scholarship.');
    } finally {
      setIsCreatingScholarship(false);
    }
  };

  const handleDeleteScholarship = async (scholarship: ScholarshipItem) => {
    if (!window.confirm(`Delete "${scholarship.name}" and its applications?`)) return;
    setLoadError('');
    try {
      await api.deleteScholarship(scholarship.id);
      setScholarships((current) => current.filter((item) => item.id !== scholarship.id));
      setApplications((current) => current.filter((application) => application.scholarshipId !== scholarship.id));
      setSuccessToast(`Scholarship "${scholarship.name}" deleted.`);
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      console.error('Failed to delete scholarship:', err);
      setLoadError(err instanceof Error ? err.message : 'Unable to delete scholarship.');
    }
  };

  const handleDeleteScholarshipNotice = async (notice: ScholarshipNotice) => {
    if (!window.confirm(`Delete the notice "${notice.title}"?`)) return;
    setLoadError('');
    try {
      await api.deleteNotice(notice.id);
      setNotices((current) => current.filter((item) => item.id !== notice.id));
      setSuccessToast(`Notice "${notice.title}" deleted.`);
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      console.error('Failed to delete scholarship notice:', err);
      setLoadError(err instanceof Error ? err.message : 'Unable to delete scholarship notice.');
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScholarshipForApply) return;

    setIsSubmittingApply(true);
    try {
      const created = await api.applyForScholarship({
        scholarshipId: selectedScholarshipForApply.id,
        scholarshipName: selectedScholarshipForApply.name,
        studentId: user?.id || '',
        studentName: applyForm.studentName,
        studentEmail: applyForm.studentEmail,
        rollNumber: applyForm.rollNumber,
        department: applyForm.department,
        year: applyForm.year,
        cgpa: applyForm.cgpa,
        familyIncome: applyForm.familyIncome,
        category: applyForm.category,
      });

      setSelectedScholarshipForApply(null);
      setApplySuccessModal(created);
      await loadData();
    } catch (err) {
      console.error('Failed to apply:', err);
      setLoadError(err instanceof Error ? err.message : 'Unable to submit application.');
    } finally {
      setIsSubmittingApply(false);
    }
  };

  const handleStatusChange = async (appId: string, status: ScholarshipApplicant['status']) => {
    try {
      await api.updateScholarshipApplicantStatus(appId, status);
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status } : a))
      );
      setSuccessToast(`Application status updated to "${status}"`);
      setTimeout(() => setSuccessToast(''), 3000);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Unable to update application status.');
    }
  };

  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.desc.trim()) return;

    setIsPostingNotice(true);
    try {
      const created = await api.postScholarshipNotice({
        title: noticeForm.title.trim(),
        source: noticeForm.source,
        category: noticeForm.category,
        priority: noticeForm.priority,
        deadline: noticeForm.deadline,
        desc: noticeForm.desc.trim(),
        attachment: noticeForm.attachment,
      });

      setNotices([created, ...notices]);
      setShowPostNoticeModal(false);
      setNoticeForm({
        title: '',
        source: 'Scholarship Disbursal Cell',
        category: 'Merit Scheme',
        priority: 'High',
        deadline: '2026-11-25',
        desc: '',
        attachment: 'Official_Notification_2026.pdf',
      });
      setSuccessToast(`Scholarship Notice "${created.title}" posted successfully!`);
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      console.error('Failed to post scholarship notice:', err);
      setLoadError(err instanceof Error ? err.message : 'Unable to publish scholarship notice.');
    } finally {
      setIsPostingNotice(false);
    }
  };

  const handleSendReminder = (id: string, name: string) => {
    setRemindedIds((prev) => [...prev, id]);
    setSuccessToast(`Application reminder sent to ${name} via campus email.`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleExportApplicationsCSV = () => {
    if (applications.length === 0) return;
    const headers = 'Applicant Name,Roll Number,Department,Year,Scholarship Name,CGPA,Income,Category,Applied Date,Status\n';
    const rows = applications
      .map(
        (a) =>
          `"${a.studentName}","${a.rollNumber}","${a.department}","${a.year}","${a.scholarshipName}","${a.cgpa}","${a.familyIncome}","${a.category}","${a.appliedDate}","${a.status}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Scholarship_Applicants_Roster_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Filtered available scholarships
  const filteredScholarships = scholarships.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.eligibility.toLowerCase().includes(searchQuery.toLowerCase());

    if (categoryFilter === 'All') return matchesSearch;
    return s.category === categoryFilter && matchesSearch;
  });

  // Filtered applicants
  const filteredApplicants = applications.filter((a) => {
    const matchesSearch =
      a.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.scholarshipName.toLowerCase().includes(searchQuery.toLowerCase());

    if (rosterStatusFilter === 'All') return matchesSearch;
    return a.status.toLowerCase() === rosterStatusFilter.toLowerCase() && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {loadError && (
        <div role="alert" className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900">
          {loadError}
        </div>
      )}
      {/* Top Banner Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
              <Award className="h-3.5 w-3.5 text-amber-600" />
              Scholarships & Financial Aid Hub
            </span>
            <span className="text-xs text-slate-400 font-semibold">• College Administration & State Directorate</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Scholarships & Grants Portal
          </h1>
          <p className="text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
            Discover merit waivers, government schemes, need-based funds, and research grants. Track applicants, alert students with missing submissions, and post official notices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {user?.role === 'SUPER_ADMIN' && (
            <>
              <button
                onClick={() => setShowCreateScholarship(true)}
                className="flex items-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-800 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Add Scholarship</span>
              </button>
              <button
                onClick={() => setShowPostNoticeModal(true)}
                className="flex items-center gap-2 rounded-2xl border border-blue-200 bg-white px-5 py-3 text-xs font-bold text-blue-800 shadow-sm hover:bg-blue-50 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Post Scholarship Notice</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Success Toast Notification */}
      {successToast && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-xs font-bold text-emerald-800 flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-emerald-700 hover:text-emerald-950 font-bold">✕</button>
        </div>
      )}

      {/* 4 Interactive Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('available')}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'available'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Available Scholarships ({scholarships.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('applied')}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'applied'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Who Have Applied ({applications.length})</span>
          </button>

          {user?.role !== 'STUDENT' && (
            <button
              onClick={() => setActiveTab('missing')}
              className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'missing'
                  ? 'bg-blue-700 text-white shadow-md'
                  : 'bg-white text-blue-800 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Who Are Missing ({missingStudents.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('notices')}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'notices'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Bell className="h-4 w-4" />
            <span>Scholarship Notices ({notices.length})</span>
          </button>
        </div>

        {/* Global Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search in portal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-9 pr-3.5 text-xs font-semibold outline-none focus:border-indigo-400 shadow-sm"
          />
        </div>
      </div>

      {/* ============================================================
          TAB 1: AVAILABLE SCHOLARSHIPS
          ============================================================ */}
      {activeTab === 'available' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {['All', 'Merit', 'Women-STEM', 'Need-Based', 'Sports', 'Government'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  categoryFilter === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat === 'All' ? 'All Schemes' : cat}
              </button>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {isLoading ? (
              <div className="col-span-2 rounded-3xl border border-blue-100 bg-white py-16 text-center text-sm font-semibold text-slate-500">
                Loading scholarships...
              </div>
            ) : filteredScholarships.length === 0 ? (
              <div className="col-span-2 rounded-3xl border border-blue-100 bg-white py-16 text-center text-sm font-semibold text-slate-500">
                No scholarships match your search.
              </div>
            ) : filteredScholarships.map((s) => (
              <div
                key={s.id}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm flex flex-col justify-between hover:shadow-md transition-all space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-bold shadow-sm">
                        <Award className="h-6 w-6" />
                      </div>
                      <div>
                        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 uppercase tracking-wider border border-amber-200">
                          {s.category}
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-lg leading-snug mt-1">
                          {s.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-semibold">{s.provider}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    {s.description}
                  </p>

                  <div className="rounded-2xl bg-slate-50 p-4 space-y-2.5 border border-slate-100 text-xs font-medium text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold">Grant Amount:</span>
                      <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                        {s.amount}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-400 font-bold shrink-0">Eligibility:</span>
                      <span className="text-right text-slate-700 font-semibold">{s.eligibility}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold">Deadline:</span>
                      <span className="font-bold text-rose-600 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {s.deadline}
                      </span>
                    </div>
                    <div className="border-t border-slate-200/70 pt-2 flex items-start gap-1 text-[11px] text-slate-500">
                      <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span><strong>Documents:</strong> {s.documents}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
                  <span className="text-xs font-bold text-slate-400">
                    Quota: {s.applicantsCount} / {s.totalQuota} Applied
                  </span>
                  <div className="flex items-center gap-2">
                    {user?.role === 'SUPER_ADMIN' && (
                      <button
                        onClick={() => handleDeleteScholarship(s)}
                        aria-label={`Delete ${s.name}`}
                        title="Delete scholarship"
                        className="rounded-2xl border border-rose-200 bg-rose-50 p-2.5 text-rose-600 hover:bg-rose-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedScholarshipForApply(s)}
                      className="flex items-center gap-1.5 rounded-2xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 shadow-md transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Apply for Scholarship</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 2: WHO HAVE APPLIED (APPLICANT ROSTER)
          ============================================================ */}
      {activeTab === 'applied' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Submitted Scholarship Applications ({filteredApplicants.length})
              </h2>
              <p className="text-xs text-slate-400 font-semibold">
                Review applicant merit profiles, income eligibility, and update verification stages.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={rosterStatusFilter}
                onChange={(e) => setRosterStatusFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-slate-700 outline-none focus:border-indigo-400 shadow-sm"
              >
                <option value="All">All Statuses</option>
                <option value="Approved">Approved</option>
                <option value="Under Review">Under Review</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Documents Verified">Documents Verified</option>
                <option value="Rejected">Rejected</option>
              </select>

              <button
                onClick={handleExportApplicationsCSV}
                className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">Student Applicant</th>
                  <th className="py-3.5 px-3">Roll Number</th>
                  <th className="py-3.5 px-3">Scholarship Scheme</th>
                  <th className="py-3.5 px-3">CGPA & Income</th>
                  <th className="py-3.5 px-3">Applied Date</th>
                  <th className="py-3.5 px-4 text-right">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplicants.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{app.studentName}</p>
                        <span className="text-[11px] text-slate-400">{app.department} (Yr {app.year})</span>
                      </div>
                    </td>

                    <td className="py-4 px-3 font-mono font-bold text-xs text-indigo-700">
                      {app.rollNumber}
                    </td>

                    <td className="py-4 px-3">
                      <span className="font-semibold text-slate-800 text-xs block">
                        {app.scholarshipName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">{app.category}</span>
                    </td>

                    <td className="py-4 px-3 text-xs">
                      <div className="font-extrabold text-slate-800">CGPA: {app.cgpa}</div>
                      <div className="text-[11px] text-slate-400 font-medium">Income: {app.familyIncome}</div>
                    </td>

                    <td className="py-4 px-3 text-xs text-slate-500 font-medium">
                      {app.appliedDate}
                    </td>

                    <td className="py-4 px-4 text-right">
                      {user?.role === 'STUDENT' ? (
                        <span className="rounded-xl border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800">{app.status}</span>
                      ) : (
                        <select
                          value={app.status}
                          onChange={(e) =>
                            handleStatusChange(app.id, e.target.value as ScholarshipApplicant['status'])
                          }
                          className="cursor-pointer rounded-xl border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800 outline-none"
                        >
                          <option value="Under Review">Under Review</option>
                          <option value="Documents Verified">Documents Verified</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 3: WHO ARE MISSING
          ============================================================ */}
      {activeTab === 'missing' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-6 flex items-start gap-4 shadow-sm">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700 shrink-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-amber-900 text-base">
                Eligible Students Missing Out on Aid
              </h3>
              <p className="text-xs text-amber-800 font-medium leading-relaxed mt-1">
                The institutional system automatically identifies students meeting 9.0+ CGPA or verified EWS criteria who have not yet submitted their scholarship application, or who have pending documentation. Send reminders with a single click.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {missingStudents.map((mis) => {
              const isReminded = remindedIds.includes(mis.id);
              return (
                <div
                  key={mis.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-xl px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border ${
                          mis.reason === 'Not Yet Applied'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {mis.reason}
                      </span>
                      <span className="font-extrabold text-indigo-700 text-xs">
                        CGPA: {mis.cgpa}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">{mis.studentName}</h4>
                      <p className="text-xs text-slate-400 font-mono font-bold mt-0.5">{mis.rollNumber} • {mis.department}</p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100 text-xs space-y-1">
                      <div className="text-slate-400 font-bold">Eligible Scheme:</div>
                      <div className="font-bold text-slate-800">{mis.eligibleFor}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                        <Mail className="h-3 w-3" />
                        <span>{mis.contactEmail}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-semibold">Priority: High</span>
                    <button
                      onClick={() => handleSendReminder(mis.id, mis.studentName)}
                      disabled={isReminded}
                      className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                        isReminded
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                          : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
                      }`}
                    >
                      {isReminded ? <Check className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                      <span>{isReminded ? 'Reminder Sent ✓' : 'Send Reminder'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 4: SCHOLARSHIP NOTICES
          ============================================================ */}
      {activeTab === 'notices' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Official Scholarship Notices & Circulars
              </h2>
              <p className="text-xs text-slate-400 font-semibold">
                Direct announcements regarding deadline extensions, verification dates, and disbursals.
              </p>
            </div>

            {user?.role === 'SUPER_ADMIN' && (
              <button
                onClick={() => setShowPostNoticeModal(true)}
                className="flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Post New Notice</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {notices.map((n) => (
              <div
                key={n.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-lg px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                        n.priority === 'Urgent'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : n.priority === 'High'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      {n.priority} Notice
                    </span>
                    <span className="text-xs font-bold text-slate-400">• {n.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-semibold">{n.date}</span>
                    {user?.role === 'SUPER_ADMIN' && (
                      <button
                        onClick={() => handleDeleteScholarshipNotice(n)}
                        aria-label={`Delete ${n.title}`}
                        title="Delete notice"
                        className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 leading-snug">{n.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{n.desc}</p>

                <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-xs">
                  <span className="text-slate-400 font-semibold">
                    Issued by: <strong className="text-slate-700">{n.source}</strong>
                  </span>
                  {n.deadline && (
                    <span className="font-bold text-rose-600">
                      Submission Deadline: {n.deadline}
                    </span>
                  )}
                  {n.attachment && (
                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {n.attachment}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          APPLY FOR SCHOLARSHIP MODAL
          ============================================================ */}
      {selectedScholarshipForApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Official Application
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  Apply for {selectedScholarshipForApply.name}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {selectedScholarshipForApply.provider} • Grant: {selectedScholarshipForApply.amount}
                </p>
              </div>
              <button
                onClick={() => setSelectedScholarshipForApply(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    value={applyForm.studentName}
                    onChange={(e) => setApplyForm({ ...applyForm, studentName: e.target.value })}
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
                    value={applyForm.rollNumber}
                    onChange={(e) => setApplyForm({ ...applyForm, rollNumber: e.target.value })}
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
                    value={applyForm.department}
                    onChange={(e) => setApplyForm({ ...applyForm, department: e.target.value })}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Academic Year *
                  </label>
                  <select
                    value={applyForm.year}
                    onChange={(e) => setApplyForm({ ...applyForm, year: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Cumulative CGPA *
                  </label>
                  <input
                    type="text"
                    value={applyForm.cgpa}
                    onChange={(e) => setApplyForm({ ...applyForm, cgpa: e.target.value })}
                    required
                    placeholder="e.g. 9.35"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-bold text-indigo-700 outline-none focus:border-indigo-400 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Annual Family Income *
                  </label>
                  <input
                    type="text"
                    value={applyForm.familyIncome}
                    onChange={(e) => setApplyForm({ ...applyForm, familyIncome: e.target.value })}
                    required
                    placeholder="e.g. ₹3.5 Lakhs"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                  />
                </div>
              </div>

              {/* Mandatory Checklist */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Required Verification Documents:</span>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyForm.hasTranscripts}
                    onChange={(e) => setApplyForm({ ...applyForm, hasTranscripts: e.target.checked })}
                    className="h-4 w-4 rounded text-indigo-600"
                  />
                  <span>Semesters Grade Sheet / Official Transcript attached</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyForm.hasIncomeCert}
                    onChange={(e) => setApplyForm({ ...applyForm, hasIncomeCert: e.target.checked })}
                    className="h-4 w-4 rounded text-indigo-600"
                  />
                  <span>Valid Family Income / Category Certificate (Self-attested)</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyForm.hasCollegeId}
                    onChange={(e) => setApplyForm({ ...applyForm, hasCollegeId: e.target.checked })}
                    className="h-4 w-4 rounded text-indigo-600"
                  />
                  <span>College Identity Card & Bank Passbook Copy</span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingApply}
                  className="flex-1 rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-700 shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmittingApply ? 'Submitting Application...' : 'Submit Official Application'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedScholarshipForApply(null)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPLICATION CONFIRMATION MODAL */}
      {applySuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Check className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Application Submitted!</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your application for <strong className="text-slate-800">{applySuccessModal.scholarshipName}</strong> has been logged with Application ID <span className="font-mono text-indigo-700 font-bold">{applySuccessModal.id}</span>.
            </p>
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 text-xs text-left space-y-1 font-semibold text-slate-600">
              <div>Applicant: {applySuccessModal.studentName} ({applySuccessModal.rollNumber})</div>
              <div>Status: Under Review by Department Committee</div>
            </div>
            <button
              onClick={() => {
                setApplySuccessModal(null);
                setActiveTab('applied');
              }}
              className="w-full rounded-2xl bg-slate-900 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-colors"
            >
              View in Applications List
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          POST SCHOLARSHIP NOTICE MODAL
          ============================================================ */}
      {showPostNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Admin & Disbursal Officer
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  Post Scholarship Notice
                </h3>
              </div>
              <button
                onClick={() => setShowPostNoticeModal(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePostNotice} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Notice Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Merit Scholarship 2026 Verification Deadline Extended"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
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
                    value={noticeForm.category}
                    onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                  >
                    <option value="Merit Scheme">Merit Scheme</option>
                    <option value="Government Scheme">Government Scheme</option>
                    <option value="Need-Based Scheme">Need-Based Scheme</option>
                    <option value="Research Grant">Research Grant</option>
                    <option value="General Notice">General Notice</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Priority Tag *
                  </label>
                  <select
                    value={noticeForm.priority}
                    onChange={(e) =>
                      setNoticeForm({ ...noticeForm, priority: e.target.value as 'Urgent' | 'High' | 'General' })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Submission Deadline
                  </label>
                  <input
                    type="date"
                    value={noticeForm.deadline}
                    onChange={(e) => setNoticeForm({ ...noticeForm, deadline: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Attachment Filename
                  </label>
                  <input
                    type="text"
                    value={noticeForm.attachment}
                    onChange={(e) => setNoticeForm({ ...noticeForm, attachment: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Notice Content & Instructions *
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide precise submission guidelines, verification locations, and contact info..."
                  value={noticeForm.desc}
                  onChange={(e) => setNoticeForm({ ...noticeForm, desc: e.target.value })}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isPostingNotice}
                  className="flex-1 rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-700 shadow-md transition-all disabled:opacity-50"
                >
                  {isPostingNotice ? 'Publishing...' : 'Publish Scholarship Notice'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPostNoticeModal(false)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateScholarship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <form onSubmit={handleCreateScholarship} className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-3xl border border-blue-100 bg-white p-6 shadow-2xl sm:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Scholarship management</p>
              <h2 className="mt-1 text-xl font-extrabold text-slate-900">Create scholarship</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input aria-label="Scholarship name" placeholder="Scholarship name" required value={scholarshipForm.name} onChange={(e) => setScholarshipForm({ ...scholarshipForm, name: e.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white" />
              <input aria-label="Provider" placeholder="Provider" required value={scholarshipForm.provider} onChange={(e) => setScholarshipForm({ ...scholarshipForm, provider: e.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white" />
              <select aria-label="Category" value={scholarshipForm.category} onChange={(e) => setScholarshipForm({ ...scholarshipForm, category: e.target.value as ScholarshipItem['category'] })} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                {['Merit', 'Government', 'Need-Based', 'Women-STEM', 'Sports', 'Research'].map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
              <input aria-label="Amount" placeholder="Grant amount" value={scholarshipForm.amount} onChange={(e) => setScholarshipForm({ ...scholarshipForm, amount: e.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
              <input aria-label="Deadline" type="date" value={scholarshipForm.deadline} onChange={(e) => setScholarshipForm({ ...scholarshipForm, deadline: e.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
              <input aria-label="Total quota" type="number" min="1" value={scholarshipForm.totalQuota} onChange={(e) => setScholarshipForm({ ...scholarshipForm, totalQuota: e.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
            </div>
            <textarea aria-label="Eligibility" placeholder="Eligibility criteria" required rows={2} value={scholarshipForm.eligibility} onChange={(e) => setScholarshipForm({ ...scholarshipForm, eligibility: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
            <textarea aria-label="Benefits" placeholder="Benefits and award details" rows={2} value={scholarshipForm.benefits} onChange={(e) => setScholarshipForm({ ...scholarshipForm, benefits: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
            <textarea aria-label="Required documents" placeholder="Required documents (comma separated)" rows={2} value={scholarshipForm.documents} onChange={(e) => setScholarshipForm({ ...scholarshipForm, documents: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
            <textarea aria-label="Description" placeholder="Description" rows={3} value={scholarshipForm.description} onChange={(e) => setScholarshipForm({ ...scholarshipForm, description: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button type="button" onClick={() => setShowCreateScholarship(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={isCreatingScholarship} className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-60">
                {isCreatingScholarship ? 'Publishing...' : 'Publish scholarship'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
