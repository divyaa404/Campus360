import React, { useState } from 'react';
import { Calendar, Search, MapPin, Clock, Users, CalendarCheck, Share2 } from 'lucide-react';

export const EventsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [registeredIds, setRegisteredIds] = useState<string[]>(['e-2']);

  // Mock events database
  const events = [
    {
      id: 'e-1',
      title: 'Annual Sports Meet 2026',
      category: 'Sports',
      date: '2026-09-15',
      time: '09:00 AM',
      venue: 'Main Sports Complex & Athletics Track',
      organizer: 'Sports Committee',
      desc: 'Annual athletics championships including track races, long jump, shot put, and inter-department football/cricket tournament finals.',
      image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=60'
    },
    {
      id: 'e-2',
      title: 'Web Dev Mastery Workshop',
      category: 'Workshops',
      date: '2026-09-20',
      time: '02:00 PM',
      venue: 'Seminar Hall 3, Block A',
      organizer: 'Coding Club',
      desc: 'Hands-on coding workshop detailing React Server Components, Tailwind v4 design patterns, Node API middleware architecture.',
      image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=60'
    },
    {
      id: 'e-3',
      title: 'Annual Cultural Fest "Echoes 2026"',
      category: 'College Festivals',
      date: '2026-10-05',
      time: '10:00 AM',
      venue: 'Open Air Theater (OAT)',
      organizer: 'Cultural Committee',
      desc: 'The biggest flagship cultural festival featuring rock battles, theatrical showcases, classical assemblies, and live concert evening.',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60'
    },
    {
      id: 'e-4',
      title: 'AI and Robotics Seminar',
      category: 'Seminars',
      date: '2026-09-28',
      time: '11:00 AM',
      venue: 'Audi-2, Administrative Block',
      organizer: 'R&D Cell',
      desc: 'Keynote speakers from Tech Industry talking on LLM fine-tuning pipelines, robotic process control systems, and career scopes.',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=60'
    }
  ];

  const categories = ['All', 'Sports', 'Cultural', 'Technical', 'Workshops', 'Seminars', 'Competitions', 'College Festivals'];

  const handleRegister = (id: string) => {
    if (registeredIds.includes(id)) {
      setRegisteredIds(registeredIds.filter((rId) => rId !== id));
    } else {
      setRegisteredIds([...registeredIds, id]);
    }
  };

  const filteredEvents = events.filter((evt) => {
    const matchesSearch = evt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          evt.desc.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeCategory === 'All') return matchesSearch;
    return evt.category.toLowerCase() === activeCategory.toLowerCase() && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Campus Events</h1>
        <p className="text-sm text-slate-500 font-medium">Discover technical workshops, sports meets, guest seminars, and cultural festivals.</p>
      </div>

      {/* Filter panel */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm outline-none focus:border-slate-400 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-none">
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

      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredEvents.length === 0 ? (
          <div className="col-span-2 py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200/80">
            <Calendar className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-500">No events found matching current criteria</p>
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <div key={evt.id} className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
              {/* Event Card Banner */}
              <div className="h-44 w-full bg-slate-200 relative">
                <img src={evt.image} alt={evt.title} className="w-full h-full object-cover" />
                <span className="absolute top-4 left-4 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm">
                  {evt.category}
                </span>
              </div>

              {/* Event Details */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-orange bg-brand-orange/5 px-2.5 py-1 rounded-xl">
                    By {evt.organizer}
                  </span>
                  <h3 className="font-extrabold text-slate-800 text-lg leading-snug">{evt.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{evt.desc}</p>
                </div>

                {/* Meta details horizontal */}
                <div className="grid grid-cols-3 gap-2 border-t border-slate-50 pt-4 text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <CalendarCheck className="h-4.5 w-4.5 text-slate-400" />
                    <span>{evt.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4.5 w-4.5 text-slate-400" />
                    <span>{evt.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <MapPin className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                    <span className="truncate">{evt.venue}</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-1">
                  <button className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-500 hover:bg-slate-100 transition-colors">
                    <Share2 className="h-4.5 w-4.5" />
                  </button>
                  <button
                    onClick={() => handleRegister(evt.id)}
                    className={`rounded-2xl px-5 py-2.5 text-xs font-bold shadow-sm transition-all ${
                      registeredIds.includes(evt.id)
                        ? 'bg-slate-900 text-white hover:bg-slate-800'
                        : 'bg-gradient-to-r from-brand-orange to-brand-pink text-white hover:opacity-90 hover:scale-[1.01]'
                    }`}
                  >
                    {registeredIds.includes(evt.id) ? 'Registered' : 'Register Now'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
