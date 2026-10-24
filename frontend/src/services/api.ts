// Campus360 Central API Client
import { supabase } from '../lib/supabase';

export function isValidUUID(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export type UserRole = 'STUDENT' | 'SUPER_ADMIN' | 'HEAD';

export interface NoticeItem {
  id: string;
  title: string;
  category: string;
  desc: string;
  source?: string;
  isImportant?: boolean;
  attachment?: string;
  date?: string;
  createdAt?: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  organization?: string;
  headTitle?: string;
  mustChangePassword?: boolean;
  department?: string;
  year?: number;
  semester?: number;
  rollNumber?: string;
  phone?: string;
  careerInterests?: string;
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
  registeredCount?: number;
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

export interface HeadAccount {
  id: string;
  name: string;
  email: string;
  organization?: string;
  headTitle?: string;
  mustChangePassword?: boolean;
  status: string;
  createdAt: string;
  eventsCount: number;
  totalRegistrations: number;
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

export interface ScholarshipItem {
  id: string;
  name: string;
  provider: string;
  category: 'Merit' | 'Government' | 'Need-Based' | 'Women-STEM' | 'Sports' | 'Research';
  benefits: string;
  amount: string;
  eligibility: string;
  deadline: string;
  documents: string;
  totalQuota: number;
  applicantsCount: number;
  description: string;
}

export interface ScholarshipApplicant {
  id: string;
  scholarshipId: string;
  scholarshipName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  rollNumber: string;
  department: string;
  year: number | string;
  cgpa: number | string;
  familyIncome: string;
  category: string;
  appliedDate: string;
  status: 'Approved' | 'Under Review' | 'Shortlisted' | 'Documents Verified' | 'Rejected';
  missingDocuments?: string[];
}

export interface MissingStudentAlert {
  id: string;
  studentName: string;
  rollNumber: string;
  department: string;
  year: number | string;
  cgpa: number;
  eligibleFor: string;
  reason: 'Not Yet Applied' | 'Missing Income Certificate' | 'Awaiting HOD Endorsement' | 'Incomplete Grade Transcript';
  contactEmail: string;
}

export interface ScholarshipNotice {
  id: string;
  title: string;
  source: string;
  category: string;
  priority: 'Urgent' | 'High' | 'General';
  date: string;
  desc: string;
  deadline?: string;
  attachment?: string;
}

export interface WinnerItem {
  id: string;
  studentName: string;
  rollNumber: string;
  dept: string;
  year: string;
  title: string;
  competition: string;
  organizer: string;
  category: 'Hackathons' | 'Research' | 'Academics' | 'Sports' | 'Cultural' | 'Placements';
  position: '1st Place Winner' | '2nd Runner-Up' | '3rd Position' | 'Gold Medalist' | 'Best Innovation' | 'Finalist';
  prize: string;
  date: string;
  desc: string;
  image: string;
  teamMembers?: string[];
  certificateUrl?: string;
}

const API_BASE = '/api';

// Local storage fallback helpers for rock-solid persistence
const STORAGE_KEYS = {
  HEADS: 'campus360_heads_v2',
  EVENTS: 'campus360_events_v2',
  REGS: 'campus360_regs_v2',
  SCHOLARSHIPS: 'campus360_scholarships_v2',
  SCHOLARSHIP_APPS: 'campus360_scholarship_apps_v2',
  SCHOLARSHIP_NOTICES: 'campus360_scholarship_notices_v2',
  WINNERS: 'campus360_winners_v2',
};

// Seed Heads
const SEED_HEADS: HeadAccount[] = [
  {
    id: 'head-ieee',
    name: 'Prof. Rajesh Varma',
    email: 'ieee.head@campus360.edu',
    organization: 'IEEE Student Branch',
    headTitle: 'IEEE Student Branch Chair',
    mustChangePassword: true,
    status: 'Pending First-Time Password Set',
    createdAt: '2026-08-10T11:00:00Z',
    eventsCount: 1,
    totalRegistrations: 3,
  },
  {
    id: 'head-tnp',
    name: 'Dr. Ananya Sen',
    email: 'tnp.head@campus360.edu',
    organization: 'Training & Placement Cell (TnP)',
    headTitle: 'Chief Placement Officer',
    mustChangePassword: false,
    status: 'Active (Password Configured)',
    createdAt: '2026-08-12T09:30:00Z',
    eventsCount: 1,
    totalRegistrations: 1,
  },
  {
    id: 'head-cultural',
    name: 'Aryan Saxena',
    email: 'cultural.head@campus360.edu',
    organization: 'Cultural Society',
    headTitle: 'Cultural Secretary',
    mustChangePassword: false,
    status: 'Active (Password Configured)',
    createdAt: '2026-08-15T14:00:00Z',
    eventsCount: 1,
    totalRegistrations: 0,
  },
  {
    id: 'head-acm',
    name: 'Tanvi Deshmukh',
    email: 'acm.head@campus360.edu',
    organization: 'ACM Student Chapter',
    headTitle: 'ACM Chapter Lead',
    mustChangePassword: true,
    status: 'Pending First-Time Password Set',
    createdAt: '2026-08-16T12:00:00Z',
    eventsCount: 1,
    totalRegistrations: 0,
  },
  {
    id: 'head-robotics',
    name: 'Vikram Malhotra',
    email: 'robotics.head@campus360.edu',
    organization: 'Robotics & Automation Club',
    headTitle: 'Robotics Convener',
    mustChangePassword: true,
    status: 'Pending First-Time Password Set',
    createdAt: '2026-08-18T14:00:00Z',
    eventsCount: 0,
    totalRegistrations: 0,
  },
];

// Seed Events
const SEED_EVENTS: EventItem[] = [
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
    registeredCount: 3,
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
    registeredCount: 1,
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
    registeredCount: 0,
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
    registeredCount: 0,
  },
];

// Seed Registrations
const SEED_REGISTRATIONS: EventRegistration[] = [
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
    registeredAt: '2026-08-23T09:10:00Z',
    status: 'Selected',
  },
];

// Seed Scholarships
const SEED_SCHOLARSHIPS: ScholarshipItem[] = [
  {
    id: 's-1',
    name: 'Merit Academic Scholarship 2026',
    provider: 'College Administration & Academic Council',
    category: 'Merit',
    benefits: '100% Tuition Fee Waiver for Academic Semester',
    amount: '₹85,000 / semester',
    eligibility: 'Top 5% students in each department based on CGPA (Min 9.0+)',
    deadline: '2026-11-15',
    documents: 'Previous Semesters Marksheet, HOD Recommendation Letter, College ID',
    totalQuota: 50,
    applicantsCount: 38,
    description: 'Awarded to departmental toppers with exemplary scholastic track record and active academic participation.',
  },
  {
    id: 's-2',
    name: 'Women in STEM Research Fellowship',
    provider: 'Central R&D Cell & National Science Foundation',
    category: 'Women-STEM',
    benefits: 'Direct Research Grant + Lab Equipment Access',
    amount: '₹60,000 / year',
    eligibility: 'Female B.Tech/M.Tech students with published research or thesis proposal',
    deadline: '2026-11-30',
    documents: 'Research Abstract, Department Guide Endorsement, Identity Proof',
    totalQuota: 25,
    applicantsCount: 19,
    description: 'Designed to elevate female research leaders in Artificial Intelligence, Semiconductor Physics, and Quantum Computing.',
  },
  {
    id: 's-3',
    name: 'EWS & Need-Based Education Assistance',
    provider: 'State Government Education Directorate',
    category: 'Need-Based',
    benefits: 'Annual Tuition Allowance + Books & Device Support',
    amount: '₹40,000 / year',
    eligibility: 'Annual family income under ₹3.5 Lakhs per annum with CGPA > 6.5',
    deadline: '2026-12-05',
    documents: 'Valid Tehsildar Income Certificate, BPL Card (if applicable), Bank Passbook',
    totalQuota: 80,
    applicantsCount: 52,
    description: 'Financial assistance guaranteeing that economic hardship does not hinder high-achieving undergraduates.',
  },
  {
    id: 's-4',
    name: 'Sports Excellence & Athletic Grant',
    provider: 'University Sports Board',
    category: 'Sports',
    benefits: '50% Tuition Waiver + Special Training Kits & Travel Allowances',
    amount: '₹35,000 / year',
    eligibility: 'Representation at Inter-University, State, or National Championship',
    deadline: '2026-11-20',
    documents: 'Sports Council Merit Certificate, Physical Fitness Certificate, Coach Endorsement',
    totalQuota: 20,
    applicantsCount: 12,
    description: 'Supporting competitive student athletes who represent the institution in national athletic competitions.',
  },
];

// Seed Scholarship Applicants
const SEED_SCHOLARSHIP_APPLICANTS: ScholarshipApplicant[] = [
  {
    id: 'app-1',
    scholarshipId: 's-1',
    scholarshipName: 'Merit Academic Scholarship 2026',
    studentId: 'student-1',
    studentName: 'Aarav Sharma',
    studentEmail: 'student@campus360.edu',
    rollNumber: '2023CSE042',
    department: 'Computer Science & Engineering',
    year: 3,
    cgpa: 9.42,
    familyIncome: '₹6.2 Lakhs / year',
    category: 'General',
    appliedDate: '2026-08-25',
    status: 'Approved',
  },
  {
    id: 'app-2',
    scholarshipId: 's-2',
    scholarshipName: 'Women in STEM Research Fellowship',
    studentId: 'student-2',
    studentName: 'Priya Verma',
    studentEmail: 'priya.verma@campus360.edu',
    rollNumber: '2023ECE019',
    department: 'Electronics & Communication',
    year: 3,
    cgpa: 9.15,
    familyIncome: '₹5.5 Lakhs / year',
    category: 'General',
    appliedDate: '2026-08-26',
    status: 'Documents Verified',
  },
  {
    id: 'app-3',
    scholarshipId: 's-3',
    scholarshipName: 'EWS & Need-Based Education Assistance',
    studentId: 'student-3',
    studentName: 'Rohit Mehta',
    studentEmail: 'rohit.mehta@campus360.edu',
    rollNumber: '2024IT105',
    department: 'Information Technology',
    year: 2,
    cgpa: 7.85,
    familyIncome: '₹2.4 Lakhs / year',
    category: 'OBC - Non Creamy',
    appliedDate: '2026-08-27',
    status: 'Under Review',
  },
  {
    id: 'app-4',
    scholarshipId: 's-1',
    scholarshipName: 'Merit Academic Scholarship 2026',
    studentId: 'student-4',
    studentName: 'Devendra Kumar',
    studentEmail: 'devendra.k@campus360.edu',
    rollNumber: '2023CSE012',
    department: 'Computer Science & Engineering',
    year: 3,
    cgpa: 9.28,
    familyIncome: '₹4.8 Lakhs / year',
    category: 'General',
    appliedDate: '2026-08-28',
    status: 'Shortlisted',
  },
  {
    id: 'app-5',
    scholarshipId: 's-3',
    scholarshipName: 'EWS & Need-Based Education Assistance',
    studentId: 'student-5',
    studentName: 'Anjali Gupta',
    studentEmail: 'anjali.gupta@campus360.edu',
    rollNumber: '2024EE034',
    department: 'Electrical Engineering',
    year: 2,
    cgpa: 8.12,
    familyIncome: '₹2.1 Lakhs / year',
    category: 'General - EWS',
    appliedDate: '2026-08-29',
    status: 'Under Review',
    missingDocuments: ['Income Certificate Not Signed by Tehsildar'],
  },
];

// Seed Missing / Pending Alerts
const SEED_MISSING_STUDENTS: MissingStudentAlert[] = [
  {
    id: 'mis-1',
    studentName: 'Neha Deshmukh',
    rollNumber: '2023CSE055',
    department: 'Computer Science & Engineering',
    year: 3,
    cgpa: 9.65,
    eligibleFor: 'Merit Academic Scholarship (Dept Rank 1)',
    reason: 'Not Yet Applied',
    contactEmail: 'neha.d@campus360.edu',
  },
  {
    id: 'mis-2',
    studentName: 'Kavya Sunder',
    rollNumber: '2023ECE044',
    department: 'Electronics & Communication',
    year: 3,
    cgpa: 9.32,
    eligibleFor: 'Women in STEM Research Fellowship',
    reason: 'Not Yet Applied',
    contactEmail: 'kavya.s@campus360.edu',
  },
  {
    id: 'mis-3',
    studentName: 'Anjali Gupta',
    rollNumber: '2024EE034',
    department: 'Electrical Engineering',
    year: 2,
    cgpa: 8.12,
    eligibleFor: 'EWS & Need-Based Education Assistance',
    reason: 'Missing Income Certificate',
    contactEmail: 'anjali.gupta@campus360.edu',
  },
  {
    id: 'mis-4',
    studentName: 'Suresh Patel',
    rollNumber: '2023ME078',
    department: 'Mechanical Engineering',
    year: 3,
    cgpa: 9.08,
    eligibleFor: 'Merit Academic Scholarship',
    reason: 'Incomplete Grade Transcript',
    contactEmail: 'suresh.p@campus360.edu',
  },
];

// Seed Scholarship Notices
const SEED_SCHOLARSHIP_NOTICES: ScholarshipNotice[] = [
  {
    id: 'sn-1',
    title: 'Merit Scholarship 2026 Phase 1 Document Verification Extended',
    source: 'Scholarship Disbursal Cell',
    category: 'Merit Scheme',
    priority: 'Urgent',
    date: '2026-08-30',
    desc: 'All eligible students with CGPA >= 9.0 must submit hard copies of semester 1-4 grade cards by November 15 at Admin Office Block Room 104.',
    deadline: '2026-11-15',
    attachment: 'Merit_Verification_Checklist.pdf',
  },
  {
    id: 'sn-2',
    title: 'State Post-Matric & EWS Renewal Form Guidelines 2026-27',
    source: 'State Welfare Liaison Cell',
    category: 'Government Scheme',
    priority: 'High',
    date: '2026-08-28',
    desc: 'Income certificates issued prior to April 1, 2026 are not valid for current academic year. Submit fresh digitized certificates verified through DigiLocker.',
    deadline: '2026-12-05',
    attachment: 'EWS_Guideline_Notification.pdf',
  },
  {
    id: 'sn-3',
    title: 'National Fellowship for Women in Science & AI Research Nominations',
    source: 'R&D Directorate',
    category: 'Research Grant',
    priority: 'General',
    date: '2026-08-24',
    desc: 'Shortlisted candidates will be invited for a 10-minute presentation before the Senate Evaluation Committee. Contact research cell for templates.',
    deadline: '2026-11-30',
    attachment: 'Research_Presentation_Rubric.pdf',
  },
];

// Seed Winners
const SEED_WINNERS: WinnerItem[] = [
  {
    id: 'win-1',
    studentName: 'Aarav Sharma & Team CyberGrid',
    rollNumber: '2023CSE042',
    dept: 'Computer Science (CSE)',
    year: '3rd Year (Batch 2027)',
    title: 'National Champions - Smart India Hackathon (SIH 2026)',
    competition: 'Smart India Hackathon National Grand Finale',
    organizer: 'Ministry of Education & AICTE',
    category: 'Hackathons',
    position: '1st Place Winner',
    prize: '₹1,50,000 Cash Prize + Incubation Grant',
    date: 'Aug 20, 2026',
    desc: 'Built an autonomous AI edge gateway for distributed supply chain traceability across cold storage logistics networks, evaluated against 200+ national universities.',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=60',
    teamMembers: ['Aarav Sharma (Lead)', 'Priya Verma', 'Devendra Kumar', 'Riya Sen'],
  },
  {
    id: 'win-2',
    studentName: 'Priya Patel',
    rollNumber: '2023ECE019',
    dept: 'Electronics & Communication (ECE)',
    year: '3rd Year (Batch 2027)',
    title: 'Best Research Paper Award - IEEE Solid-State Circuits',
    competition: 'IEEE International Solid-State Circuits Conference',
    organizer: 'IEEE Circuits and Systems Society (CAS)',
    category: 'Research',
    position: 'Gold Medalist',
    prize: '$1,200 International Travel Grant & Trophy',
    date: 'Aug 15, 2026',
    desc: 'Published an ultralow-power analog front-end circuit design in 12nm FinFET node, achieving a 42% reduction in static leakage for wearable biomedical telemetry.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=60',
    teamMembers: ['Priya Patel (Author)', 'Prof. Rajesh Varma (Mentor)'],
  },
  {
    id: 'win-3',
    studentName: 'Kunal Singhania',
    rollNumber: '2023IT088',
    dept: 'Information Technology (IT)',
    year: '4th Year (Batch 2026)',
    title: 'Google Summer of Code (GSoC) 2026 Contributor & Finalist',
    competition: 'Google Open Source Peer Program',
    organizer: 'Google Open Source Programs Office',
    category: 'Hackathons',
    position: '1st Place Winner',
    prize: '$3,000 Stipend + Pre-Placement Interview',
    date: 'Aug 10, 2026',
    desc: 'Engineered high-performance WebAssembly compilation plugins for the Chromium v8 engine, speeding up client-side cryptographic hashing by 3.2x.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 'win-4',
    studentName: 'Campus Robotics Team "Voltrix"',
    rollNumber: '2024ROBO001',
    dept: 'Robotics & Automation Club',
    year: 'Multi-Department Batch',
    title: '1st Place - Robocon India 2026 Autonomous Navigation',
    competition: 'ABU Asia-Pacific Robot Contest (Robocon)',
    organizer: 'Doordarshan & Indian Institute of Technology',
    category: 'Sports',
    position: '1st Place Winner',
    prize: '₹2,00,000 Cash Award + National Trophy',
    date: 'July 28, 2026',
    desc: 'Developed dual autonomous rovers utilizing LiDAR SLAM and real-time computer vision that cleared the obstacle course in a record 1 minute 14 seconds.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60',
    teamMembers: ['Vikram Malhotra (Lead)', 'Rohit Mehta', 'Tanvi Joshi', 'Siddharth Rao'],
  },
  {
    id: 'win-5',
    studentName: 'Ananya Deshmukh',
    rollNumber: '2023CSE102',
    dept: 'Computer Science (CSE)',
    year: '3rd Year (Batch 2027)',
    title: '1st Prize - All-India University Classical Solo Vocals',
    competition: 'AIU National Inter-University Cultural Festival',
    organizer: 'Association of Indian Universities (AIU)',
    category: 'Cultural',
    position: 'Gold Medalist',
    prize: 'National Gold Medal & Rolling Trophy',
    date: 'July 14, 2026',
    desc: 'Won first position representing our college in Hindustani Classical Solo vocals among participants from over 85 universities across the nation.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 'win-6',
    studentName: 'Rohan Mehra',
    rollNumber: '2023CSE089',
    dept: 'Computer Science (CSE)',
    year: '4th Year (Batch 2026)',
    title: 'Highest Placement Offer - Microsoft Redmond SDE',
    competition: 'Global Campus Recruitment Drive',
    organizer: 'Microsoft Corporation',
    category: 'Placements',
    position: '1st Place Winner',
    prize: '₹54.5 LPA Compensation Package',
    date: 'Aug 05, 2026',
    desc: 'Secured full-time international Software Development Engineer placement at Microsoft Redmond headquarters following stellar internship evaluation.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60',
  },
];

function getStored<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function saveStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error('Failed to write to localStorage:', err);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Authentication
  login: async (email: string, password: string, role?: string) => {
    try {
      return await request<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, role }),
      });
    } catch (err) {
      // Fallback check against stored heads
      const storedHeads = getStored<HeadAccount[]>(STORAGE_KEYS.HEADS, SEED_HEADS);
      const matchedHead = storedHeads.find(
        (h) => h.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (matchedHead) {
        return {
          token: `campus360_token_${matchedHead.id}`,
          user: {
            id: matchedHead.id,
            email: matchedHead.email,
            role: 'HEAD' as UserRole,
            name: matchedHead.name,
            organization: matchedHead.organization,
            headTitle: matchedHead.headTitle,
            mustChangePassword: matchedHead.mustChangePassword,
          },
        };
      }
      throw err;
    }
  },

  changePassword: async (params: { userId?: string; email?: string; newPassword: string; confirmPassword?: string }) => {
    return request<{ message: string; user: User }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Super Admin: Heads Management
  generateHead: async (data: {
    name: string;
    email?: string;
    organization: string;
    headTitle?: string;
    password?: string;
  }) => {
    try {
      const res = await request<{
        message: string;
        credentials: {
          id: string;
          email: string;
          temporaryPassword: string;
          name: string;
          organization: string;
          headTitle: string;
          mustChangePassword: boolean;
          createdAt: string;
        };
      }>('/admin/generate-head', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      // Keep localStorage in sync
      const current = getStored<HeadAccount[]>(STORAGE_KEYS.HEADS, SEED_HEADS);
      const newHeadItem: HeadAccount = {
        id: res.credentials.id,
        name: res.credentials.name,
        email: res.credentials.email,
        organization: res.credentials.organization,
        headTitle: res.credentials.headTitle,
        mustChangePassword: true,
        status: 'Pending First-Time Password Set',
        createdAt: res.credentials.createdAt,
        eventsCount: 0,
        totalRegistrations: 0,
      };
      saveStored(STORAGE_KEYS.HEADS, [newHeadItem, ...current.filter((h) => h.id !== newHeadItem.id)]);

      // Real-time Supabase sync
      try {
        await supabase.from('head_credentials').upsert({
          id: res.credentials.id,
          name: res.credentials.name,
          email: res.credentials.email.toLowerCase(),
          organization: res.credentials.organization,
          head_title: res.credentials.headTitle,
          temp_password: res.credentials.temporaryPassword,
          status: 'Pending First-Time Password Set',
          must_change_password: true,
        }, { onConflict: 'email' });
      } catch (e) {
        console.warn('Supabase head store notice:', e);
      }

      return res;
    } catch (err: any) {
      // Local fallback in case backend is offline
      const orgSlug = data.organization.toLowerCase().replace(/[^a-z0-9]/g, '');
      const nameSlug = data.name.toLowerCase().replace(/[^a-z0-9]/g, '.');
      const uniqueSuffix = Math.floor(100 + Math.random() * 900);
      const finalEmail = (data.email && data.email.trim()) || `${nameSlug}.${orgSlug}@campus360.edu`;
      const finalPass = data.password || `Pass@${Math.floor(1000 + Math.random() * 9000)}`;
      const newId = generateUUID();

      const newHeadItem: HeadAccount = {
        id: newId,
        name: data.name,
        email: finalEmail,
        organization: data.organization,
        headTitle: data.headTitle || `${data.organization} Head`,
        mustChangePassword: true,
        status: 'Pending First-Time Password Set',
        createdAt: new Date().toISOString(),
        eventsCount: 0,
        totalRegistrations: 0,
      };

      const current = getStored<HeadAccount[]>(STORAGE_KEYS.HEADS, SEED_HEADS);
      saveStored(STORAGE_KEYS.HEADS, [newHeadItem, ...current]);

      // Real-time Supabase sync on fallback
      try {
        await supabase.from('head_credentials').upsert({
          id: newHeadItem.id,
          name: newHeadItem.name,
          email: newHeadItem.email.toLowerCase(),
          organization: newHeadItem.organization,
          head_title: newHeadItem.headTitle,
          temp_password: finalPass,
          status: 'Pending First-Time Password Set',
          must_change_password: true,
        }, { onConflict: 'email' });
      } catch (e) {
        console.warn('Supabase head store notice:', e);
      }

      return {
        message: `Head credentials successfully generated for ${data.organization}!`,
        credentials: {
          id: newHeadItem.id,
          email: newHeadItem.email,
          temporaryPassword: finalPass,
          name: newHeadItem.name,
          organization: newHeadItem.organization || data.organization,
          headTitle: newHeadItem.headTitle || 'Head',
          mustChangePassword: true,
          createdAt: newHeadItem.createdAt,
        },
      };
    }
  },

  getHeads: async () => {
    // 1. Try real-time Supabase head_credentials table
    try {
      const { data: sbHeads } = await supabase.from('head_credentials').select('*');
      if (sbHeads && sbHeads.length > 0) {
        const mapped: HeadAccount[] = sbHeads.map((h: any) => ({
          id: h.id,
          name: h.name,
          email: h.email,
          organization: h.organization,
          headTitle: h.head_title,
          mustChangePassword: h.must_change_password,
          status: h.status || 'Active',
          createdAt: h.created_at,
          eventsCount: h.events_count || 0,
          totalRegistrations: h.total_registrations || 0,
        }));
        saveStored(STORAGE_KEYS.HEADS, mapped);
        return mapped;
      }
    } catch (err) {
      // Supabase fetch notice
    }

    // 2. Try backend API
    try {
      const data = await request<HeadAccount[]>('/admin/heads');
      if (Array.isArray(data) && data.length > 0) {
        saveStored(STORAGE_KEYS.HEADS, data);
        return data;
      }
    } catch (err) {
      // fallback
    }
    return getStored<HeadAccount[]>(STORAGE_KEYS.HEADS, SEED_HEADS);
  },

  deleteHead: async (headId: string) => {
    try {
      await supabase.from('head_credentials').delete().eq('id', headId);
    } catch (e) {}

    try {
      await request<{ message: string; headId: string }>(`/admin/heads/${headId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Backend DELETE head failed, applying local delete:', err);
    }
    const current = getStored<HeadAccount[]>(STORAGE_KEYS.HEADS, SEED_HEADS);
    const updated = current.filter((h) => h.id !== headId);
    saveStored(STORAGE_KEYS.HEADS, updated);
    return { message: 'Head account removed successfully', headId };
  },

  resetHeadPassword: async (headId: string, newPassword?: string) => {
    const tempPass = newPassword || `Pass@${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      return await request<{ message: string; temporaryPassword: string; email: string }>('/admin/reset-head-password', {
        method: 'POST',
        body: JSON.stringify({ headId, newPassword: tempPass }),
      });
    } catch {
      const current = getStored<HeadAccount[]>(STORAGE_KEYS.HEADS, SEED_HEADS);
      const head = current.find((h) => h.id === headId);
      return {
        message: `Password reset successfully for ${head?.name || 'Head'}`,
        temporaryPassword: tempPass,
        email: head?.email || 'head@campus360.edu',
      };
    }
  },

  getAdminOverview: async () => {
    try {
      return await request<{
        stats: {
          totalStudents: number;
          totalHeads: number;
          totalEvents: number;
          totalOpportunities: number;
          totalSocialPosts: number;
        };
        events: (EventItem & { registeredCount: number; registrations: EventRegistration[] })[];
        opportunities: OpportunityItem[];
        socialPosts: SocialPost[];
      }>('/admin/overview');
    } catch {
      const events = getStored<EventItem[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);
      const registrations = getStored<EventRegistration[]>(STORAGE_KEYS.REGS, SEED_REGISTRATIONS);
      const heads = getStored<HeadAccount[]>(STORAGE_KEYS.HEADS, SEED_HEADS);

      const eventsWithStats = events.map((ev) => {
        const regs = registrations.filter((r) => r.eventId === ev.id);
        return {
          ...ev,
          registeredCount: regs.length,
          registrations: regs,
        };
      });

      return {
        stats: {
          totalStudents: 2450,
          totalHeads: heads.length,
          totalEvents: events.length,
          totalOpportunities: 3,
          totalSocialPosts: 2,
        },
        events: eventsWithStats,
        opportunities: [],
        socialPosts: [],
      };
    }
  },

  // ── Events & Rosters (Supabase Connected) ──
  getEvents: async (): Promise<EventItem[]> => {
    try {
      const { data: sbEvents } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (sbEvents && sbEvents.length > 0) {
        const mapped: EventItem[] = sbEvents.map((e: any) => ({
          id: e.id,
          title: e.title,
          category: e.category,
          organizer: e.organizer,
          organizerRole: e.organizer_role,
          createdByHeadId: e.created_by_head_id,
          date: e.event_date,
          time: e.event_time || '10:00 AM',
          venue: e.venue || 'Auditorium',
          desc: e.description || '',
          image: e.image_url || 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=60',
          deadline: e.deadline || e.event_date,
          maxCapacity: e.max_capacity || 100,
          eligibility: e.eligibility || 'Open to all',
          registeredCount: e.registered_count || 0,
          createdAt: e.created_at,
        }));
        saveStored(STORAGE_KEYS.EVENTS, mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase getEvents notice:', err);
    }

    try {
      const data = await request<EventItem[]>('/events');
      if (Array.isArray(data) && data.length > 0) {
        saveStored(STORAGE_KEYS.EVENTS, data);
        return data;
      }
    } catch {}

    return getStored<EventItem[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);
  },

  postEvent: async (eventData: Partial<EventItem> & { headId?: string }) => {
    const newId = generateUUID();
    const newEvent: EventItem = {
      id: newId,
      title: eventData.title || 'Untitled Campus Event',
      category: eventData.category || 'General',
      organizer: eventData.organizer || 'Campus Organization',
      organizerRole: eventData.organizerRole || 'Head Convener',
      createdByHeadId: eventData.headId,
      date: eventData.date || new Date().toISOString().split('T')[0],
      time: eventData.time || '10:00 AM',
      venue: eventData.venue || 'Campus Auditorium',
      desc: eventData.desc || 'No description provided',
      image:
        eventData.image ||
        'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=60',
      deadline: eventData.deadline || eventData.date,
      maxCapacity: Number(eventData.maxCapacity) || 100,
      eligibility: eventData.eligibility || 'Open to all students',
      createdAt: new Date().toISOString(),
      registeredCount: 0,
    };

    // 1. Live Supabase Insert
    try {
      const { data: sbCreated } = await supabase
        .from('events')
        .insert({
          id: newId,
          title: newEvent.title,
          category: newEvent.category,
          organizer: newEvent.organizer,
          organizer_role: newEvent.organizerRole,
          created_by_head_id: isValidUUID(eventData.headId) ? eventData.headId : null,
          event_date: newEvent.date,
          event_time: newEvent.time,
          venue: newEvent.venue,
          description: newEvent.desc,
          image_url: newEvent.image,
          deadline: newEvent.deadline,
          max_capacity: newEvent.maxCapacity,
          eligibility: newEvent.eligibility,
          registered_count: 0,
          is_published: true,
        })
        .select()
        .single();

      if (sbCreated) {
        newEvent.id = sbCreated.id;
      }
    } catch (e) {
      console.warn('Supabase postEvent notice:', e);
    }

    const current = getStored<EventItem[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);
    saveStored(STORAGE_KEYS.EVENTS, [newEvent, ...current]);
    return { message: 'Event successfully published!', event: newEvent };
  },

  registerForEvent: async (
    eventId: string,
    studentData: {
      studentId: string;
      studentName: string;
      studentEmail: string;
      rollNumber?: string;
      department?: string;
      year?: number;
      phone?: string;
    }
  ) => {
    const newRegId = generateUUID();
    const newReg: EventRegistration = {
      id: newRegId,
      eventId,
      studentId: studentData.studentId,
      studentName: studentData.studentName,
      studentEmail: studentData.studentEmail,
      rollNumber: studentData.rollNumber || '2023CSE042',
      department: studentData.department || 'Computer Science',
      year: studentData.year || 3,
      phone: studentData.phone || '+91 98765 43210',
      registeredAt: new Date().toISOString(),
      status: 'Registered',
    };

    // 1. Live Supabase Insert
    try {
      const { data: sbReg } = await supabase
        .from('event_registrations')
        .insert({
          id: newRegId,
          event_id: eventId,
          student_id: isValidUUID(studentData.studentId) ? studentData.studentId : null,
          student_name: studentData.studentName,
          student_email: studentData.studentEmail,
          roll_number: studentData.rollNumber,
          department: studentData.department,
          year: studentData.year ? Number(studentData.year) : 3,
          phone: studentData.phone,
          status: 'Registered',
        })
        .select()
        .single();

      if (sbReg?.id) {
        newReg.id = sbReg.id;
      }

      // Update registered_count on Supabase event
      const { data: ev } = await supabase.from('events').select('registered_count').eq('id', eventId).single();
      if (ev) {
        await supabase.from('events').update({ registered_count: (ev.registered_count || 0) + 1 }).eq('id', eventId);
      }
    } catch (e) {
      console.warn('Supabase registration notice:', e);
    }

    const currentRegs = getStored<EventRegistration[]>(STORAGE_KEYS.REGS, SEED_REGISTRATIONS);
    saveStored(STORAGE_KEYS.REGS, [newReg, ...currentRegs.filter((r) => r.id !== newReg.id)]);

    // Update count on local cached event
    const currentEvents = getStored<EventItem[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);
    const ev = currentEvents.find((e) => e.id === eventId);
    if (ev) {
      ev.registeredCount = (ev.registeredCount || 0) + 1;
      saveStored(STORAGE_KEYS.EVENTS, currentEvents);
    }

    return { message: 'Successfully registered for event!', registration: newReg };
  },

  getEventRegistrations: async (eventId: string) => {
    // 1. Try Supabase
    try {
      const { data: sbRegs } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId);

      if (sbRegs && sbRegs.length > 0) {
        const events = await api.getEvents();
        const event = events.find((e) => e.id === eventId) || events[0];
        const students: EventRegistration[] = sbRegs.map((r: any) => ({
          id: r.id,
          eventId: r.event_id,
          studentId: r.student_id,
          studentName: r.student_name,
          studentEmail: r.student_email,
          rollNumber: r.roll_number,
          department: r.department,
          year: r.year,
          phone: r.phone,
          registeredAt: r.registered_at,
          status: r.status,
        }));
        return {
          event,
          totalApplicants: students.length,
          students,
        };
      }
    } catch (e) {
      console.warn('Supabase getEventRegistrations notice:', e);
    }

    const events = getStored<EventItem[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);
    const regs = getStored<EventRegistration[]>(STORAGE_KEYS.REGS, SEED_REGISTRATIONS);
    const event = events.find((e) => e.id === eventId) || events[0];
    const students = regs.filter((r) => r.eventId === eventId);
    return {
      event,
      totalApplicants: students.length,
      students,
    };
  },

  updateRegistrationStatus: async (eventId: string, regId: string, status: EventRegistration['status']) => {
    try {
      await supabase.from('event_registrations').update({ status }).eq('id', regId);
    } catch (e) {
      console.warn('Supabase status update notice:', e);
    }

    const regs = getStored<EventRegistration[]>(STORAGE_KEYS.REGS, SEED_REGISTRATIONS);
    const reg = regs.find((r) => r.id === regId);
    if (reg) {
      reg.status = status;
      saveStored(STORAGE_KEYS.REGS, regs);
    }
    return { message: 'Status updated successfully', registration: reg! };
  },

  getMyRegistrations: async (studentId: string) => {
    try {
      const { data: sbRegs } = await supabase
        .from('event_registrations')
        .select('*');

      if (sbRegs && sbRegs.length > 0) {
        const events = await api.getEvents();
        const filtered = sbRegs.filter((r: any) => r.student_id === studentId || r.student_email?.includes('@'));
        return filtered.map((r: any) => ({
          id: r.id,
          eventId: r.event_id,
          studentId: r.student_id,
          studentName: r.student_name,
          studentEmail: r.student_email,
          rollNumber: r.roll_number,
          department: r.department,
          year: r.year,
          phone: r.phone,
          registeredAt: r.registered_at,
          status: r.status,
          event: events.find((e) => e.id === r.event_id),
        }));
      }
    } catch (e) {}

    const regs = getStored<EventRegistration[]>(STORAGE_KEYS.REGS, SEED_REGISTRATIONS);
    const events = getStored<EventItem[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);
    return regs
      .filter((r) => r.studentId === studentId || r.studentEmail === 'student@campus360.edu')
      .map((r) => ({
        ...r,
        event: events.find((e) => e.id === r.eventId),
      }));
  },

  // ── Scholarships System (Supabase Connected) ──
  getScholarships: async (): Promise<ScholarshipItem[]> => {
    try {
      const { data: sbScholarships } = await supabase
        .from('scholarships')
        .select('*')
        .order('created_at', { ascending: false });

      if (sbScholarships && sbScholarships.length > 0) {
        const mapped: ScholarshipItem[] = sbScholarships.map((s: any) => ({
          id: s.id,
          name: s.name,
          provider: s.provider,
          category: s.category,
          benefits: s.benefits || '',
          amount: s.amount || '',
          eligibility: s.eligibility || '',
          deadline: s.deadline || '',
          documents: s.documents ? s.documents.split(', ') : [],
          totalQuota: s.total_quota || 50,
          applicantsCount: s.applicants_count || 0,
          description: s.description || '',
        }));
        saveStored(STORAGE_KEYS.SCHOLARSHIPS, mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase getScholarships notice:', err);
    }
    return getStored<ScholarshipItem[]>(STORAGE_KEYS.SCHOLARSHIPS, SEED_SCHOLARSHIPS);
  },

  applyForScholarship: async (application: Omit<ScholarshipApplicant, 'id' | 'appliedDate' | 'status'>) => {
    const newId = generateUUID();
    const newApp: ScholarshipApplicant = {
      ...application,
      id: newId,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'Under Review',
    };

    // 1. Live Supabase Insert
    try {
      const { data: sbApp } = await supabase
        .from('scholarship_applications')
        .insert({
          id: newId,
          scholarship_id: application.scholarshipId,
          scholarship_name: application.scholarshipName,
          student_id: isValidUUID(application.studentId) ? application.studentId : null,
          student_name: application.studentName,
          student_email: application.studentEmail,
          roll_number: application.rollNumber,
          department: application.department,
          year: application.year ? Number(application.year) : 3,
          cgpa: application.cgpa ? Number(application.cgpa) : null,
          family_income: application.familyIncome,
          category: application.category,
          status: 'Under Review',
        })
        .select()
        .single();

      if (sbApp?.id) {
        newApp.id = sbApp.id;
      }

      // Increment applicants_count on scholarship
      const { data: sch } = await supabase.from('scholarships').select('applicants_count').eq('id', application.scholarshipId).single();
      if (sch) {
        await supabase.from('scholarships').update({ applicants_count: (sch.applicants_count || 0) + 1 }).eq('id', application.scholarshipId);
      }
    } catch (e) {
      console.warn('Supabase applyForScholarship notice:', e);
    }

    const current = getStored<ScholarshipApplicant[]>(STORAGE_KEYS.SCHOLARSHIP_APPS, SEED_SCHOLARSHIP_APPLICANTS);
    saveStored(STORAGE_KEYS.SCHOLARSHIP_APPS, [newApp, ...current]);

    // Update count on local cached scholarship
    const scholarships = getStored<ScholarshipItem[]>(STORAGE_KEYS.SCHOLARSHIPS, SEED_SCHOLARSHIPS);
    const sch = scholarships.find((s) => s.id === application.scholarshipId);
    if (sch) {
      sch.applicantsCount = (sch.applicantsCount || 0) + 1;
      saveStored(STORAGE_KEYS.SCHOLARSHIPS, scholarships);
    }

    return newApp;
  },

  getScholarshipApplications: async (): Promise<ScholarshipApplicant[]> => {
    try {
      const { data: sbApps } = await supabase
        .from('scholarship_applications')
        .select('*')
        .order('applied_date', { ascending: false });

      if (sbApps && sbApps.length > 0) {
        const mapped: ScholarshipApplicant[] = sbApps.map((a: any) => ({
          id: a.id,
          scholarshipId: a.scholarship_id,
          scholarshipName: a.scholarship_name,
          studentId: a.student_id,
          studentName: a.student_name,
          studentEmail: a.student_email,
          rollNumber: a.roll_number,
          department: a.department,
          year: a.year,
          cgpa: a.cgpa,
          familyIncome: a.family_income,
          category: a.category,
          appliedDate: a.applied_date,
          status: a.status,
          missingDocuments: a.missing_documents || [],
        }));
        saveStored(STORAGE_KEYS.SCHOLARSHIP_APPS, mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Supabase getScholarshipApplications notice:', e);
    }
    return getStored<ScholarshipApplicant[]>(STORAGE_KEYS.SCHOLARSHIP_APPS, SEED_SCHOLARSHIP_APPLICANTS);
  },

  updateScholarshipApplicantStatus: async (
    appId: string,
    status: ScholarshipApplicant['status']
  ): Promise<ScholarshipApplicant | undefined> => {
    try {
      await supabase.from('scholarship_applications').update({ status }).eq('id', appId);
    } catch (e) {
      console.warn('Supabase updateScholarshipApplicantStatus notice:', e);
    }

    const apps = getStored<ScholarshipApplicant[]>(STORAGE_KEYS.SCHOLARSHIP_APPS, SEED_SCHOLARSHIP_APPLICANTS);
    const app = apps.find((a) => a.id === appId);
    if (app) {
      app.status = status;
      saveStored(STORAGE_KEYS.SCHOLARSHIP_APPS, apps);
    }
    return app;
  },

  getMissingStudents: async (): Promise<MissingStudentAlert[]> => {
    return SEED_MISSING_STUDENTS;
  },

  getScholarshipNotices: async (): Promise<ScholarshipNotice[]> => {
    return getStored<ScholarshipNotice[]>(STORAGE_KEYS.SCHOLARSHIP_NOTICES, SEED_SCHOLARSHIP_NOTICES);
  },

  postScholarshipNotice: async (notice: Omit<ScholarshipNotice, 'id' | 'date'>): Promise<ScholarshipNotice> => {
    const newNotice: ScholarshipNotice = {
      ...notice,
      id: generateUUID(),
      date: new Date().toISOString().split('T')[0],
    };
    const notices = getStored<ScholarshipNotice[]>(STORAGE_KEYS.SCHOLARSHIP_NOTICES, SEED_SCHOLARSHIP_NOTICES);
    saveStored(STORAGE_KEYS.SCHOLARSHIP_NOTICES, [newNotice, ...notices]);
    return newNotice;
  },

  // ── Notices System (Supabase Connected) ──
  getNotices: async (): Promise<NoticeItem[]> => {
    try {
      const { data: sbNotices } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false });

      if (sbNotices && sbNotices.length > 0) {
        const mapped: NoticeItem[] = sbNotices.map((n: any) => ({
          id: n.id,
          title: n.title,
          source: n.source || 'College Admin',
          category: n.category || 'General',
          desc: n.description || '',
          date: n.created_at ? n.created_at.split('T')[0] : 'Today',
          isImportant: n.is_important || false,
          attachment: n.attachment_url,
          createdAt: n.created_at,
        }));
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase getNotices notice:', err);
    }

    return [
      {
        id: 'n-1',
        title: 'T&P Placement Drive: Google India recruitment cycle open',
        source: 'T&P Cell',
        category: 'Placement',
        date: '2026-08-30',
        desc: 'Applications are invited from 2027 batch CSE/IT students for Software Engineering internship role. Package details and links attached. Students must maintain a CGPA of 8.0 and above.',
        isImportant: true,
        attachment: 'google_jd_2027.pdf'
      },
      {
        id: 'n-2',
        title: 'R&D Cell: Project Expo Registration deadline extended',
        source: 'R&D Cell',
        category: 'Research',
        date: '2026-08-29',
        desc: 'Annual technical project competition registration has been extended. Submit project abstract to head cell directly. Top 3 teams win cash rewards of up to 50k.',
        isImportant: false,
      },
      {
        id: 'n-3',
        title: 'Mid-Sem Examination Schedule Fall Semester',
        source: 'Academic Admin',
        category: 'College',
        date: '2026-08-28',
        desc: 'Mid semester exams will commence from September 18. Detailed date sheet is now available for download. Ensure you clear all outstanding library dues.',
        isImportant: true,
        attachment: 'datesheet_midsem_2026.pdf'
      },
      {
        id: 'n-4',
        title: 'Inter-College Sports Meet: Squad selection trials',
        source: 'Sports Dept',
        category: 'Sports',
        date: '2026-08-26',
        desc: 'Trials for Cricket, Football, Basketball, and Athletics squads start tomorrow at 7:00 AM on the main fields. Carry college ID card.',
        isImportant: false,
      }
    ];
  },

  postNotice: async (notice: { title: string; category: string; desc: string; source?: string; isImportant?: boolean; attachment?: string }) => {
    const newId = generateUUID();
    const createdNotice: NoticeItem = {
      id: newId,
      title: notice.title,
      category: notice.category,
      desc: notice.desc,
      source: notice.source || 'College Admin',
      isImportant: notice.isImportant || false,
      attachment: notice.attachment,
      date: new Date().toISOString().split('T')[0],
    };

    try {
      const { data: sbNotice } = await supabase
        .from('notices')
        .insert({
          id: newId,
          title: notice.title,
          category: notice.category,
          description: notice.desc,
          source: notice.source || 'College Admin',
          is_important: notice.isImportant || false,
          attachment_url: notice.attachment || null,
        })
        .select()
        .single();

      if (sbNotice?.id) {
        createdNotice.id = sbNotice.id;
      }
    } catch (e) {
      console.warn('Supabase postNotice notice:', e);
    }

    return createdNotice;
  },

  deleteNotice: async (noticeId: string) => {
    try {
      await supabase.from('notices').delete().eq('id', noticeId);
    } catch (e) {
      console.warn('Supabase deleteNotice notice:', e);
    }
    return { success: true, noticeId };
  },

  // ── Winners & Achievements (Supabase Connected) ──
  getWinners: async (): Promise<WinnerItem[]> => {
    try {
      const { data: sbWinners } = await supabase
        .from('winners')
        .select('*')
        .order('achievement_date', { ascending: false });

      if (sbWinners && sbWinners.length > 0) {
        const mapped: WinnerItem[] = sbWinners.map((w: any) => ({
          id: w.id,
          studentName: w.student_name,
          rollNumber: w.roll_number,
          dept: w.dept,
          year: w.year,
          title: w.title,
          competition: w.competition,
          organizer: w.organizer,
          category: w.category as any,
          position: w.position,
          prize: w.prize,
          date: w.achievement_date || 'Today',
          desc: w.description || '',
          image: w.image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60',
          teamMembers: w.team_members || [],
          certificateUrl: w.certificate_url,
        }));
        saveStored(STORAGE_KEYS.WINNERS, mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase getWinners notice:', err);
    }
    return getStored<WinnerItem[]>(STORAGE_KEYS.WINNERS, SEED_WINNERS);
  },

  addWinner: async (winner: Omit<WinnerItem, 'id' | 'date'>): Promise<WinnerItem> => {
    const newId = generateUUID();
    const newWinner: WinnerItem = {
      ...winner,
      id: newId,
      date: 'Today',
    };

    try {
      const { data: sbWin } = await supabase
        .from('winners')
        .insert({
          id: newId,
          student_name: winner.studentName,
          roll_number: winner.rollNumber,
          dept: winner.dept,
          year: winner.year,
          title: winner.title,
          competition: winner.competition,
          organizer: winner.organizer,
          category: winner.category,
          position: winner.position,
          prize: winner.prize,
          achievement_date: new Date().toISOString().split('T')[0],
          description: winner.desc,
          image_url: winner.image,
          team_members: winner.teamMembers || [],
        })
        .select()
        .single();

      if (sbWin?.id) {
        newWinner.id = sbWin.id;
      }
    } catch (e) {
      console.warn('Supabase addWinner notice:', e);
    }

    const current = getStored<WinnerItem[]>(STORAGE_KEYS.WINNERS, SEED_WINNERS);
    saveStored(STORAGE_KEYS.WINNERS, [newWinner, ...current]);
    return newWinner;
  },

  // Opportunities
  getOpportunities: async () => {
    return request<OpportunityItem[]>('/opportunities').catch(() => []);
  },
};
