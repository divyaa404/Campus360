import React, { useState, useEffect } from 'react';
import { api, type HeadAccount } from '../services/api';
import {
  ShieldCheck,
  Building2,
  KeyRound,
  Copy,
  Check,
  Plus,
  RefreshCw,
  Search,
  Users,
  Calendar,
  Lock,
  Mail,
  User,
  Sparkles,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

export const AdminGenerateHeadsPage: React.FC = () => {
  const [heads, setHeads] = useState<HeadAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('IEEE Student Branch');
  const [customOrg, setCustomOrg] = useState('');
  const [headTitle, setHeadTitle] = useState('IEEE Student Branch Chair');
  const [email, setEmail] = useState('ieee.head@campus360.edu');
  const [password, setPassword] = useState('Pass@9821');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Credential Modal State
  const [generatedModal, setGeneratedModal] = useState<{
    name: string;
    email: string;
    password: string;
    organization: string;
    headTitle: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  // Preset Organizations
  const presetOrgs = [
    { name: 'IEEE Student Branch', defaultTitle: 'IEEE Student Branch Chair', emailPrefix: 'ieee' },
    { name: 'Training & Placement Cell (TnP)', defaultTitle: 'Chief Placement Officer', emailPrefix: 'tnp' },
    { name: 'ACM Student Chapter', defaultTitle: 'ACM Chapter Lead', emailPrefix: 'acm' },
    { name: 'Cultural Society', defaultTitle: 'Cultural Secretary', emailPrefix: 'cultural' },
    { name: 'Sports Council', defaultTitle: 'Sports Committee Head', emailPrefix: 'sports' },
    { name: 'Robotics & Automation Club', defaultTitle: 'Robotics Lead Convener', emailPrefix: 'robotics' },
    { name: 'GDG on Campus (Google Developer)', defaultTitle: 'GDG Campus Organizer', emailPrefix: 'gdg' },
    { name: 'E-Cell (Entrepreneurship)', defaultTitle: 'E-Cell President', emailPrefix: 'ecell' },
    { name: 'Other / Custom Organization', defaultTitle: 'Convener & Head', emailPrefix: 'club' },
  ];

  const loadHeads = async () => {
    setIsLoading(true);
    try {
      const data = await api.getHeads();
      setHeads(data);
    } catch (err) {
      console.error('Failed to load heads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHeads();
  }, []);

  const handleOrgChange = (orgName: string) => {
    setOrganization(orgName);
    const found = presetOrgs.find((p) => p.name === orgName);
    if (found) {
      setHeadTitle(found.defaultTitle);
      setEmail(`${found.emailPrefix}.head@campus360.edu`);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let res = 'Head@';
    for (let i = 0; i < 5; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
  };

  const handleCreateHead = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const finalOrg = organization === 'Other / Custom Organization' ? customOrg : organization;

    if (!finalOrg.trim() || !name.trim()) {
      setError('Please provide Head Name and Organization');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await api.generateHead({
        name: name.trim(),
        email: email.trim(),
        organization: finalOrg,
        headTitle: headTitle.trim() || `${finalOrg} Head`,
        password: password.trim(),
      });

      setGeneratedModal({
        name: res.credentials.name,
        email: res.credentials.email,
        password: res.credentials.temporaryPassword,
        organization: res.credentials.organization,
        headTitle: res.credentials.headTitle,
      });

      // Clear form & reload
      setName('');
      generateRandomPassword();
      loadHeads();
    } catch (err: any) {
      setError(err.message || 'Failed to generate head credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (headId: string) => {
    try {
      const res = await api.resetHeadPassword(headId);
      alert(`New Temporary Password for ${res.email}: ${res.temporaryPassword}\n\nThe head must set a new password on next login.`);
      loadHeads();
    } catch (err) {
      console.error('Failed to reset password:', err);
    }
  };

  const handleCopyCredentials = () => {
    if (!generatedModal) return;
    const text = `Campus360 Head Credentials:\nPortal: http://localhost:5173/login\nRole: Club / Dept Head\nOrganization: ${generatedModal.organization} (${generatedModal.headTitle})\nLogin ID / Email: ${generatedModal.email}\nTemporary Password: ${generatedModal.password}\nNote: You will be asked to configure your permanent password on first login.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredHeads = heads.filter((h) => {
    return (
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.organization && h.organization.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
            Super Administrator Authority
          </span>
          <span className="text-xs text-slate-400 font-semibold">• Head Credentials Generator</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Generate & Manage Head Credentials
        </h1>
        <p className="text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
          Create login IDs and temporary passwords for club/department heads (IEEE, T&P, ACM, Cultural, Sports, etc.).
          Upon first login, heads will be required to set their permanent password.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Generator Form */}
        <div className="lg:col-span-1 rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Credential Generator</span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">Issue Head Login</h2>
            <p className="text-xs text-slate-400 font-medium">Generates official head account with mandatory first-login password update</p>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCreateHead} className="space-y-4">
            {/* Organization Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Club / Department *
              </label>
              <select
                value={organization}
                onChange={(e) => handleOrgChange(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
              >
                {presetOrgs.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Org if chosen */}
            {organization === 'Other / Custom Organization' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Custom Organization Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Astronomy Club or Rotaract Society"
                  value={customOrg}
                  onChange={(e) => setCustomOrg(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                />
              </div>
            )}

            {/* Head Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Head In-Charge Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Prof. Rajesh Varma or Dr. Ananya Sen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                />
              </div>
            </div>

            {/* Head Title / Designation */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Official Head Title
              </label>
              <input
                type="text"
                placeholder="e.g. IEEE Branch Chair / Convener"
                value={headTitle}
                onChange={(e) => setHeadTitle(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
              />
            </div>

            {/* Generated Email / Login ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Assigned Login ID / Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                />
              </div>
            </div>

            {/* Temporary Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Temporary Password *
                </label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Regenerate
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3.5 text-xs font-mono font-bold text-slate-800 outline-none focus:border-indigo-400 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span>{isSubmitting ? 'Generating...' : 'Generate & Save Head Credentials'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Head Accounts Directory */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Directory</span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                Active Head Accounts ({heads.length})
              </h2>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search heads or clubs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredHeads.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                No head accounts found
              </div>
            ) : (
              <table className="w-full text-left text-sm text-slate-600">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-3">Head Name & Role</th>
                    <th className="py-3 px-3">Organization</th>
                    <th className="py-3 px-3">Login ID / Email</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-center">Events</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHeads.map((head) => (
                    <tr key={head.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs shadow-sm">
                            {head.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-xs">{head.name}</p>
                            <span className="text-[10px] text-slate-400">{head.headTitle}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="inline-block rounded-xl bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                          {head.organization}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-xs font-mono font-semibold text-slate-600">
                        {head.email}
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block rounded-xl px-2.5 py-0.5 text-[10px] font-bold ${
                            head.mustChangePassword
                              ? 'bg-amber-50 text-amber-600 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          }`}
                        >
                          {head.mustChangePassword ? '1st Login Pending' : 'Active'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {head.eventsCount}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => handleResetPassword(head.id)}
                          className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                          Reset Pass
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
          CREDENTIAL GENERATION CONFIRMATION SLIP MODAL
          ============================================================ */}
      {generatedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Check className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Head Credentials Generated!</h3>
              <p className="text-xs text-slate-500">
                Share these login details with the appointed head. They will set their permanent password upon login.
              </p>
            </div>

            {/* Credential Slip Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3 font-sans">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-semibold">Organization:</span>
                <span className="font-bold text-slate-800">{generatedModal.organization}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-semibold">Appointee Name:</span>
                <span className="font-bold text-slate-800">{generatedModal.name}</span>
              </div>
              <div className="border-t border-slate-200/70 pt-2 flex justify-between text-xs items-center">
                <span className="text-slate-400 font-semibold">Login ID / Email:</span>
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {generatedModal.email}
                </span>
              </div>
              <div className="flex justify-between text-xs items-center">
                <span className="text-slate-400 font-semibold">Temporary Password:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">
                  {generatedModal.password}
                </span>
              </div>
              <div className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200 leading-relaxed">
                ⚡ First-Login Notice: When this head logs in with these credentials, the system will prompt them for password & confirm password.
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyCredentials}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-all"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
              </button>
              <button
                onClick={() => setGeneratedModal(null)}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
