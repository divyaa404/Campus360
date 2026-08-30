import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Briefcase, 
  DollarSign, 
  Sparkles, 
  Bookmark, 
  Share2, 
  AlertTriangle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const OpportunityDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Mock list to find by ID
  const opportunities = [
    {
      id: 'opp-1',
      title: 'React Native Developer Intern',
      organization: 'TechStack Corp',
      category: 'Internships',
      location: 'Bangalore, India',
      mode: 'Hybrid',
      eligibility: '3rd & 4th Year B.Tech students from CSE/IT/ECE',
      skills: ['React', 'TypeScript', 'Tailwind', 'JavaScript'],
      deadline: 'Sept 5, 2026',
      stipend: '₹25,000 / month',
      description: 'We are looking for a passionate React Native developer to help us build the next generation of our mobile applications. You will work closely with our core engineering team to ship production features, optimize app performance, and write high-quality reusable UI components.',
      responsibilities: [
        'Build pixel-perfect UI screens matching Figma wireframes.',
        'Integrate REST APIs and manage client-side storage state.',
        'Debug performance issues and optimize mobile app bundle size.',
        'Collaborate with developers, designers, and product managers.'
      ],
      process: '1. Resume Screening -> 2. Technical MCQ Test -> 3. Coding Round -> 4. HR Interview',
      documents: 'College ID, Latest Academic Transcript, Resume',
      applyLink: 'https://careers.techstack.com/react-native',
      match: 94,
      aiReasons: [
        'Skills match: You know React and TypeScript.',
        'Interest match: Mobile App Dev aligns with your software interests.',
        'Eligibility match: You are in 3rd year B.Tech Computer Science.',
        'CGPA match: Your CGPA (8.2) is above the cutoff of 7.5.'
      ]
    },
    {
      id: 'opp-2',
      title: 'Machine Learning Engineer',
      organization: 'AlphaLabs AI',
      category: 'Placements',
      location: 'Remote',
      mode: 'Online',
      eligibility: 'B.Tech CSE/IT / MCA graduating 2027',
      skills: ['Python', 'Data Science', 'PyTorch', 'SQL'],
      deadline: 'Sept 12, 2026',
      stipend: '₹12,00,000 / annum',
      description: 'AlphaLabs is hiring graduate ML engineers to design, build, and deploy production ML models. You will be training neural network models on diverse multi-modal datasets, building data processing pipelines, and exposing models as API services.',
      responsibilities: [
        'Pre-process high-volume dataset pipelines for ML models.',
        'Train, validate, and tune deep learning hyperparameters.',
        'Deploy models inside Docker containers using FastAPI.',
        'Collaborate on research journals and publications.'
      ],
      process: '1. Resume Screening -> 2. Online HackerRank Challenge -> 3. System Design Panel -> 4. HR Round',
      documents: 'Final Sem Marksheets, Recommendation Letter, Github Portfolio',
      applyLink: 'https://alphalabs.ai/careers',
      match: 88,
      aiReasons: [
        'Skills match: Python knowledge listed in your profile.',
        'Interest match: AI/ML is marked as your career interest.',
        'Department match: B.Tech Computer Science fits CSE/IT guidelines.'
      ]
    }
  ];

  // Fallback to first item if ID matches or default
  const opp = opportunities.find((o) => o.id === id) || opportunities[0];

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4.5 w-4.5" />
        Back to Opportunities
      </button>

      {/* Main Grid Detail */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                  {opp.category}
                </span>
                <span className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-bold text-brand-blue">
                  {opp.mode}
                </span>
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl font-extrabold text-slate-900 leading-snug sm:text-3xl">{opp.title}</h1>
                <p className="text-sm font-bold text-brand-orange">{opp.organization}</p>
              </div>

              {/* Meta details list */}
              <div className="grid gap-4 sm:grid-cols-3 border-y border-slate-100 py-5 text-sm font-semibold text-slate-600">
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Location</p>
                    <p className="text-slate-800 text-xs mt-0.5">{opp.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Deadline</p>
                    <p className="text-slate-800 text-xs mt-0.5">{opp.deadline}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <DollarSign className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Compensation</p>
                    <p className="text-slate-800 text-xs mt-0.5">{opp.stipend}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-slate-800 text-base">Job Description</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{opp.description}</p>
            </div>

            {/* Responsibilities */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-slate-800 text-base">Key Responsibilities</h3>
              <ul className="space-y-2 text-sm text-slate-500">
                {opp.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-brand-orange mt-1.5 shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Application Process */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-slate-800 text-base">Selection Process</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-semibold">{opp.process}</p>
            </div>

            {/* Required Documents */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-slate-800 text-base">Required Documents</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{opp.documents}</p>
            </div>
          </div>
        </div>

        {/* Right Column: AI Insights & Quick Action */}
        <div className="space-y-6">
          {/* Action Box */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <a
              href={opp.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-all"
            >
              Apply Now
              <ExternalLink className="h-4.5 w-4.5" />
            </a>

            <div className="grid grid-cols-3 gap-2">
              <button className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 hover:bg-slate-50 text-slate-500 hover:text-slate-800">
                <Bookmark className="h-5 w-5" />
                <span className="text-[10px] font-bold mt-1 uppercase">Save</span>
              </button>
              <button className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 hover:bg-slate-50 text-slate-500 hover:text-slate-800">
                <Share2 className="h-5 w-5" />
                <span className="text-[10px] font-bold mt-1 uppercase">Share</span>
              </button>
              <button className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 hover:bg-rose-50 text-slate-500 hover:text-rose-600">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-[10px] font-bold mt-1 uppercase">Report</span>
              </button>
            </div>
          </div>

          {/* AI Recommendation Insights */}
          <div className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50/50 to-indigo-50/30 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-brand-purple" />
                AI recommendation details
              </h3>
              <span className="rounded-xl bg-violet-100 px-3 py-1 text-xs font-extrabold text-brand-purple shadow-sm">
                {opp.match}% Score
              </span>
            </div>

            <div className="space-y-3.5">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Why you matched:</p>
              <ul className="space-y-3 text-xs text-slate-600 font-medium">
                {opp.aiReasons.map((reason, idx) => (
                  <li key={idx} className="flex gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Skills Required */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm">Target Skills Needed</h3>
            <div className="flex flex-wrap gap-2">
              {opp.skills.map((skill) => (
                <span key={skill} className="rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-600">
                  {skill}
                </span>
              ))}
            </div>
            <div className="space-y-1 pt-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Academic Cutoff</p>
              <p className="text-slate-800 font-bold text-xs">{opp.eligibility}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
