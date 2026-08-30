import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Mail, 
  Phone, 
  GraduationCap, 
  FileText, 
  Plus, 
  Globe, 
  Edit3, 
  Check, 
  Briefcase,
  Code
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  
  const [skills, setSkills] = useState(['React', 'TypeScript', 'Tailwind', 'Node.js', 'Python', 'SQL']);
  const [interests, setInterests] = useState(['Software Engineering', 'Mobile App Dev', 'AI/ML']);
  
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [resumeName, setResumeName] = useState('aarav_sharma_resume.pdf');

  // Form states for profile editing
  const [phone, setPhone] = useState('9876543210');
  const [cgpa, setCgpa] = useState('8.2');
  const [careerInterests, setCareerInterests] = useState('Full Stack / Mobile App Developer roles');

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill('');
    }
  };

  const handleAddInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (newInterest && !interests.includes(newInterest)) {
      setInterests([...interests, newInterest]);
      setNewInterest('');
    }
  };

  const handleSaveProfile = () => {
    updateProfile({
      phone,
      careerInterests,
    });
    setIsEditing(false);
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeName(e.target.files[0].name);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Your Profile</h1>
        <p className="text-sm text-slate-500 font-medium">Manage your academic credentials, technical skills, resume portfolio, and external accounts.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Basic Info Box */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="text-center space-y-3">
            <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-brand-orange to-brand-pink text-white font-extrabold text-4xl flex items-center justify-center mx-auto shadow-md">
              {user?.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-extrabold text-slate-800 text-lg leading-snug">{user?.name}</h2>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{user?.role} Portal</p>
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-5 text-sm font-semibold text-slate-600">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-slate-400 shrink-0" />
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-slate-400 shrink-0" />
              {isEditing ? (
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold focus:outline-none focus:bg-white"
                />
              ) : (
                <span>{phone}</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-slate-400 shrink-0" />
              <span>{user?.department}</span>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-slate-400 shrink-0" />
              {isEditing ? (
                <input
                  type="text"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold focus:outline-none focus:bg-white"
                />
              ) : (
                <span>CGPA: {cgpa}</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-slate-400 shrink-0" />
              {isEditing ? (
                <input
                  type="text"
                  value={careerInterests}
                  onChange={(e) => setCareerInterests(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold focus:outline-none focus:bg-white"
                />
              ) : (
                <span>{careerInterests}</span>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            {isEditing ? (
              <button
                onClick={handleSaveProfile}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
              >
                <Check className="h-4 w-4" />
                Save Details
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Skills, Interests, Resume upload */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resume Upload */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <h3 className="font-extrabold text-slate-800 text-base">Resume Portfolio</h3>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-rose-50 p-2.5 text-rose-500">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">{resumeName}</p>
                  <p className="text-[10px] text-slate-400">PDF Document • Uploaded Aug 2026</p>
                </div>
              </div>
              <label className="cursor-pointer text-center rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors">
                Upload New
                <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} />
              </label>
            </div>
          </div>

          {/* Skills & Interests Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Skills */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-800 text-base">Technical Skills</h3>
              
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span key={skill} className="rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-600">
                    {skill}
                  </span>
                ))}
              </div>

              <form onSubmit={handleAddSkill} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold outline-none focus:bg-white focus:border-slate-400"
                />
                <button type="submit" className="rounded-xl bg-slate-900 p-2 text-white hover:bg-slate-800 transition-colors">
                  <Plus className="h-4.5 w-4.5" />
                </button>
              </form>
            </div>

            {/* Interests */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-800 text-base">Career Interests</h3>

              <div className="flex flex-wrap gap-1.5">
                {interests.map((interest) => (
                  <span key={interest} className="rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-600">
                    {interest}
                  </span>
                ))}
              </div>

              <form onSubmit={handleAddInterest} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add interest..."
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold outline-none focus:bg-white focus:border-slate-400"
                />
                <button type="submit" className="rounded-xl bg-slate-900 p-2 text-white hover:bg-slate-800 transition-colors">
                  <Plus className="h-4.5 w-4.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Social accounts */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-base">External Portfolios</h3>
            
            <div className="grid gap-3 sm:grid-cols-3 text-xs font-semibold text-slate-600">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50 transition-colors">
                <Code className="h-5 w-5 text-slate-800" />
                <span>GitHub Profile</span>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50 transition-colors">
                <Briefcase className="h-5 w-5 text-brand-blue" />
                <span>LinkedIn Profile</span>
              </a>
              <a href="https://portfolio.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50 transition-colors">
                <Globe className="h-5 w-5 text-brand-green" />
                <span>Personal Website</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
