import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db, UserRole, User, EventItem, EventRegistration, SocialPost, OpportunityItem } from './db';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'Campus360 API is running',
    version: '2.0.0',
    endpoints: ['/api/auth', '/api/admin', '/api/events', '/api/social', '/api/opportunities'],
  });
});

// ==========================================
// 1. AUTHENTICATION (Student, Super Admin, Head)
// ==========================================

// Login endpoint
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.findUserByEmail(email.trim());

  if (!user) {
    return res.status(401).json({ error: 'Invalid login credentials. User not found.' });
  }

  // Validate role if specified
  if (role) {
    // Normalization: allow 'ADMIN' to match 'SUPER_ADMIN'
    const expectedRole = role === 'ADMIN' ? 'SUPER_ADMIN' : role;
    if (user.role !== expectedRole) {
      return res.status(403).json({
        error: `This account does not have ${role} privileges. Please switch to the correct portal tab.`,
      });
    }
  }

  // Verify password (plain check with fallback or bcrypt)
  if (user.password !== password) {
    return res.status(401).json({ error: 'Incorrect password. Please verify and try again.' });
  }

  // Return user info and flag if must change password
  return res.json({
    token: `campus360_token_${user.id}_${Date.now()}`,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      organization: user.organization,
      headTitle: user.headTitle,
      mustChangePassword: !!user.mustChangePassword,
      department: user.department,
      year: user.year,
      semester: user.semester,
      rollNumber: user.rollNumber,
      phone: user.phone,
    },
  });
});

// Change Password (Used on first-time login for Heads or user profile settings)
app.post('/api/auth/change-password', (req: Request, res: Response) => {
  const { userId, email, newPassword, confirmPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }

  if (confirmPassword && newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match. Please re-confirm.' });
  }

  let user: User | undefined;
  if (userId) {
    user = db.findUserById(userId);
  } else if (email) {
    user = db.findUserByEmail(email);
  }

  if (!user) {
    return res.status(404).json({ error: 'User account not found' });
  }

  const updated = db.updateUser(user.id, {
    password: newPassword,
    mustChangePassword: false, // Flag cleared upon setting permanent password!
  });

  return res.json({
    message: 'Password updated successfully! Welcome to Campus360.',
    user: {
      id: updated!.id,
      email: updated!.email,
      role: updated!.role,
      name: updated!.name,
      organization: updated!.organization,
      headTitle: updated!.headTitle,
      mustChangePassword: false,
    },
  });
});

// ==========================================
// 2. SUPER ADMIN (Generate IDs & Passwords, Manage Heads, View All Feeds)
// ==========================================

// Super Admin generates Login ID and Password for Club/Dept Heads
app.post('/api/admin/generate-head', (req: Request, res: Response) => {
  const { name, email, organization, headTitle, password } = req.body;

  if (!name || !organization) {
    return res.status(400).json({ error: 'Head Name and Organization are required' });
  }

  // Auto-generate a clean login ID / email if not provided
  const generatedEmail = (
    email ||
    `${organization.toLowerCase().replace(/[^a-z0-9]/g, '')}.head@campus360.edu`
  ).trim();

  // Check if email already exists
  const existing = db.findUserByEmail(generatedEmail);
  if (existing) {
    return res.status(400).json({ error: `An account with ID "${generatedEmail}" already exists.` });
  }

  // Auto-generate strong temporary password if not provided
  const generatedPassword = password || `Pass@${Math.floor(1000 + Math.random() * 9000)}`;

  const newHead: User = {
    id: `head-${Date.now().toString(36)}`,
    email: generatedEmail,
    password: generatedPassword,
    role: 'HEAD',
    name,
    organization,
    headTitle: headTitle || `${organization} Head`,
    mustChangePassword: true, // Requires head to set new password on first login
    createdAt: new Date().toISOString(),
  };

  db.addUser(newHead);

  return res.status(201).json({
    message: `Head credentials successfully generated for ${organization}!`,
    credentials: {
      id: newHead.id,
      email: newHead.email,
      temporaryPassword: newHead.password,
      name: newHead.name,
      organization: newHead.organization,
      headTitle: newHead.headTitle,
      mustChangePassword: true,
      createdAt: newHead.createdAt,
    },
  });
});

