import fs from 'fs';
import path from 'path';

export type UserRole = 'STUDENT' | 'SUPER_ADMIN' | 'HEAD';

export interface User {
  id: string;
  email: string; // login id / email
  password: string;
  role: UserRole;
  name: string;
  organization?: string; // e.g. 'IEEE Student Branch', 'Training & Placement Cell (TnP)'
  headTitle?: string;    // e.g. 'IEEE Branch Chair', 'T&P Head Officer'
  mustChangePassword?: boolean;
  department?: string;
  year?: number;
  semester?: number;
  rollNumber?: string;
  phone?: string;
  createdAt: string;
}

export interface EventItem {
  id: string;
  title: string;
  category: string;
  organizer: string;
  organizerRole?: string;
  createdByHeadId?: string;
  date: string;
  time: string;
  venue: string;
  desc: string;
  image: string;
  deadline?: string;
  maxCapacity?: number;
  eligibility?: string;
  createdAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  rollNumber: string;
  department: string;
  year: number | string;
  phone: string;
  registeredAt: string;
  status: 'Registered' | 'Shortlisted' | 'Selected' | 'Attended' | 'Waitlisted';
}

export interface SocialPost {
  id: string;
  authorName: string;
  authorRole: UserRole;
  authorOrg: string;
  authorAvatar?: string;
  content: string;
  tag: string;
  imageUrl?: string;
  likes: number;
  commentsCount: number;
  createdAt: string;
  isPinned?: boolean;
}

export interface OpportunityItem {
  id: string;
  title: string;
  organization: string;
  category: string;
  description: string;
  location: string;
  stipend?: string;
  deadline: string;
  applicantsCount: number;
  createdAt: string;
}

interface DatabaseSchema {
  users: User[];
  events: EventItem[];
  registrations: EventRegistration[];
  socialPosts: SocialPost[];
  opportunities: OpportunityItem[];
}

const DB_FILE = path.join(__dirname, '..', 'data.json');

