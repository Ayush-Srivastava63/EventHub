import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { getCurrentUser } from '../api/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // On mount, verify stored token by fetching current user
  useEffect(() => {
    async function verifyAuth() {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setToken(storedToken);
      } catch {
        // Token is invalid — clean up
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    verifyAuth();
  }, []);

  function login(newToken: string, newUser: User) {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }

  function updateUser(updatedUser: User) {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
    updateUser,
    isAdmin: user?.role === 'admin',
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