// List all generated heads
app.get('/api/admin/heads', (req: Request, res: Response) => {
  const allUsers = db.getUsers();
  const heads = allUsers.filter((u) => u.role === 'HEAD');
  const events = db.getEvents();

  const formattedHeads = heads.map((h) => {
    const headEvents = events.filter((e) => e.createdByHeadId === h.id || e.organizer === h.organization);
    const totalRegistrations = headEvents.reduce((acc, ev) => {
      return acc + db.getRegistrationsByEvent(ev.id).length;
    }, 0);

    return {
      id: h.id,
      name: h.name,
      email: h.email,
      organization: h.organization,
      headTitle: h.headTitle,
      mustChangePassword: h.mustChangePassword,
      status: h.mustChangePassword ? 'Pending First-Time Password Set' : 'Active (Password Configured)',
      createdAt: h.createdAt,
      eventsCount: headEvents.length,
      totalRegistrations,
    };
  });

  return res.json(formattedHeads);
});

// Super Admin resets head password
app.post('/api/admin/reset-head-password', (req: Request, res: Response) => {
  const { headId, newPassword } = req.body;
  if (!headId) return res.status(400).json({ error: 'headId is required' });

  const tempPass = newPassword || `Pass@${Math.floor(1000 + Math.random() * 9000)}`;
  const updated = db.updateUser(headId, {
    password: tempPass,
    mustChangePassword: true,
  });

  if (!updated) return res.status(404).json({ error: 'Head account not found' });

  return res.json({
    message: `Password reset successfully for ${updated.name}`,
    temporaryPassword: tempPass,
    email: updated.email,
  });
});

// Super Admin Full Overview (all events, opportunities, social media posts, stats)
app.get('/api/admin/overview', (req: Request, res: Response) => {
  const events = db.getEvents();
  const opportunities = db.getOpportunities();
  const socialPosts = db.getSocialPosts();
  const users = db.getUsers();

  const totalStudents = users.filter((u) => u.role === 'STUDENT').length;
  const totalHeads = users.filter((u) => u.role === 'HEAD').length;

  const eventsWithStats = events.map((ev) => {
    const registrations = db.getRegistrationsByEvent(ev.id);
    return {
      ...ev,
      registeredCount: registrations.length,
      registrations,
    };
  });

  return res.json({
    stats: {
      totalStudents,
      totalHeads,
      totalEvents: events.length,
      totalOpportunities: opportunities.length,
      totalSocialPosts: socialPosts.length,
    },
    events: eventsWithStats,
    opportunities,
    socialPosts,
  });
});

// ==========================================
// 3. EVENTS & HEAD PORTAL (Post Events, View Applied Students)
// ==========================================

// Get all events (for student/admin/head view)
app.get('/api/events', (req: Request, res: Response) => {
  const events = db.getEvents();
  const enhanced = events.map((ev) => {
    const regs = db.getRegistrationsByEvent(ev.id);
    return {
      ...ev,
      registeredCount: regs.length,
    };
  });
  return res.json(enhanced);
});

// Post a new event (Club/Dept Head or Admin)
app.post('/api/events', (req: Request, res: Response) => {
  const {
    title,
    category,
    organizer,
    date,
    time,
    venue,
    desc,
    image,
    deadline,
    maxCapacity,
    eligibility,
    headId,
  } = req.body;

  if (!title || !category || !date || !desc) {
    return res.status(400).json({ error: 'Title, category, date, and description are required' });
  }

  const defaultImage =
    image ||
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=60';

  const newEvent: EventItem = {
    id: `e-${Date.now().toString(36)}`,
    title,
    category,
    organizer: organizer || 'Campus Organization',
    createdByHeadId: headId,
    date,
    time: time || '10:00 AM',
    venue: venue || 'Campus Auditorium',
    desc,
    image: defaultImage,
    deadline: deadline || date,
    maxCapacity: Number(maxCapacity) || 100,
    eligibility: eligibility || 'Open to all students',
    createdAt: new Date().toISOString(),
  };

  db.addEvent(newEvent);

  // Auto-post an announcement to Campus Social Media feed
  db.addSocialPost({
    id: `sp-${Date.now().toString(36)}`,
    authorName: organizer || 'Campus Head',
    authorRole: 'HEAD',
    authorOrg: organizer || 'Campus Organization',
    content: `📢 New Event Announced: "${newEvent.title}" on ${newEvent.date}! Check events section to register now.`,
    tag: 'Event Announcement',
    imageUrl: newEvent.image,
    likes: 12,
    commentsCount: 2,
    createdAt: new Date().toISOString(),
  });

  return res.status(201).json({
    message: 'Event successfully published!',
    event: newEvent,
  });
});

