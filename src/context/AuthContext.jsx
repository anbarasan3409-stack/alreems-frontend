'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, studentService } from '../services/apiService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [justLoggedOut, setJustLoggedOut] = useState(() => {
    // Check localStorage for logout state on initialization
    if (typeof window !== 'undefined') {
      return localStorage.getItem('justLoggedOut') === 'true';
    }
    return false;
  });

  const checkAuthStatus = useCallback(async () => {
    try {

      setLoading(true);
      
      // Check if we're in the callback route - if so, clear logout flag
      if (typeof window !== 'undefined' && window.location.pathname === '/auth/callback') {

        setJustLoggedOut(false);
        localStorage.removeItem('justLoggedOut');
      }
      
      // If user just logged out and we're not in callback, don't check authentication
      if (justLoggedOut && typeof window !== 'undefined' && window.location.pathname !== '/auth/callback') {

        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      
      // Try to call the API directly without checking cookies first
      try {
        const userData = await authService.getStudentProfile();
        setUser(userData);
        setIsAuthenticated(true);
        setJustLoggedOut(false); // Reset logout flag on successful auth check
        localStorage.removeItem('justLoggedOut');
      } catch (apiError) {
        // If direct API call fails, check if we have a cookie
        const hasRefreshToken = document.cookie.includes('refresh_token');
        
        if (hasRefreshToken) {
          try {
            const refreshResult = await authService.refreshToken();
            if (refreshResult && refreshResult.student) {
              setUser(refreshResult.student);
              setIsAuthenticated(true);
              setJustLoggedOut(false);
              localStorage.removeItem('justLoggedOut');
            } else {
              throw new Error('Invalid refresh response');
            }
          } catch (refreshError) {
            setIsAuthenticated(false);
            setUser(null);
            // Clear invalid cookie
            document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('studentId');
    } finally {
      setLoading(false);
    }
  }, [justLoggedOut]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setJustLoggedOut(false);
      localStorage.removeItem('justLoggedOut');
      await authService.initiateGoogleLogin();
    } catch (error) {
      console.error('Google login failed:', error);
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setJustLoggedOut(true);
      
      // Set localStorage flag to persist logout state across page reloads
      localStorage.setItem('justLoggedOut', 'true');

      // Call logout endpoint to clear server-side session
      try {
        await authService.logout();
      } catch (logoutError) {
      }

      // Clear local state immediately
      setUser(null);
      setIsAuthenticated(false);

      // Clear cookies
      document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

      // Add a small delay to ensure server-side logout is processed
      await new Promise(resolve => setTimeout(resolve, 500));

      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, clear local state
      setUser(null);
      setIsAuthenticated(false);
      document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const response = await authService.refreshToken();

      if (response && response.student) {
        setUser(response.student);
        setIsAuthenticated(true);
        return true;
      } else {
        // Refresh failed, user needs to login again
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  }, []);

  const updateProfile = async (profileData) => {
    try {
      if (!user || !user.ID) {
        throw new Error('No authenticated user');
      }
      
      const response = await studentService.updateStudentProfile(user.ID, profileData);
      
      // The response contains the updated profile in response.profile
      if (response && response.profile) {
        setUser(response.profile);
        return response.profile;
      } else {
        // Fallback: refetch the profile from the server
        const freshProfile = await authService.getStudentProfile();
        setUser(freshProfile);
        return freshProfile;
      }
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    }
  };

  const getProfile = async () => {
    try {
      const userData = await authService.getStudentProfile();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Get profile failed:', error);
      throw error;
    }
  };

  const clearLogoutState = useCallback(() => {
    setJustLoggedOut(false);
    localStorage.removeItem('justLoggedOut');
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    justLoggedOut,
    loginWithGoogle,
    logout,
    checkAuthStatus,
    refreshToken,
    updateProfile,
    getProfile,
    clearLogoutState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
