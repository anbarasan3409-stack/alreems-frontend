import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { studentService } from '@/services/apiService';

/**
 * useStudyTracker hook
 * Periodically logs study time to the backend while the user is on a learning page.
 * 
 * @param {boolean} isActive - Whether the user is actively studying (e.g. video playing, tab focused)
 * @param {number} intervalMinutes - How often to ping the backend (default: 5 minutes)
 */
export const useStudyTracker = (isActive = true, intervalMinutes = 5) => {
  const { user, isAuthenticated } = useAuth();
  const timerRef = useRef(null);

  useEffect(() => {
    // Only track if authenticated, user exists, and they are actively studying
    if (!isAuthenticated || !user?.ID || !isActive) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const logTime = async () => {
      try {
        await studentService.logStudyTime(user.ID, intervalMinutes);
      } catch (error) {
        console.error('Failed to log study time:', error);
      }
    };

    // Set up the interval
    timerRef.current = setInterval(() => {
      logTime();
    }, intervalMinutes * 60 * 1000); // Convert minutes to milliseconds

    // Cleanup interval on unmount or when dependencies change
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, intervalMinutes, user, isAuthenticated]);
};
