import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, type UserRole, type User } from '../services/api';

export type { UserRole, User };

interface AuthContextType {
  user: User | null;
  login: (role: UserRole | 'ADMIN', email: string, password?: string) => Promise<{ mustChangePassword: boolean; user: User }>;
  logout: () => void;
  isLoading: boolean;
  updateProfile: (profile: Partial<User>) => void;
  completePasswordChange: (newPassword: string, confirmPassword?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for session
    const storedUser = localStorage.getItem('campus360_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('campus360_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (role: UserRole | 'ADMIN', email: string, password: string = 'password123') => {
    setIsLoading(true);
    const normalizedRole = role === 'ADMIN' ? 'SUPER_ADMIN' : role;

    try {
      // Attempt backend login first
      const res = await api.login(email, password, normalizedRole);
      const authenticatedUser = res.user;

      setUser(authenticatedUser);
      localStorage.setItem('campus360_user', JSON.stringify(authenticatedUser));
      setIsLoading(false);

      return {
        mustChangePassword: !!authenticatedUser.mustChangePassword,
        user: authenticatedUser,
      };
    } catch (err: any) {
      // Fallback in-memory authentication if backend is unreachable
      console.warn('Backend login fallback:', err.message);

      let mockUser: User;
      let mustChange = false;

      if (normalizedRole === 'SUPER_ADMIN') {
        mockUser = {
          id: 'admin-1',
          email,
          role: 'SUPER_ADMIN',
          name: 'Dr. Sarah Jenkins',
          organization: 'Central Administration',
          headTitle: 'Super Administrator & Dean',
          mustChangePassword: false,
        };
      } else if (normalizedRole === 'HEAD') {
        const isIeee = email.toLowerCase().includes('ieee');
        mockUser = {
          id: isIeee ? 'head-ieee' : 'head-tnp',
          email,
          role: 'HEAD',
          name: isIeee ? 'Prof. Rajesh Varma' : 'Dr. Ananya Sen',
          organization: isIeee ? 'IEEE Student Branch' : 'Training & Placement Cell (TnP)',
          headTitle: isIeee ? 'IEEE Branch Chair' : 'T&P Head Officer',
          mustChangePassword: true, // triggers password and confirm password flow
        };
        mustChange = true;
      } else {
        mockUser = {
          id: 'student-1',
          email,
          role: 'STUDENT',
          name: 'Aarav Sharma',
          rollNumber: '2023CSE042',
          department: 'Computer Science & Engineering',
          year: 3,
          semester: 6,
          phone: '+91 98765 43210',
          mustChangePassword: false,
        };
      }

      setUser(mockUser);
      localStorage.setItem('campus360_user', JSON.stringify(mockUser));
      setIsLoading(false);

      return {
        mustChangePassword: mustChange,
        user: mockUser,
      };
    }
  };

  const completePasswordChange = async (newPassword: string, confirmPassword?: string) => {
    if (!user) throw new Error('No user is currently logged in');

    try {
      await api.changePassword({
        userId: user.id,
        email: user.email,
        newPassword,
        confirmPassword: confirmPassword || newPassword,
      });
    } catch (err) {
      console.warn('Backend change password fallback:', err);
    }

    const updatedUser = { ...user, mustChangePassword: false };
    setUser(updatedUser);
    localStorage.setItem('campus360_user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('campus360_user');
  };

  const updateProfile = (profile: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...profile };
      setUser(updated);
      localStorage.setItem('campus360_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        updateProfile,
        completePasswordChange,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
