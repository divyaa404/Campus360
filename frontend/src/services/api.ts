// Campus360 Central API Client

export type UserRole = 'STUDENT' | 'SUPER_ADMIN' | 'HEAD';

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

const API_BASE = '/api';

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
    return request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
  },

  changePassword: async (params: { userId?: string; email?: string; newPassword: string; confirmPassword?: string }) => {
    return request<{ message: string; user: User }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Super Admin
  generateHead: async (data: {
    name: string;
    email?: string;
    organization: string;
    headTitle?: string;
    password?: string;
  }) => {
    return request<{
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
  },

  getHeads: async () => {
    return request<HeadAccount[]>('/admin/heads');
  },

  resetHeadPassword: async (headId: string, newPassword?: string) => {
    return request<{ message: string; temporaryPassword: string; email: string }>('/admin/reset-head-password', {
      method: 'POST',
      body: JSON.stringify({ headId, newPassword }),
    });
  },

  getAdminOverview: async () => {
    return request<{
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
  },

  // Events
  getEvents: async () => {
    return request<EventItem[]>('/events');
  },

  postEvent: async (eventData: Partial<EventItem> & { headId?: string }) => {
    return request<{ message: string; event: EventItem }>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
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
    return request<{ message: string; registration: EventRegistration }>(`/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  },

  getEventRegistrations: async (eventId: string) => {
    return request<{
      event: EventItem;
      totalApplicants: number;
      students: EventRegistration[];
    }>(`/events/${eventId}/registrations`);
  },

  updateRegistrationStatus: async (eventId: string, regId: string, status: EventRegistration['status']) => {
    return request<{ message: string; registration: EventRegistration }>(
      `/events/${eventId}/registrations/${regId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
  },

  getMyRegistrations: async (studentId: string) => {
    return request<(EventRegistration & { event?: EventItem })[]>(`/events/my-registrations/${studentId}`);
  },

  // Social / Community Posts
  getSocialPosts: async () => {
    return request<SocialPost[]>('/social/posts');
  },

  createSocialPost: async (postData: {
    authorName: string;
    authorRole: UserRole;
    authorOrg: string;
    content: string;
    tag?: string;
    imageUrl?: string;
  }) => {
    return request<SocialPost>('/social/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  // Opportunities
  getOpportunities: async () => {
    return request<OpportunityItem[]>('/opportunities');
  },
};
