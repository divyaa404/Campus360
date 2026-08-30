import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Megaphone, 
  Briefcase, 
  Calendar, 
  Award, 
  Trophy, 
  CheckSquare, 
  FolderOpen, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const features = [
    { title: 'Notices & Announcements', desc: 'Centralized notice boards from Admin, Depts, T&P, and Clubs.', icon: Megaphone, color: 'from-orange-500 to-amber-500' },
    { title: 'Internships & Placements', desc: 'LinkedIn-style opportunity board to find and apply directly.', icon: Briefcase, color: 'from-blue-500 to-indigo-500' },
    { title: 'Hackathons & Competitions', desc: 'Discover external and internal coding hackathons or ideathons.', icon: Zap, color: 'from-purple-500 to-indigo-500' },
    { title: 'Scholarships & Grants', desc: 'Track eligibility, benefits, deadlines and required documents.', icon: Award, color: 'from-pink-500 to-rose-500' },
    { title: 'Sports & Cultural Events', desc: 'Register for college fests, sports leagues, and seminars.', icon: Calendar, color: 'from-green-500 to-emerald-500' },
    { title: 'Student Achievements', desc: 'Campus community showcase for hackathon winners & researchers.', icon: Trophy, color: 'from-yellow-500 to-amber-500' },
    { title: 'Mock Tests & Prep', desc: 'Practice aptitude, coding, logical, and interview prep questions.', icon: CheckSquare, color: 'from-teal-500 to-cyan-500' },
    { title: 'Documents & Syllabus', desc: 'Quick access to syllabus, guides, and previous exam question papers.', icon: FolderOpen, color: 'from-sky-500 to-blue-500' },
    { title: 'AI-Based Recommendation', desc: 'Personalized matching scoring system based on skills & interests.', icon: Sparkles, color: 'from-violet-500 to-fuchsia-500' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl h-20 items-center justify-between px-6 sm:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-orange to-brand-pink text-white font-bold text-xl shadow-md">
              C
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-slate-800">Campus</span>
              <span className="font-bold text-xl tracking-tight text-brand-orange">360</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Features</a>
            <a href="#why-us" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Why Campus360</a>
            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Login</Link>
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="rounded-2xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 hover:shadow-lg transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left Content */}
            <div className="text-left space-y-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-4.5 py-1.5 text-xs font-bold text-brand-orange ring-1 ring-orange-500/10">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered College Resource Hub
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-slate-900 leading-tight">
                ONE CAMPUS.<br />
                <span className="bg-gradient-to-r from-brand-orange via-brand-pink to-brand-purple bg-clip-text text-transparent">
                  ALL INFORMATION.
                </span><br />
                ALL OPPORTUNITIES.
              </h1>
              <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
                Your centralized platform for college notices, placement updates, hackathons, events, and mock preparation. Powered by an AI-recommendation engine tailored to your career interests.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-pink px-7 py-3.5 text-base font-bold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  Explore Campus360
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="rounded-2xl border border-slate-200 bg-white px-7 py-3.5 text-base font-bold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Admin Portal
                </Link>
              </div>
            </div>

            {/* Right: Mock Dashboard Illustration */}
            <div className="relative lg:ml-4">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-brand-orange to-brand-purple opacity-20 blur-xl" />
              <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                {/* Header of Mock Dashboard */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex gap-1.5">
                    <span className="h-3.5 w-3.5 rounded-full bg-rose-500" />
                    <span className="h-3.5 w-3.5 rounded-full bg-amber-500" />
                    <span className="h-3.5 w-3.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="h-5 w-32 rounded-lg bg-slate-100" />
                </div>

                {/* Dashboard Inner Grid */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="col-span-2 rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-3">
                    <div className="h-4 w-1/3 rounded bg-slate-200" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-full rounded bg-slate-100" />
                      <div className="h-3 w-5/6 rounded bg-slate-100" />
                    </div>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-4 border border-purple-100/50 flex flex-col justify-between">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <div className="space-y-1">
                      <div className="text-xl font-bold text-purple-950">92%</div>
                      <div className="text-[10px] text-purple-500 font-semibold uppercase tracking-wider">AI Match</div>
                    </div>
                  </div>

                  {/* List items */}
                  <div className="col-span-3 space-y-2.5">
                    <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-brand-orange" />
                        <span className="text-xs font-semibold text-slate-700">T&P Google Recruitment Drive</span>
                      </div>
                      <span className="rounded bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-brand-orange uppercase">Notice</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-brand-blue" />
                        <span className="text-xs font-semibold text-slate-700">SIH Hackathon Registration</span>
                      </div>
                      <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-brand-blue uppercase">Event</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-slate-100/60 border-y border-slate-200/50">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 text-center space-y-12">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Everything You Need in One Unified Dashboard
            </h2>
            <p className="text-base text-slate-500">
              Campus360 centralizes information and automates notifications, preparation, and discovery for college students.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="group rounded-3xl border border-slate-200/80 bg-white p-6.5 text-left shadow-sm hover:shadow-md hover:scale-[1.01] transition-all">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${feat.color} text-white shadow-md`}>
                    <Icon className="h-5.5 w-5.5" />
                  </div>
                  <h3 className="mt-5 font-bold text-lg text-slate-800">{feat.title}</h3>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Campus360 Problem/Solution */}
      <section id="why-us" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Why Campus360?
            </h2>
            <p className="text-base text-slate-500">
              Transforming how academic and career details circulate through your campus community.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* The Problem */}
            <div className="rounded-3xl border border-rose-100 bg-rose-50/20 p-8 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-600 ring-1 ring-rose-500/10">
                The Fragmentation Problem
              </div>
              <ul className="space-y-4">
                {[
                  'Critical notifications scattered across countless Telegram & WhatsApp channels.',
                  'Missing crucial placement, internship, and scholarship application deadlines.',
                  'Wasting hours searching for official registration links and circular documents.',
                  'Departments, societies, and administrative bodies operating in silos.',
                  'Struggling to find events, hackathons, or study resources relevant to you.'
                ].map((prob, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-slate-600">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 font-bold text-xs">
                      ✕
                    </span>
                    <span>{prob}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* The Solution */}
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/20 p-8 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600 ring-1 ring-emerald-500/10">
                The Campus360 Solution
              </div>
              <ul className="space-y-4">
                {[
                  'One central repository for all announcements with custom category routing.',
                  'Real-time automated calendar deadlines for internships and scholarships.',
                  'Personalized recommendation engine scoring opportunities against your skills.',
                  'Single login dashboard connecting placements, R&D, clubs, and sports.',
                  'Built-in mock preparation panels and verified academic documents archives.'
                ].map((sol, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-slate-600">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold text-xs">
                      ✓
                    </span>
                    <span>{sol}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 flex flex-col items-center justify-between gap-6 sm:flex-row text-sm text-slate-500">
          <div>
            <span className="font-bold text-slate-800">Campus360</span>. © 2026. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-slate-800">Features</a>
            <a href="#why-us" className="hover:text-slate-800">Why Us</a>
            <Link to="/login" className="hover:text-slate-800">Portal Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