// Student applies / registers for an event
app.post('/api/events/:eventId/register', (req: Request, res: Response) => {
  const { eventId } = req.params;
  const { studentId, studentName, studentEmail, rollNumber, department, year, phone } = req.body;

  const event = db.findEventById(eventId);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const newRegistration: EventRegistration = {
    id: `reg-${Date.now().toString(36)}`,
    eventId,
    studentId: studentId || 'student-1',
    studentName: studentName || 'Aarav Sharma',
    studentEmail: studentEmail || 'student@campus360.edu',
    rollNumber: rollNumber || '2023CSE042',
    department: department || 'Computer Science & Engineering',
    year: year || 3,
    phone: phone || '+91 98765 43210',
    registeredAt: new Date().toISOString(),
    status: 'Registered',
  };

  const saved = db.addRegistration(newRegistration);

  return res.status(201).json({
    message: `Successfully registered for ${event.title}!`,
    registration: saved,
  });
});

// Head gets list of students who applied for an event
app.get('/api/events/:eventId/registrations', (req: Request, res: Response) => {
  const { eventId } = req.params;
  const event = db.findEventById(eventId);

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const registrations = db.getRegistrationsByEvent(eventId);
  return res.json({
    event,
    totalApplicants: registrations.length,
    students: registrations,
  });
});

// Head or Admin updates registration status (Shortlisted, Selected, Attended)
app.patch('/api/events/:eventId/registrations/:regId', (req: Request, res: Response) => {
  const { regId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const updated = db.updateRegistrationStatus(regId, status);
  if (!updated) {
    return res.status(404).json({ error: 'Registration record not found' });
  }

  return res.json({ message: 'Status updated successfully', registration: updated });
});

// Get registrations for a specific student
app.get('/api/events/my-registrations/:studentId', (req: Request, res: Response) => {
  const { studentId } = req.params;
  const registrations = db.getRegistrationsByStudent(studentId);

  const enriched = registrations.map((r) => {
    const event = db.findEventById(r.eventId);
    return {
      ...r,
      event,
    };
  });

  return res.json(enriched);
});

// ==========================================
// 4. SOCIAL MEDIA & COMMUNITY FEED
// ==========================================

app.get('/api/social/posts', (req: Request, res: Response) => {
  const posts = db.getSocialPosts();
  return res.json(posts);
});

app.post('/api/social/posts', (req: Request, res: Response) => {
  const { authorName, authorRole, authorOrg, content, tag, imageUrl } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Post content cannot be empty' });
  }

  const newPost: SocialPost = {
    id: `sp-${Date.now().toString(36)}`,
    authorName: authorName || 'Campus User',
    authorRole: authorRole || 'STUDENT',
    authorOrg: authorOrg || 'Student Community',
    content,
    tag: tag || 'General',
    imageUrl,
    likes: 0,
    commentsCount: 0,
    createdAt: new Date().toISOString(),
  };

  db.addSocialPost(newPost);
  return res.status(201).json(newPost);
});

// ==========================================
// 5. OPPORTUNITIES
// ==========================================

app.get('/api/opportunities', (req: Request, res: Response) => {
  const opps = db.getOpportunities();
  return res.json(opps);
});

app.post('/api/opportunities', (req: Request, res: Response) => {
  const { title, organization, category, description, location, stipend, deadline } = req.body;

  if (!title || !organization || !description) {
    return res.status(400).json({ error: 'Title, organization, and description are required' });
  }

  const newOpp: OpportunityItem = {
    id: `opp-${Date.now().toString(36)}`,
    title,
    organization,
    category: category || 'Internship',
    description,
    location: location || 'Remote / Hybrid',
    stipend: stipend || 'Not Disclosed',
    deadline: deadline || '2026-12-31',
    applicantsCount: 0,
    createdAt: new Date().toISOString(),
  };

  db.addOpportunity(newOpp);
  return res.status(201).json(newOpp);
});

// Start Server
app.listen(port, () => {
  console.log(`[Campus360 Server] Running on http://localhost:${port}`);
  console.log(`[Campus360 Server] Multi-role Auth: Student, Super Admin, Head`);
});
