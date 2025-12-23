import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    biometricEnabled,
    loading,
    error,
    login,
    register,
    logout,
    loadStoredAuth,
    setBiometric,
    authenticateWithBiometric,
    clearError,
  } = useAuthStore();

  useEffect(() => {
    loadStoredAuth();
  }, []);

  return {
    user,
    token,
    isAuthenticated,
    biometricEnabled,
    loading,
    error,
    login,
    register,
    logout,
    setBiometric,
    authenticateWithBiometric,
    clearError,
  };
}
