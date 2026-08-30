import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'STUDENT' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
  department?: string;
  year?: number;
  semester?: number;
  careerInterests?: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole, email: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  updateProfile: (profile: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for session
    const storedUser = localStorage.getItem('campus360_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (role: UserRole, email: string) => {
    setIsLoading(true);
    // Mock login logic - in real app, this would hit Express backend
    const mockUser: User = {
      id: role === 'ADMIN' ? 'admin-1' : 'student-1',
      email,
      role,
      name: role === 'ADMIN' ? 'Dr. Sarah Jenkins' : 'Aarav Sharma',
      department: role === 'STUDENT' ? 'Computer Science & Engineering' : undefined,
      year: role === 'STUDENT' ? 3 : undefined,
      semester: role === 'STUDENT' ? 6 : undefined,
    };
    
    setUser(mockUser);
    localStorage.setItem('campus360_user', JSON.stringify(mockUser));
    setIsLoading(false);
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
    <AuthContext.Provider value={{ user, login, logout, isLoading, updateProfile }}>
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
