'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthCallbackContent() {
  const { clearLogoutState, checkAuthStatus } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        
        // Clear any logout state
        clearLogoutState();
        
        // Check for error parameters
        const error = searchParams.get('error');
        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setToastMsg(error);
          setTimeout(() => {
            router.push('/');
          }, 3000);
          return;
        }

        // The backend should have set cookies and redirected here
        // Check authentication status to verify the session

        
        // Wait a bit for cookies to be set
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check authentication status
        await checkAuthStatus();
        
        setStatus('success');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
        
      } catch (error) {
        console.error('Callback handling failed:', error);
        setStatus('error');
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    };

    handleCallback();
  }, [clearLogoutState, checkAuthStatus, router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Processing Authentication</h2>
            <p className="text-gray-600">Please wait while we sign you in...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Authentication Successful!</h2>
            <p className="text-gray-600">Redirecting to your dashboard...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Authentication Failed</h2>
            <p className="text-gray-600">{toastMsg || "Something went wrong."} Redirecting to home page...</p>
          </>
        )}
      </div>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-lg z-50 flex items-start gap-3 max-w-md animate-fade-in">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-red-800">Authentication Error</h3>
            <p className="mt-1 text-sm text-red-700">{toastMsg}</p>
          </div>
          <button onClick={() => setToastMsg(null)} className="ml-auto text-red-500 hover:text-red-700">
            &times;
          </button>
        </div>
      )}
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Loading...</h2>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
