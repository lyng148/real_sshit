import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '@/services/authService';

interface User {  
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    fullName: string;
    roles: string[];
    avatarUrl?: string;
  }
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<any>;
  logout: () => void;
  signup: (username: string, email: string, fullName: string, password: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);  const login = async (username: string, password: string) => {
    const response = await authService.login(username, password);
    setCurrentUser(response.data);
    return response;
  };
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const signup = async (username: string, email: string, fullName: string, password: string) => {
    return await authService.signup(username, email, fullName, password);
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    signup
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};