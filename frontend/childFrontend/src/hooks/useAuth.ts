import { useState, useEffect } from 'react';
import { authService, type UserData } from '../services/authService';

interface UseAuthReturn {
  isAuthenticated: boolean;
  user: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login({ email, password });
      if (response.success && response.user) {
        setUser(response.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return {
    isAuthenticated: !!user && user.status === 'ACTIVE',
    user,
    loading,
    login,
    logout
  };
};

