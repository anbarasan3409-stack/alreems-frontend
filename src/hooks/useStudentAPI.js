import { useState, useEffect, useCallback } from 'react';
import { studentService, courseService, sessionService, authService, attendanceService, materialService, assignmentService } from '../services/apiService.jsx';

// Hook for student profile management
export const useStudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.getStudentProfile();
      setProfile(data);
      return data;
    } catch (err) {
      setError(err.error || 'Failed to fetch profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile().catch(err => {
      console.error('Error loading student profile:', err);
    });
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    refetch: fetchProfile
  };
};

// Hook for course details (for course dashboard)
export const useCourseDetails = (courseId) => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourseDetails = useCallback(async () => {
    if (!courseId) return;
    
    setLoading(true);
    setError(null);
    try {
      const courseData = await courseService.getCourseById(courseId);
      setCourse(courseData);
      return courseData;
    } catch (err) {
      setError(err.error || 'Failed to fetch course details');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId, fetchCourseDetails]);

  return {
    course,
    loading,
    error,
    fetchCourseDetails,
    refetch: fetchCourseDetails
  };
};

// Hook for course sessions
export const useCourseSessions = (courseId) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourseSessions = useCallback(async () => {
    if (!courseId) return;
    
    setLoading(true);
    setError(null);
    try {
      const sessionsData = await courseService.getCourseSessions(courseId);
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      return sessionsData;
    } catch (err) {
      setError(err.error || 'Failed to fetch course sessions');
      console.error('Error fetching course sessions:', err);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      fetchCourseSessions();
    }
  }, [courseId, fetchCourseSessions]);

  return {
    sessions,
    loading,
    error,
    fetchCourseSessions,
    refetch: fetchCourseSessions
  };
};

// Hook for enrolled courses management  
export const useEnrolledCourses = (studentId) => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEnrolledCourses = useCallback(async () => {
    if (!studentId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await studentService.getEnrolledCourses(studentId);
      // Ensure we always have an array, even if API returns null
      const courses = Array.isArray(data) ? data : [];
      setEnrolledCourses(courses);
      return courses;
    } catch (err) {
      setError(err.error || 'Failed to fetch enrolled courses');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  const registerForCourse = useCallback(async (courseData) => {
    setError(null);
    try {
      const data = await studentService.registerForCourse(studentId, courseData);
      // Refresh the enrolled courses list
      await fetchEnrolledCourses();
      return data;
    } catch (err) {
      setError(err.error || 'Failed to enroll in course');
      throw err;
    }
  }, [studentId, fetchEnrolledCourses]);

  useEffect(() => {
    if (studentId) {
      fetchEnrolledCourses();
    }
  }, [studentId, fetchEnrolledCourses]);

  return {
    enrolledCourses,
    loading,
    error,
    fetchEnrolledCourses,
    registerForCourse,
    refetch: fetchEnrolledCourses
  };
};

// Hook for available courses management
export const useAvailableCourses = (studentId) => {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAvailableCourses = useCallback(async () => {
    if (!studentId) {
      setAvailableCourses([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await courseService.getAvailableCoursesForEnrollment(studentId);
      // Ensure we always have an array, even if API returns null
      const courses = Array.isArray(data) ? data : [];
      setAvailableCourses(courses);
      return courses;
    } catch (err) {
      console.error('useAvailableCourses: Error fetching courses:', err);
      setError(err.error || 'Failed to fetch available courses');
      setAvailableCourses([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      fetchAvailableCourses();
    } else {
      setAvailableCourses([]);
    }
  }, [studentId, fetchAvailableCourses]);

  return {
    availableCourses,
    loading,
    error,
    fetchAvailableCourses,
    refetch: fetchAvailableCourses
  };
};

// Hook for all courses management
export const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await courseService.getAllCourses();
      // Ensure we always have an array, even if API returns null
      const courses = Array.isArray(data) ? data : [];
      setCourses(courses);
      return courses;
    } catch (err) {
      setError(err.error || 'Failed to fetch courses');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllCourses();
  }, [fetchAllCourses]);

  return {
    courses,
    loading,
    error,
    fetchAllCourses,
    refetch: fetchAllCourses
  };
};

// Hook for sessions
export const useSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sessionService.getAllSessions();
      // Ensure we always have an array, even if API returns null
      const sessions = Array.isArray(data) ? data : [];
      setSessions(sessions);
      return sessions;
    } catch (err) {
      setError(err.error || 'Failed to fetch sessions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLiveSessions = useCallback(async () => {
    setError(null);
    try {
      const data = await sessionService.getLiveSessions();
      // Ensure we always have an array, even if API returns null
      const sessions = Array.isArray(data) ? data : [];
      setLiveSessions(sessions);
      return sessions;
    } catch (err) {
      setError(err.error || 'Failed to fetch live sessions');
      throw err;
    }
  }, []);

  const fetchUpcomingSessions = useCallback(async () => {
    setError(null);
    try {
      const data = await sessionService.getUpcomingSessions();
      // Ensure we always have an array, even if API returns null
      const sessions = Array.isArray(data) ? data : [];
      setUpcomingSessions(sessions);
      return sessions;
    } catch (err) {
      setError(err.error || 'Failed to fetch upcoming sessions');
      throw err;
    }
  }, []);

  const joinLiveSession = useCallback(async (sessionId, studentId) => {
    setError(null);
    try {
      return await sessionService.joinLiveSession(sessionId, studentId);
    } catch (err) {
      setError(err.error || 'Failed to join session');
      throw err;
    }
  }, []);

  const checkSessionJoinable = useCallback(async (sessionId) => {
    setError(null);
    try {
      return await sessionService.isSessionJoinable(sessionId);
    } catch (err) {
      setError(err.error || 'Failed to check session status');
      throw err;
    }
  }, []);

  // Load sessions on mount and set up refresh interval
  useEffect(() => {
    const loadSessions = async () => {
      try {
        await Promise.all([
          fetchAllSessions(),
          fetchLiveSessions(),
          fetchUpcomingSessions()
        ]);
      } catch (error) {
        console.error('Failed to load sessions:', error);
      }
    };

    loadSessions();

    // Refresh live sessions every 30 seconds
    const interval = setInterval(() => {
      fetchLiveSessions().catch(console.error);
      fetchUpcomingSessions().catch(console.error);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchAllSessions, fetchLiveSessions, fetchUpcomingSessions]);

  return {
    sessions,
    liveSessions,
    upcomingSessions,
    loading,
    error,
    fetchAllSessions,
    fetchLiveSessions,
    fetchUpcomingSessions,
    joinLiveSession,
    checkSessionJoinable,
    refetch: fetchAllSessions
  };
};

// Hook for session streaming functionality
export const useSessionStreaming = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState(null);

  const joinSession = useCallback(async (sessionId, studentId) => {
    setError(null);
    try {
      setConnectionStatus('connecting');
      const sessionData = await sessionService.joinLiveSession(sessionId, studentId);
      setIsConnected(true);
      setConnectionStatus('connected');
      return sessionData;
    } catch (err) {
      setError(err.error || 'Failed to join session');
      setConnectionStatus('error');
      throw err;
    }
  }, []);

  const leaveSession = useCallback(() => {
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setError(null);
  }, []);

  return {
    isConnected,
    connectionStatus,
    error,
    joinSession,
    leaveSession,
    setConnectionStatus
  };
};

// Hook for student analytics
export const useStudentAnalytics = (studentId) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    if (!studentId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await studentService.getAnalytics(studentId);
      setAnalytics(data);
      return data;
    } catch (err) {
      setError(err.error || 'Failed to fetch analytics');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      fetchAnalytics();
    }
  }, [studentId, fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
    refetch: fetchAnalytics
  };
};

