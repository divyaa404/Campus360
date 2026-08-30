import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Search, Sparkles, MapPin, Calendar, CheckCircle2, Bookmark, SlidersHorizontal } from 'lucide-react';

export const OpportunitiesPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState('All');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Realistic mock opportunities database
  const opportunities = [
    {
      id: 'opp-1',
      title: 'React Native Developer Intern',
      organization: 'TechStack Corp',
      category: 'Internships',
      location: 'Bangalore, India',
      mode: 'Hybrid',
      eligibility: '3rd & 4th Year B.Tech students',
      skills: ['React', 'TypeScript', 'Tailwind', 'JavaScript'],
      deadline: '2026-09-05',
      postedDate: 'Aug 30, 2026',
      match: 94,
      applyLink: 'https://careers.techstack.com/react-native'
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
      deadline: '2026-09-12',
      postedDate: 'Aug 29, 2026',
      match: 88,
      applyLink: 'https://alphalabs.ai/careers'
    },
    {
      id: 'opp-3',
      title: 'Product Management Fellow',
      organization: 'Innovate HQ',
      category: 'Internships',
      location: 'Mumbai, India',
      mode: 'Offline',
      eligibility: 'Open to all departments',
      skills: ['Agile', 'Product Strategy', 'UI/UX', 'Analytics'],
      deadline: '2026-09-10',
      postedDate: 'Aug 28, 2026',
      match: 82,
      applyLink: 'https://innovatehq.co/apply'
    },
    {
      id: 'opp-4',
      title: 'Smart India Hackathon (SIH) 2026',
      organization: 'Ministry of Education',
      category: 'Hackathons',
      location: 'National Centers',
      mode: 'Offline',
      eligibility: 'College student teams (6 members)',
      skills: ['Full Stack', 'Problem Solving', 'Prototyping'],
      deadline: '2026-09-18',
      postedDate: 'Aug 26, 2026',
      match: 90,
      applyLink: 'https://sih.gov.in'
    },
    {
      id: 'opp-5',
      title: 'Graduate Research Assistant (NLP)',
      organization: 'IIT R&D Cell',
      category: 'Research Opportunities',
      location: 'IIT Campus',
      mode: 'Hybrid',
      eligibility: 'Pre-final/Final year with NLP coursework',
      skills: ['Python', 'NLP', 'TensorFlow', 'Paper Writing'],
      deadline: '2026-09-22',
      postedDate: 'Aug 25, 2026',
      match: 75,
      applyLink: 'https://iit.ac.in/research-openings'
    },
    {
      id: 'opp-6',
      title: 'Cybersecurity Fundamentals Certification',
      organization: 'EC-Council',
      category: 'Certifications',
      location: 'Self-paced',
      mode: 'Online',
      eligibility: 'Any student interested in cybersecurity',
      skills: ['Networking', 'Cryptography', 'Linux'],
      deadline: '2026-10-01',
      postedDate: 'Aug 24, 2026',
      match: 68,
      applyLink: 'https://eccouncil.org/free-learning'
    }
  ];

  const categories = [
    'All', 
    'Internships', 
    'Placements', 
    'Hackathons', 
    'Competitions', 
    'Research Opportunities', 
    'Workshops', 
    'Certifications'
  ];

  const handleBookmarkToggle = (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to detail page
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds(bookmarkedIds.filter((bId) => bId !== id));
    } else {
      setBookmarkedIds([...bookmarkedIds, id]);
    }
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          opp.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          opp.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = activeCategory === 'All' || opp.category === activeCategory;
    const matchesMode = selectedMode === 'All' || opp.mode === selectedMode;

    return matchesSearch && matchesCategory && matchesMode;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-sans">Opportunities Discovery</h1>
          <p className="text-sm text-slate-500 font-medium">Find verified jobs, internships, hackathons, and certifications matched to your skills.</p>
        </div>
      </div>

      {/* Main search and category filter panel */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, company, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm outline-none focus:border-slate-400 focus:bg-white"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <SlidersHorizontal className="h-4.5 w-4.5" />
            Filters
          </button>
        </div>

        {/* Detailed Filter Section */}
        {showFilters && (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm grid gap-4 sm:grid-cols-3 animate-in fade-in duration-200">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Work Mode</label>
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 focus:outline-none"
              >
                <option value="All">All Modes</option>
                <option value="Online">Online / Remote</option>
                <option value="Offline">Offline / In-Office</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        )}

        {/* Scrollable categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-2xl px-4.5 py-2.5 text-xs font-bold transition-all border ${
                activeCategory === cat
                  ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Recommended Banner */}
      {activeCategory === 'All' && (
        <div className="rounded-3xl bg-gradient-to-tr from-brand-purple/10 to-brand-blue/5 border border-brand-purple/10 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-extrabold text-slate-800 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-purple" />
              AI Recommendations Dashboard
            </h2>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              We matched your profile skills (React, TypeScript, CSS) with active job postings to generate match weights.
            </p>
          </div>
          <Link
            to="/ai-recommendations"
            className="shrink-0 rounded-2xl bg-brand-purple px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-purple/90 transition-all"
          >
            Refine AI Matches
          </Link>
        </div>
      )}

      {/* Grid List */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredOpportunities.length === 0 ? (
          <div className="col-span-full py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200/80">
            <Briefcase className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-500">No opportunities found matching these criteria</p>
          </div>
        ) : (
          filteredOpportunities.map((opp) => (
            <Link
              key={opp.id}
              to={`/opportunity/${opp.id}`}
              className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-lg bg-slate-50 border border-slate-100 px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {opp.category}
                    </span>
                    <h3 className="mt-2 font-bold text-slate-800 text-base leading-snug group-hover:text-brand-orange transition-colors">
                      {opp.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-400">{opp.organization}</p>
                  </div>
                  
                  {/* AI Match Badge */}
                  <div className="rounded-xl bg-violet-50 px-2.5 py-1 text-xs font-bold text-brand-purple flex items-center gap-1 shadow-sm shrink-0 border border-brand-purple/5">
                    <Sparkles className="h-3.5 w-3.5" />
                    {opp.match}% Match
                  </div>
                </div>

                {/* Details Meta */}
                <div className="flex flex-col gap-2 text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>{opp.location} ({opp.mode})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>Deadline: {opp.deadline}</span>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {opp.skills.map((s) => (
                    <span key={s} className="rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-500 border border-slate-100/50">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 flex items-center justify-between border-t border-slate-50 pt-4">
                <button
                  onClick={(e) => handleBookmarkToggle(opp.id, e)}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-pink transition-colors"
                >
                  <Bookmark
                    className={`h-4.5 w-4.5 ${
                      bookmarkedIds.includes(opp.id) ? 'fill-brand-pink text-brand-pink' : ''
                    }`}
                  />
                </button>
                <div className="flex gap-2">
                  <span className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white group-hover:bg-slate-800 transition-colors">
                    View Details
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};
