import React from 'react';
import { Sparkles, Check, CheckCircle2, ChevronRight, Briefcase, Zap, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecommendationsPage: React.FC = () => {
  const matches = [
    {
      id: 'opp-1',
      title: 'React Native Developer Intern',
      organization: 'TechStack Corp',
      category: 'Internships',
      match: 94,
      skills: ['React', 'TypeScript', 'Tailwind', 'JavaScript'],
      stipend: '₹25,000 / month',
      factors: [
        { label: 'Skills Alignment (React, TS)', weight: '38% / 40%', passed: true },
        { label: 'Interest Match (Mobile App Dev)', weight: '25% / 25%', passed: true },
        { label: 'Eligibility (3rd Year CSE/IT)', weight: '20% / 20%', passed: true },
        { label: 'Department Relevance (CSE)', weight: '11% / 15%', passed: true }
      ]
    },
    {
      id: 'opp-2',
      title: 'Machine Learning Engineer',
      organization: 'AlphaLabs AI',
      category: 'Placements',
      match: 88,
      skills: ['Python', 'Data Science', 'PyTorch', 'SQL'],
      stipend: '₹12,00,000 / annum',
      factors: [
        { label: 'Skills Alignment (Python, SQL)', weight: '30% / 40%', passed: true },
        { label: 'Interest Match (AI/ML)', weight: '25% / 25%', passed: true },
        { label: 'Eligibility (Graduating 2027)', weight: '20% / 20%', passed: true },
        { label: 'Department Relevance (CSE/IT)', weight: '13% / 15%', passed: true }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
          <Sparkles className="h-8 w-8 text-brand-purple fill-brand-purple/10" />
          AI Opportunity Matching
        </h1>
        <p className="text-sm text-slate-500 font-medium">Opportunities filtered and scored using our college recommendation algorithm matching your profile.</p>
      </div>

      {/* Matching Weights Explainer */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-800 text-sm">Recommendation Scoring System</h3>
        <div className="grid gap-4 sm:grid-cols-4 text-center">
          {[
            { label: 'Skills Match', weight: '40%', desc: 'Profile skills vs job requirements' },
            { label: 'Interest Match', weight: '25%', desc: 'Career interests overlap' },
            { label: 'Eligibility', weight: '20%', desc: 'Year of study & CGPA criteria' },
            { label: 'Dept Relevance', weight: '15%', desc: 'Academic stream overlap' }
          ].map((w) => (
            <div key={w.label} className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{w.label}</span>
              <p className="text-2xl font-extrabold text-slate-800">{w.weight}</p>
              <p className="text-[9px] text-slate-400 font-medium">{w.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Matches List */}
      <div className="space-y-6">
        {matches.map((item) => (
          <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm grid gap-6 lg:grid-cols-3">
            {/* Opportunity Details Column */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-slate-50 border border-slate-100 px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    {item.category}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{item.stipend}</span>
                </div>
                <h3 className="font-extrabold text-slate-800 text-lg leading-snug">{item.title}</h3>
                <p className="text-xs font-bold text-brand-orange">{item.organization}</p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.skills.map((s) => (
                  <span key={s} className="rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-500 border border-slate-100">
                    {s}
                  </span>
                ))}
              </div>

              <Link
                to={`/opportunity/${item.id}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue hover:underline"
              >
                Apply & view details
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Calculations Breakdown Column */}
            <div className="lg:col-span-2 rounded-2xl border border-violet-100 bg-gradient-to-tr from-violet-50/20 to-indigo-50/10 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-800 text-sm">Match Factors Breakdown</h4>
                <div className="rounded-xl bg-brand-purple text-white px-3 py-1 text-xs font-extrabold shadow-sm flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  {item.match}% Total Match
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {item.factors.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-xl bg-white p-3 border border-slate-100 shadow-sm text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                      <span className="font-semibold text-slate-700">{f.label}</span>
                    </div>
                    <span className="font-bold text-slate-500">{f.weight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
