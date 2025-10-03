import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/index.ts';
import { apiService } from '../utils/api.ts';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    address: string;
    phone: string;
    bank_name: string;
    bank_account_name: string;
    bank_account_number: string;
  }) => Promise<void>;
  logout: () => void;
  updateUserProfile: (data: { name: string; email: string; address: string; phone: string }) => Promise<void>;
  updateUserBanking: (data: { bank_name: string; bank_account_name: string; bank_account_number: string }) => Promise<void>;
  changeUserPassword: (data: { old_password: string; new_password: string }) => Promise<void>;
  deactivateAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && apiService.isAuthenticated();

  useEffect(() => {
    const initializeAuth = async () => {
      if (apiService.isAuthenticated()) {
        try {
          const userData = await apiService.getCurrentUser();
          setUser(userData);
        } catch {
          apiService.logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const tokens = await apiService.login({ email, password });
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
      
      const userData = await apiService.getCurrentUser();
      setUser(userData);
    } catch (error: unknown) {
      // Handle account deactivated error specifically
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status: number; data: { data?: { can_restore?: boolean } } } };
        if (axiosError.response?.status === 403) {
          const errorData = axiosError.response.data;
          if (errorData.data?.can_restore) {
            // This is a deactivated account error
            throw new Error('ACCOUNT_DEACTIVATED');
          }
        }
      }
      // Re-throw other errors
      throw error;
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    address: string;
    phone: string;
    bank_name: string;
    bank_account_name: string;
    bank_account_number: string;
  }) => {
    await apiService.register(data);
    // Auto-login after registration
    await login(data.email, data.password);
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };


  const updateUserProfile = async (data: { name: string; email: string; address: string; phone: string }) => {
    await apiService.updateUserProfile(data);
    // Fetch updated user data since the API doesn't return it
    const updatedUser = await apiService.getCurrentUser();
    setUser(updatedUser);
  };

  const updateUserBanking = async (data: { bank_name: string; bank_account_name: string; bank_account_number: string }) => {
    await apiService.updateUserBanking(data);
    // Fetch updated user data since the API doesn't return it
    const updatedUser = await apiService.getCurrentUser();
    setUser(updatedUser);
  };

  const changeUserPassword = async (data: { old_password: string; new_password: string }) => {
    await apiService.changeUserPassword(data);
    // Password change doesn't affect user data, so no need to refetch
  };

  const deactivateAccount = async () => {
    await apiService.deactivateUserAccount();
    // After deactivation, logout the user
    logout();
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUserProfile,
    updateUserBanking,
    changeUserPassword,
    deactivateAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export components and hooks
// eslint-disable-next-line react-refresh/only-export-components
export { AuthProvider, useAuth };