const INITIAL_DATA: DatabaseSchema = {
  users: [
    {
      id: 'admin-1',
      email: 'admin@campus360.edu',
      password: 'admin123',
      role: 'SUPER_ADMIN',
      name: 'Dr. Sarah Jenkins',
      organization: 'Central Administration',
      headTitle: 'Super Administrator & Dean',
      mustChangePassword: false,
      createdAt: '2026-08-01T10:00:00Z',
    },
    {
      id: 'head-ieee',
      email: 'ieee.head@campus360.edu',
      password: 'head123',
      role: 'HEAD',
      name: 'Prof. Rajesh Varma',
      organization: 'IEEE Student Branch',
      headTitle: 'IEEE Student Branch Chair',
      mustChangePassword: true, // First-time login password change prompt!
      createdAt: '2026-08-10T11:00:00Z',
    },
    {
      id: 'head-tnp',
      email: 'tnp.head@campus360.edu',
      password: 'head123',
      role: 'HEAD',
      name: 'Dr. Ananya Sen',
      organization: 'Training & Placement Cell (TnP)',
      headTitle: 'Chief Placement Officer',
      mustChangePassword: true, // First-time login password change prompt!
      createdAt: '2026-08-12T09:30:00Z',
    },
    {
      id: 'head-cultural',
      email: 'cultural.head@campus360.edu',
      password: 'head123',
      role: 'HEAD',
      name: 'Aryan Saxena',
      organization: 'Cultural Society',
      headTitle: 'Cultural Secretary',
      mustChangePassword: false,
      createdAt: '2026-08-15T14:00:00Z',
    },
    {
      id: 'head-acm',
      email: 'acm.head@campus360.edu',
      password: 'head123',
      role: 'HEAD',
      name: 'Tanvi Deshmukh',
      organization: 'ACM Student Chapter',
      headTitle: 'ACM Chapter Lead',
      mustChangePassword: true,
      createdAt: '2026-08-16T12:00:00Z',
    },
    {
      id: 'student-1',
      email: 'student@campus360.edu',
      password: 'student123',
      role: 'STUDENT',
      name: 'Aarav Sharma',
      rollNumber: '2023CSE042',
      department: 'Computer Science & Engineering',
      year: 3,
      semester: 6,
      phone: '+91 98765 43210',
      createdAt: '2026-08-18T16:00:00Z',
    },
    {
      id: 'student-2',
      email: 'priya.verma@campus360.edu',
      password: 'student123',
      role: 'STUDENT',
      name: 'Priya Verma',
      rollNumber: '2023ECE019',
      department: 'Electronics & Communication',
      year: 3,
      semester: 6,
      phone: '+91 98111 22334',
      createdAt: '2026-08-18T16:30:00Z',
    },
    {
      id: 'student-3',
      email: 'rohit.mehta@campus360.edu',
      password: 'student123',
      role: 'STUDENT',
      name: 'Rohit Mehta',
      rollNumber: '2024IT105',
      department: 'Information Technology',
      year: 2,
      semester: 4,
      phone: '+91 97222 33445',
      createdAt: '2026-08-19T09:00:00Z',
    },
  ],
  events: [
    {
      id: 'e-ieee-1',
      title: 'IEEE National Hackathon - CodeGrid 2026',
      category: 'Hackathons',
      organizer: 'IEEE Student Branch',
      createdByHeadId: 'head-ieee',
      date: '2026-10-25',
      time: '09:30 AM',
      venue: 'Alan Turing Computing Lab & Seminar Hall 1',
      desc: '36-hour flagship hackathon organized by IEEE Student Branch. Themes include AI & Agentic Systems, Smart Campus Solutions, and Decentralized Networks. Exciting cash pool of ₹1,50,000!',
      image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=60',
      deadline: '2026-10-22',
      maxCapacity: 150,
      eligibility: 'Open to all Engineering & Tech undergraduates',
      createdAt: '2026-08-20T10:00:00Z',
    },
    {
      id: 'e-tnp-1',
      title: 'T&P Mega Campus Placement Drive 2026',
      category: 'Placement Drives',
      organizer: 'Training & Placement Cell (TnP)',
      createdByHeadId: 'head-tnp',
      date: '2026-11-02',
      time: '09:00 AM',
      venue: 'Main Auditorium & Training Centre',
      desc: 'Annual placement drive with top tier hiring partners including Google, Microsoft, Adobe, and TCS Digital. Bring 3 hard copies of resume and formal college ID.',
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=60',
      deadline: '2026-10-28',
      maxCapacity: 300,
      eligibility: 'Pre-final and Final Year Students (CGPA > 7.0)',
      createdAt: '2026-08-22T11:00:00Z',
    },
    {
      id: 'e-cult-1',
      title: 'Echoes 2026 - Annual Flagship Cultural Fest',
      category: 'Cultural',
      organizer: 'Cultural Society',
      createdByHeadId: 'head-cultural',
      date: '2026-11-15',
      time: '04:00 PM',
      venue: 'Open Air Amphitheatre (OAT)',
      desc: '3-day extravaganza of musical battles, choreography contests, theater drama, street plays, and celebrity band night.',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60',
      deadline: '2026-11-10',
      maxCapacity: 1200,
      eligibility: 'Open to all campus students & registered university teams',
      createdAt: '2026-08-24T12:00:00Z',
    },
    {
      id: 'e-acm-1',
      title: 'ACM Deep Learning & LLM Systems Workshop',
      category: 'Workshops',
      organizer: 'ACM Student Chapter',
      createdByHeadId: 'head-acm',
      date: '2026-10-28',
      time: '02:00 PM',
      venue: 'Lab 4, Block B',
      desc: 'Hands-on practical session on fine-tuning open-weights models, vector databases, and fullstack Agent development.',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=60',
      deadline: '2026-10-27',
      maxCapacity: 60,
      eligibility: 'Basic Python & React knowledge recommended',
      createdAt: '2026-08-25T14:30:00Z',
    },
  ],
  registrations: [
    {
      id: 'reg-1',
      eventId: 'e-ieee-1',
      studentId: 'student-1',
      studentName: 'Aarav Sharma',
      studentEmail: 'student@campus360.edu',
      rollNumber: '2023CSE042',
      department: 'Computer Science & Engineering',
      year: 3,
      phone: '+91 98765 43210',
      registeredAt: '2026-08-21T10:15:00Z',
      status: 'Shortlisted',
    },
    {
      id: 'reg-2',
      eventId: 'e-ieee-1',
      studentId: 'student-2',
      studentName: 'Priya Verma',
      studentEmail: 'priya.verma@campus360.edu',
      rollNumber: '2023ECE019',
      department: 'Electronics & Communication',
      year: 3,
      phone: '+91 98111 22334',
      registeredAt: '2026-08-21T11:40:00Z',
      status: 'Registered',
    },
    {
      id: 'reg-3',
      eventId: 'e-ieee-1',
      studentId: 'student-3',
      studentName: 'Rohit Mehta',
      studentEmail: 'rohit.mehta@campus360.edu',
      rollNumber: '2024IT105',
      department: 'Information Technology',
      year: 2,
      phone: '+91 97222 33445',
      registeredAt: '2026-08-22T08:20:00Z',
      status: 'Registered',
    },
    {
      id: 'reg-4',
      eventId: 'e-tnp-1',
      studentId: 'student-1',
      studentName: 'Aarav Sharma',
      studentEmail: 'student@campus360.edu',
      rollNumber: '2023CSE042',
      department: 'Computer Science & Engineering',
      year: 3,
      phone: '+91 98765 43210',
      registeredAt: '2026-08-23T14:05:00Z',
      status: 'Registered',
    },
    {
      id: 'reg-5',
      eventId: 'e-tnp-1',
      studentId: 'student-2',
      studentName: 'Priya Verma',
      studentEmail: 'priya.verma@campus360.edu',
      rollNumber: '2023ECE019',
      department: 'Electronics & Communication',
      year: 3,
      phone: '+91 98111 22334',
      registeredAt: '2026-08-23T15:30:00Z',
      status: 'Shortlisted',
    },
    {
      id: 'reg-6',
      eventId: 'e-acm-1',
      studentId: 'student-1',
      studentName: 'Aarav Sharma',
      studentEmail: 'student@campus360.edu',
      rollNumber: '2023CSE042',
      department: 'Computer Science & Engineering',
      year: 3,
      phone: '+91 98765 43210',
      registeredAt: '2026-08-26T09:12:00Z',
      status: 'Registered',
    },
  ],
  socialPosts: [
    {
      id: 'sp-1',
      authorName: 'Dr. Sarah Jenkins',
      authorRole: 'SUPER_ADMIN',
      authorOrg: 'Central Administration',
      content: 'Welcome students and faculty to the Autumn 2026 Semester! All club heads are requested to coordinate their semester calendars with the Dean office by next week.',
      tag: 'Event Announcement',
      likes: 64,
      commentsCount: 9,
      isPinned: true,
      createdAt: '2026-08-20T09:00:00Z',
    },
    {
      id: 'sp-2',
      authorName: 'Prof. Rajesh Varma',
      authorRole: 'HEAD',
      authorOrg: 'IEEE Student Branch',
      content: 'Registrations are now officially live for CodeGrid 2026! Over 50 teams have already applied within the first 24 hours. Check the events tab to secure your spot.',
      tag: 'Event Announcement',
      imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=60',
      likes: 89,
      commentsCount: 14,
      createdAt: '2026-08-21T12:30:00Z',
    },
    {
      id: 'sp-3',
      authorName: 'Dr. Ananya Sen',
      authorRole: 'HEAD',
      authorOrg: 'Training & Placement Cell (TnP)',
      content: 'Important Notice for 6th and 8th Semester students: Google and Microsoft pre-placement talks schedule has been updated. Registered candidates will receive test links on college emails.',
      tag: 'Placement Alert',
      likes: 120,
      commentsCount: 22,
      isPinned: true,
      createdAt: '2026-08-22T14:15:00Z',
    },
    {
      id: 'sp-4',
      authorName: 'Aryan Saxena',
      authorRole: 'HEAD',
      authorOrg: 'Cultural Society',
      content: 'Auditions for the Drama & Western Music band for Echoes 2026 will start this Friday at OAT. All enthusiastic performers are welcome to register!',
      tag: 'Campus Life',
      likes: 54,
      commentsCount: 7,
      createdAt: '2026-08-24T16:00:00Z',
    },
  ],
  opportunities: [
    {
      id: 'opp-1',
      title: 'Google Software Engineering Intern (Summer 2027)',
      organization: 'Google',
      category: 'Internship',
      description: 'Looking for computer science students with strong DSA skills, Python/C++/Java knowledge, and system design fundamentals.',
      location: 'Bengaluru / Hyderabad (Hybrid)',
      stipend: '₹1,25,000 / month',
      deadline: '2026-10-15',
      applicantsCount: 310,
      createdAt: '2026-08-15T10:00:00Z',
    },
    {
      id: 'opp-2',
      title: 'Microsoft Azure Cloud Fellowship',
      organization: 'Microsoft',
      category: 'Full-time / Fellowship',
      description: 'Rotational 1-year graduate program in cloud systems, distributed databases, and generative AI infrastructure.',
      location: 'Noida / Bengaluru',
      stipend: '₹18 - ₹24 LPA',
      deadline: '2026-10-25',
      applicantsCount: 195,
      createdAt: '2026-08-18T11:00:00Z',
    },
    {
      id: 'opp-3',
      title: 'Smart India Hackathon (SIH 2026) College Nominations',
      organization: 'Innovation Cell, MoE',
      category: 'Hackathon',
      description: 'Submit your 6-member team proposal for hardware or software problem statements for national selection.',
      location: 'National Level',
      stipend: '₹1,00,000 Prize',
      deadline: '2026-09-30',
      applicantsCount: 240,
      createdAt: '2026-08-20T12:00:00Z',
    },
  ],
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Failed to read data.json, falling back to initial seed data:', err);
    }
    this.saveData(INITIAL_DATA);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  private saveData(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write to data.json:', err);
    }
  }

  public getUsers(): User[] {
    return this.data.users;
  }

  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public addUser(user: User): User {
    this.data.users.push(user);
    this.saveData(this.data);
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.findUserById(id);
    if (!user) return undefined;
    Object.assign(user, updates);
    this.saveData(this.data);
    return user;
  }

  public deleteUser(id: string): boolean {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter((u) => u.id !== id);
    if (this.data.users.length !== initialLen) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  public getEvents(): EventItem[] {
    return this.data.events;
  }

  public findEventById(id: string): EventItem | undefined {
    return this.data.events.find((e) => e.id === id);
  }

  public addEvent(event: EventItem): EventItem {
    this.data.events.unshift(event);
    this.saveData(this.data);
    return event;
  }

  public getRegistrationsByEvent(eventId: string): EventRegistration[] {
    return this.data.registrations.filter((r) => r.eventId === eventId);
  }

  public getRegistrationsByStudent(studentId: string): EventRegistration[] {
    return this.data.registrations.filter((r) => r.studentId === studentId);
  }

  public addRegistration(registration: EventRegistration): EventRegistration {
    // Check if already registered
    const existing = this.data.registrations.find(
      (r) => r.eventId === registration.eventId && (r.studentId === registration.studentId || r.studentEmail === registration.studentEmail)
    );
    if (existing) {
      return existing;
    }
    this.data.registrations.unshift(registration);
    this.saveData(this.data);
    return registration;
  }

  public updateRegistrationStatus(registrationId: string, status: EventRegistration['status']): EventRegistration | undefined {
    const reg = this.data.registrations.find((r) => r.id === registrationId);
    if (!reg) return undefined;
    reg.status = status;
    this.saveData(this.data);
    return reg;
  }

  public getSocialPosts(): SocialPost[] {
    return this.data.socialPosts;
  }

  public addSocialPost(post: SocialPost): SocialPost {
    this.data.socialPosts.unshift(post);
    this.saveData(this.data);
    return post;
  }

  public getOpportunities(): OpportunityItem[] {
    return this.data.opportunities;
  }

  public addOpportunity(opp: OpportunityItem): OpportunityItem {
    this.data.opportunities.unshift(opp);
    this.saveData(this.data);
    return opp;
  }
}

export const db = new Database();
