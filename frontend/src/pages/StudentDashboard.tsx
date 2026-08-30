import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Megaphone, 
  Briefcase, 
  Calendar, 
  CheckSquare, 
  Bookmark, 
  Sparkles,
  ArrowRight,
  UserCheck,
  Download,
  AlertCircle
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  // Realistic mock data
  const stats = [
    { name: 'New Notices', count: 5, color: 'text-brand-orange bg-brand-orange/10', icon: Megaphone },
    { name: 'Opportunities', count: 18, color: 'text-brand-blue bg-brand-blue/10', icon: Briefcase },
    { name: 'Upcoming Events', count: 4, color: 'text-brand-green bg-brand-green/10', icon: Calendar },
    { name: 'Mock Exams Completed', count: 12, color: 'text-brand-cyan bg-brand-cyan/10', icon: CheckSquare },
    { name: 'Bookmarks Saved', count: 8, color: 'text-brand-pink bg-brand-pink/10', icon: Bookmark },
  ];

  const latestNotices = [
    {
      id: 'n-1',
      title: 'T&P Placement Drive: Google India recruitment cycle open',
      source: 'T&P Cell',
      category: 'Placement',
      date: 'Aug 30, 2026',
      desc: 'Applications are invited from 2027 batch CSE/IT students for Software Engineering internship role. Package details and links attached.',
      isImportant: true,
      attachment: 'google_jd_2027.pdf'
    },
    {
      id: 'n-2',
      title: 'R&D Cell: Project Expo Registration deadline extended',
      source: 'R&D Cell',
      category: 'Research',
      date: 'Aug 29, 2026',
      desc: 'Annual technical project competition registration has been extended. Submit project abstract to head cell directly.',
      isImportant: false,
    },
    {
      id: 'n-3',
      title: 'Mid-Sem Examination Schedule Fall Semester',
      source: 'Academic Admin',
      category: 'College',
      date: 'Aug 28, 2026',
      desc: 'Mid semester exams will commence from September 18. Detailed date sheet is now available for download.',
      isImportant: true,
      attachment: 'datesheet_midsem_2026.pdf'
    }
  ];

  const recommendedOpportunities = [
    {
      id: 'o-1',
      title: 'React Native Developer Intern',
      organization: 'TechStack Corp',
      match: 94,
      skills: ['React', 'TypeScript', 'Tailwind'],
      deadline: 'Sept 5, 2026',
    },
    {
      id: 'o-2',
      title: 'Machine Learning Engineer',
      organization: 'AlphaLabs AI',
      match: 88,
      skills: ['Python', 'Data Science', 'PyTorch'],
      deadline: 'Sept 12, 2026',
    },
    {
      id: 'o-3',
      title: 'Product Management Fellow',
      organization: 'Innovate HQ',
      match: 82,
      skills: ['Agile', 'Product Strategy', 'UI/UX'],
      deadline: 'Sept 10, 2026',
    }
  ];

  const upcomingEvents = [
    {
      id: 'e-1',
      name: 'Annual Sports Meet 2026',
      date: 'Sept 15, 2026',
      time: '09:00 AM',
      venue: 'Main Sports Complex',
      organizer: 'Sports Committee',
      status: 'Open'
    },
    {
      id: 'e-2',
      name: 'Web Dev Mastery Workshop',
      date: 'Sept 20, 2026',
      time: '02:00 PM',
      venue: 'Seminar Hall 3',
      organizer: 'Coding Club',
      status: 'Registered'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Dashboard Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-orange via-brand-pink to-brand-purple p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold sm:text-4xl">
              Welcome back, {user?.name || 'Student'} 👋
            </h1>
            <p className="text-sm text-white/80 font-medium">
              Stay updated. Explore opportunities. Achieve more.
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              to="/opportunities"
              className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-md hover:bg-slate-50 hover:shadow-lg transition-all"
            >
              Explore Opportunities
            </Link>
            <Link
              to="/notices"
              className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm px-5 py-3 text-sm font-bold text-white hover:bg-white/20 transition-all"
            >
              View Notices
            </Link>
          </div>
        </div>
        {/* Background micro effects */}
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute left-1/3 bottom-0 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.name}</span>
                <p className="text-3xl font-extrabold text-slate-800">{stat.count}</p>
              </div>
              <div className={`rounded-2xl p-3 ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT: Latest Notices */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-800">Latest Notices</h2>
            <Link to="/notices" className="text-xs font-semibold text-brand-orange hover:underline flex items-center gap-1">
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {latestNotices.map((notice) => (
              <div
                key={notice.id}
                className={`rounded-3xl border bg-white p-6 shadow-sm transition-all hover:shadow-md ${
                  notice.isImportant ? 'border-l-4 border-l-brand-orange border-slate-200' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                      {notice.category}
                    </span>
                    {notice.isImportant && (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-orange-50 px-3 py-1 text-xs font-bold text-brand-orange">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Important
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">{notice.date}</span>
                </div>

                <h3 className="mt-3.5 font-bold text-slate-800 hover:text-brand-orange transition-colors">
                  {notice.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{notice.desc}</p>

                <div className="mt-4.5 flex items-center justify-between border-t border-slate-50 pt-4.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Source: {notice.source}</span>
                  {notice.attachment && (
                    <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                      <Download className="h-4.5 w-4.5 text-slate-400" />
                      Download attachment
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: AI Recommendations */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-800">AI Matches For You</h2>
            <Link to="/ai-recommendations" className="text-xs font-semibold text-brand-orange hover:underline flex items-center gap-1">
              Refine profile
              <Sparkles className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {recommendedOpportunities.map((opp) => (
              <div key={opp.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{opp.title}</h3>
                    <p className="text-xs font-medium text-slate-400">{opp.organization}</p>
                  </div>
                  <div className="rounded-xl bg-violet-50 px-2.5 py-1.5 text-xs font-bold text-brand-purple flex items-center gap-1 shadow-sm">
                    <Sparkles className="h-3.5 w-3.5" />
                    {opp.match}% Match
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {opp.skills.map((s) => (
                    <span key={s} className="rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-500 border border-slate-100">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-slate-50 pt-4 text-xs">
                  <span className="font-semibold text-slate-400">Deadline: {opp.deadline}</span>
                  <Link to={`/opportunity/${opp.id}`} className="font-bold text-brand-blue hover:underline">
                    View & Apply
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM: Upcoming Events */}
      <div className="space-y-6">
        <h2 className="text-xl font-extrabold text-slate-800">Upcoming Campus Events</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {upcomingEvents.map((evt) => (
            <div key={evt.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-green bg-brand-green/10 px-2.5 py-1 rounded-xl">
                  {evt.organizer}
                </span>
                <h3 className="font-bold text-slate-800 text-base">{evt.name}</h3>
                <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-medium">
                  <span>Date: {evt.date}</span>
                  <span>Time: {evt.time}</span>
                  <span>Venue: {evt.venue}</span>
                </div>
              </div>
              <button
                className={`rounded-2xl px-5 py-2.5 text-xs font-bold transition-all ${
                  evt.status === 'Registered'
                    ? 'bg-slate-100 text-slate-500 cursor-default'
                    : 'bg-brand-orange text-white hover:bg-opacity-90 shadow-sm'
                }`}
              >
                {evt.status === 'Registered' ? 'Registered' : 'Register Now'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