// Hook for student weekly activity
export const useStudentWeeklyActivity = (studentId) => {
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeeklyActivity = useCallback(async () => {
    if (!studentId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await studentService.getWeeklyActivity(studentId);
      const activity = Array.isArray(data) ? data : [];
      setWeeklyActivity(activity);
      return activity;
    } catch (err) {
      setError(err.error || 'Failed to fetch weekly activity');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      fetchWeeklyActivity();
    }
  }, [studentId, fetchWeeklyActivity]);

  return {
    weeklyActivity,
    loading,
    error,
    fetchWeeklyActivity,
    refetch: fetchWeeklyActivity
  };
};

// Hook for student subscriptions
export const useSubscriptions = (studentId) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubscriptions = useCallback(async () => {
    if (!studentId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await studentService.getSubscriptions(studentId);
      const subs = Array.isArray(data) ? data : [];
      setSubscriptions(subs);
      return subs;
    } catch (err) {
      setError(err.error || 'Failed to fetch subscriptions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  const subscribeToCourse = useCallback(async (courseId) => {
    setError(null);
    try {
      const data = await studentService.subscribeToCourse(studentId, courseId);
      // data.url contains the Stripe Checkout session URL
      if (data && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data?.error || 'No payment gateway URL received');
      }
      return data;
    } catch (err) {
      const errMsg = err?.error || err?.message || 'Failed to start subscription checkout';
      setError(errMsg);
      throw (err instanceof Error ? err : new Error(errMsg));
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      fetchSubscriptions();
    }
  }, [studentId, fetchSubscriptions]);

  return {
    subscriptions,
    loading,
    error,
    subscribeToCourse,
    fetchSubscriptions,
    refetch: fetchSubscriptions
  };
};

// Hook for student attendance
export const useStudentAttendance = (studentId) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAttendance = useCallback(async () => {
    if (!studentId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await attendanceService.getStudentAttendance(studentId);
      const att = Array.isArray(data) ? data : [];
      setAttendance(att);
      return att;
    } catch (err) {
      setError(err.error || 'Failed to fetch attendance');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      fetchAttendance();
    }
  }, [studentId, fetchAttendance]);

  return {
    attendance,
    loading,
    error,
    fetchAttendance,
    refetch: fetchAttendance
  };
};

// Hook for course materials
export const useCourseMaterials = (courseId) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMaterials = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await materialService.getMaterialsByCourse(courseId);
      setMaterials(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err.error || 'Failed to fetch materials');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      fetchMaterials();
    }
  }, [courseId, fetchMaterials]);

  return { materials, loading, error, fetchMaterials, refetch: fetchMaterials };
};

// Hook for course assignments
export const useCourseAssignments = (courseId) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAssignments = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await assignmentService.getAssignmentsByCourse(courseId);
      setAssignments(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err.error || 'Failed to fetch assignments');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      fetchAssignments();
    }
  }, [courseId, fetchAssignments]);

  const submitAssignment = useCallback(async (submissionData) => {
    try {
      return await assignmentService.submitAssignment(submissionData);
    } catch (err) {
      throw err;
    }
  }, []);

  return { assignments, loading, error, fetchAssignments, submitAssignment, refetch: fetchAssignments };
};

const studentAPIHooks = {
  useStudentProfile,
  useEnrolledCourses,
  useAvailableCourses,
  useCourses,
  useSessions,
  useSessionStreaming,
  useStudentAnalytics,
  useStudentWeeklyActivity,
  useSubscriptions,
  useStudentAttendance,
  useCourseMaterials,
  useCourseAssignments
};

export default studentAPIHooks;

