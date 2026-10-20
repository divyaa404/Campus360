import React from 'react';
import { 
  Users, 
  Megaphone, 
  Briefcase, 
  Calendar, 
  Award, 
  BarChart3, 
  Activity, 
  FileCheck,
  TrendingUp,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  // Mock data for analytics
  const stats = [
    { name: 'Total Students', count: '2,450', change: '+12% this month', icon: Users, color: 'text-brand-blue bg-brand-blue/10' },
    { name: 'Total Notices', count: '142', change: '8 new today', icon: Megaphone, color: 'text-brand-orange bg-brand-orange/10' },
    { name: 'Total Opportunities', count: '89', change: '15 closing soon', icon: Briefcase, color: 'text-brand-pink bg-brand-pink/10' },
    { name: 'Event Registrations', count: '612', change: '+24% vs last fest', icon: Calendar, color: 'text-brand-green bg-brand-green/10' },
    { name: 'Scholarships Listed', count: '14', change: '3 new additions', icon: Award, color: 'text-brand-cyan bg-brand-cyan/10' },
    { name: 'Active Users (Today)', count: '852', change: '35% daily active rate', icon: Activity, color: 'text-brand-purple bg-brand-purple/10' },
  ];

  const recentApplications = [
    { id: '1', name: 'Devendra Kumar', roll: '2023CSE012', position: 'React Dev at TechStack', date: 'Aug 30', status: 'Applied' },
    { id: '2', name: 'Nisha Patel', roll: '2023ECE044', position: 'ML Engineer at AlphaLabs', date: 'Aug 29', status: 'Pending Review' },
    { id: '3', name: 'Rohit Sharma', roll: '2024CSE108', position: 'Product Lead at InnovateHQ', date: 'Aug 28', status: 'Applied' },
  ];

  const topOpportunities = [
    { title: 'Google Software Internship', views: 842, applications: 310, rate: 36.8 },
    { title: 'Amazon AWS Cloud Architect', views: 610, applications: 195, rate: 31.9 },
    { title: 'SIH Internal Ideathon 2026', views: 554, applications: 240, rate: 43.3 },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 font-medium">Manage and monitor Campus360 engagement, notices, and applications.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/generate-heads"
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4" />
            Generate Head ID & Pass
          </Link>
          <Link
            to="/admin/events"
            className="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 hover:shadow-lg transition-all"
          >
            <Calendar className="h-4 w-4" />
            Events & Rosters
          </Link>
          <Link
            to="/admin/opportunities"
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-pink px-4 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-lg hover:scale-[1.01] transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Opportunity
          </Link>
        </div>
      </div>

      {/* Grid of stats */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.name}</span>
                <p className="text-3xl font-extrabold text-slate-800">{stat.count}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {stat.change}
                </span>
              </div>
              <div className={`rounded-2xl p-4 ${stat.color}`}>
                <Icon className="h-7 w-7" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts & Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Engagement Trends Visualization */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-800 text-lg">Engagement Overview</h2>
              <p className="text-xs text-slate-400 font-semibold">Weekly application submission rate and active student dashboard hits</p>
            </div>
            <span className="rounded-xl bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500 border border-slate-100">
              Last 7 Days
            </span>
          </div>

          {/* Clean custom SVG chart */}
          <div className="h-60 w-full relative pt-4">
            <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF5722" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#FF5722" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="600" y2="50" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="100" x2="600" y2="100" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="150" x2="600" y2="150" stroke="#f1f5f9" strokeWidth="1" />

              {/* Area path */}
              <path
                d="M 0 150 C 100 120, 200 80, 300 110 C 400 140, 500 50, 600 30 L 600 200 L 0 200 Z"
                fill="url(#chartGrad)"
              />
              
              {/* Line path */}
              <path
                d="M 0 150 C 100 120, 200 80, 300 110 C 400 140, 500 50, 600 30"
                fill="none"
                stroke="#FF5722"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-x-0 bottom-0 flex justify-between text-[10px] font-bold text-slate-400 px-1">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        {/* Right: Popular Opportunities */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h2 className="font-extrabold text-slate-800 text-lg">Top Opportunities</h2>
            <p className="text-xs text-slate-400 font-semibold">Most applied postings</p>
          </div>

          <div className="space-y-4">
            {topOpportunities.map((opp, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 truncate max-w-44">{opp.title}</span>
                  <span className="font-semibold text-slate-400">{opp.applications} applied</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-brand-orange to-brand-pink"
                    style={{ width: `${opp.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Applications list */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div>
          <h2 className="font-extrabold text-slate-800 text-lg">Recent Application Activity</h2>
          <p className="text-xs text-slate-400 font-semibold">Verify student applications and details</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Opportunity</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentApplications.map((app) => (
                <tr key={app.id} className="border-b border-slate-50 hover:bg-slate-50/55 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-800">{app.name}</td>
                  <td className="py-4 px-4 font-semibold text-slate-500">{app.roll}</td>
                  <td className="py-4 px-4 font-semibold text-slate-700">{app.position}</td>
                  <td className="py-4 px-4 text-slate-400 font-semibold">{app.date}</td>
                  <td className="py-4 px-4 text-right">
                    <span className={`inline-block rounded-xl px-3 py-1 text-xs font-bold ${
                      app.status === 'Applied' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
