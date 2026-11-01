import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudentProfile } from '../hooks/useStudentAPI.js';
import { authService } from '../services/apiService.jsx';

const StudentAuth = () => {
  const router = useRouter();
  const { profile, loading, fetchProfile } = useStudentProfile();
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is already authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchProfile().then((profileData) => {
        if (profileData) {
          router.push('/dashboard');
        }
      }).catch((error) => {
        console.error('Profile fetch failed:', error);
        localStorage.removeItem('token');
      });
    }
  }, [fetchProfile, router]);

  // Handle Google OAuth login
  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      setError(null);
      
      // Initiate Google OAuth login
      authService.initiateGoogleLogin();
      
    } catch (error) {
      console.error('Google login failed:', error);
      setError('Failed to initiate Google login. Please try again.');
      setAuthLoading(false);
    }
  };

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      setError('Authentication failed: ' + error);
      return;
    }

    if (code) {
      handleOAuthCallback(code);
    }
  }, []);

  const handleOAuthCallback = async (code) => {
    try {
      setAuthLoading(true);
      setError(null);

      // Exchange code for token
      const response = await authService.googleCallback(code);
      
      if (response.token) {
        // Store token
        localStorage.setItem('token', response.token);
        
        // Fetch profile and redirect
        const profileData = await fetchProfile();
        if (profileData) {
          router.push('/dashboard');
        }
      } else {
        throw new Error('No token received from authentication');
      }
      
    } catch (error) {
      console.error('OAuth callback failed:', error);
      setError('Authentication failed: ' + error.message);
      setAuthLoading(false);
    }
  };

  // Handle manual login (for testing)
  const handleManualLogin = async (email, password) => {
    try {
      setAuthLoading(true);
      setError(null);

      const response = await authService.login(email, password);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        const profileData = await fetchProfile();
        if (profileData) {
          router.push('/dashboard');
        }
      }
      
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed: ' + error.message);
      setAuthLoading(false);
    }
  };

  if (loading || profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-white">A</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Alreems Student Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access your courses and sessions
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <div>
            <button
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {authLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </div>
              )}
            </button>
          </div>

          {/* Manual Login Form (for development/testing) */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or for testing</span>
              </div>
            </div>

            <ManualLoginForm onLogin={handleManualLogin} loading={authLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Manual login form component
const ManualLoginForm = ({ onLogin, loading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email, password);
    }
  };

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email" className="sr-only">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
          placeholder="Email address"
        />
      </div>
      <div>
        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
          placeholder="Password"
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={loading || !email || !password}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sign in with Email
        </button>
      </div>
    </form>
  );
};

export default StudentAuth;
