import React, { useState } from 'react';
import { Award, Search, CircleDollarSign, Calendar, FileText } from 'lucide-react';

export const ScholarshipsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const scholarships = [
    {
      id: 's-1',
      name: 'Merit Academic Scholarship 2026',
      provider: 'College Administration Cell',
      eligibility: 'Top 5% students in each department based on CGPA (Min 9.0)',
      benefits: '100% Tuition Fee Waiver for the academic semester',
      deadline: 'Sept 15, 2026',
      documents: 'Previous Sem Marks Sheet, Income Certificate, Character Certificate'
    },
    {
      id: 's-2',
      name: 'Women in STEM Research Grant',
      provider: 'R&D Cell / Government Sponsor',
      eligibility: 'Female B.Tech/M.Tech students with research proposal',
      benefits: '₹50,000 stipend and project funding support',
      deadline: 'Sept 30, 2026',
      documents: 'Research abstract, Recommendation Letter from Dept Head'
    },
    {
      id: 's-3',
      name: 'EWS Support Scholarship Scheme',
      provider: 'State Government Education Dept',
      eligibility: 'Students with annual family income below 3 Lakhs',
      benefits: '₹20,000 annual allowance + study material support',
      deadline: 'Oct 10, 2026',
      documents: 'Valid Income Certificate, BPL card (if applicable), Fee Receipts'
    }
  ];

  const filtered = scholarships.filter((s) => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Scholarships & Grants</h1>
        <p className="text-sm text-slate-500 font-medium">Find state, central, and college administration scholarships to support your studies.</p>
      </div>

      <div className="relative w-full md:w-80">
        <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search scholarships..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm outline-none focus:border-slate-400 focus:bg-white"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filtered.length === 0 ? (
          <div className="col-span-2 py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200/80">
            <Award className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-500">No scholarships found</p>
          </div>
        ) : (
          filtered.map((s) => (
            <div key={s.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-brand-pink/10 p-3.5 text-brand-pink">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base leading-snug">{s.name}</h3>
                    <p className="text-xs font-semibold text-slate-400">{s.provider}</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs font-semibold text-slate-500">
                  <div className="flex items-start gap-2">
                    <CircleDollarSign className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                    <span><strong className="text-slate-700">Benefits:</strong> {s.benefits}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                    <span><strong className="text-slate-700">Eligibility:</strong> {s.eligibility}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                    <span><strong className="text-slate-700">Apply by:</strong> {s.deadline}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Required: Transcripts, ID</span>
                <button className="rounded-2xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors">
                  Apply Now
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
