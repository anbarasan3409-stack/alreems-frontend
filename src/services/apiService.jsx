// Example API service using the apiConfig
// This file demonstrates how to use the API configuration for making requests

import axios from 'axios';
import { API_ENDPOINTS, API_CONFIG, handleApiResponse, handleApiError } from '../api/apiConfig';

// Configure axios defaults
axios.defaults.withCredentials = true;

// Authentication Service
export const authService = {
  // Initiate Google OAuth login
  initiateGoogleLogin: async () => {
    try {
      window.location.href = API_ENDPOINTS.AUTH.GOOGLE_LOGIN;
    } catch (error) {
      console.error('Error initiating Google login:', error);
    }
  },

  // Get student profile
  getStudentProfile: async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.STUDENT_AUTH.PROFILE, API_CONFIG);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Refresh authentication token
  refreshToken: async () => {
    try {
      const response = await axios.post(API_ENDPOINTS.STUDENT_AUTH.REFRESH_TOKEN, {}, API_CONFIG);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Logout student
  logout: async () => {
    try {
      const response = await axios.post(API_ENDPOINTS.STUDENT_AUTH.LOGOUT, {}, API_CONFIG);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// Student Service
export const studentService = {
  // Get student by ID
  getStudentById: async (studentId) => {
    try {
      const response = await axios.get(
        API_ENDPOINTS.STUDENTS.GET_BY_ID(studentId),
        API_CONFIG
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update student profile
  updateStudentProfile: async (studentId, profileData) => {
    try {
      const response = await axios.put(
        API_ENDPOINTS.STUDENTS.UPDATE_PROFILE(studentId),
        profileData,
        API_CONFIG
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Register student for a course
  registerForCourse: async (studentId, courseData) => {
    try {
      const response = await axios.post(
        API_ENDPOINTS.STUDENTS.REGISTER_FOR_COURSE(studentId),
        courseData,
        API_CONFIG
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get enrolled courses for a student
  getEnrolledCourses: async (studentId) => {
    try {
      const response = await axios.get(
        API_ENDPOINTS.STUDENTS.GET_ENROLLED_COURSES(studentId),
        API_CONFIG
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get student analytics
  getAnalytics: async (studentId) => {
    try {
      const response = await axios.get(
        API_ENDPOINTS.STUDENTS.GET_ANALYTICS(studentId),
        API_CONFIG
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get student weekly activity
  getWeeklyActivity: async (studentId) => {
    try {
      const response = await axios.get(
        API_ENDPOINTS.STUDENTS.GET_ACTIVITY(studentId),
        API_CONFIG
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Log study time for a student
  logStudyTime: async (studentId, minutes) => {
    try {
      const response = await axios.post(
        API_ENDPOINTS.STUDENTS.LOG_STUDY_TIME(studentId),
        { minutes },
        API_CONFIG
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Subscribe to a course via Stripe Checkout
  subscribeToCourse: async (studentId, courseId) => {
    try {
      const response = await axios.post(
        API_ENDPOINTS.STUDENTS.SUBSCRIBE(studentId),
        { course_id: courseId },
        API_CONFIG
      );
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get active subscriptions for a student
  getSubscriptions: async (studentId) => {
    try {
      const response = await axios.get(
        API_ENDPOINTS.STUDENTS.GET_SUBSCRIPTIONS(studentId),
        API_CONFIG
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get all available sessions (for student to view)
  getAllSessions: async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.SESSIONS.GET_ALL, API_CONFIG);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get session by ID (for student to view details)
  getSessionById: async (sessionId) => {
    try {
      const response = await axios.get(
        API_ENDPOINTS.SESSIONS.GET_BY_ID(sessionId),
        API_CONFIG
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get RTC token for joining a live session
  getRTCToken: async (channelName, uid, role = 'student') => {
    try {
      const params = new URLSearchParams({
        channelName,
        uid: uid.toString(),
        role
      });
      
      const response = await axios.get(
        `${API_ENDPOINTS.SESSIONS.GET_RTC_TOKEN}?${params.toString()}`,
        API_CONFIG
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Join a live session (returns token and session info)
  joinLiveSession: async (sessionId, studentId) => {
    try {
      // First get session details
      const sessionResponse = await axios.get(
        API_ENDPOINTS.SESSIONS.GET_BY_ID(sessionId),
        API_CONFIG
      );
      const session = handleApiResponse(sessionResponse);

      // Then get RTC token for the session
      const tokenResponse = await studentService.getRTCToken(
        session.channel_name,
        studentId,
        'student'
      );

      return {
        session,
        token: tokenResponse.token,
        channelName: session.channel_name,
        appId: tokenResponse.appId,
        uid: studentId
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Course Service
export const courseService = {
  // Get all courses
  getAllCourses: async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.COURSES.GET_ALL, API_CONFIG);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get course by ID
  getCourseById: async (courseId) => {
    try {
      const response = await axios.get(
        API_ENDPOINTS.COURSES.GET_BY_ID(courseId),
        API_CONFIG
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get sessions for a specific course
  getCourseSessions: async (courseId) => {
    try {
      const response = await axios.get(API_ENDPOINTS.SESSIONS.GET_ALL, API_CONFIG);
      const allSessions = handleApiResponse(response);
      
      // Filter sessions by course ID
      const courseSessions = allSessions.filter(session => 
        session.course_id === parseInt(courseId)
      );
      
      return courseSessions;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get available courses for enrollment (courses student is not enrolled in)
  getAvailableCoursesForEnrollment: async (studentId) => {
    try {
      
      // Get all courses
      const allCoursesResponse = await axios.get(API_ENDPOINTS.COURSES.GET_ALL, API_CONFIG);
      const allCourses = handleApiResponse(allCoursesResponse);

      // Get enrolled courses
      const enrolledCoursesResponse = await axios.get(
        API_ENDPOINTS.STUDENTS.GET_ENROLLED_COURSES(studentId),
        API_CONFIG
      );
      const enrolledCourses = handleApiResponse(enrolledCoursesResponse);

      // Ensure both are arrays before processing
      const coursesArray = Array.isArray(allCourses) ? allCourses : [];
      const enrolledArray = Array.isArray(enrolledCourses) ? enrolledCourses : [];

      // Filter out enrolled courses - handle both id and ID (case sensitivity)
      const enrolledCourseIds = enrolledArray.map(course => course.ID || course.id);
      
      const availableCourses = coursesArray.filter(course => 
        !enrolledCourseIds.includes(course.ID || course.id)
      );

      return availableCourses;
    } catch (error) {
      console.error('getAvailableCoursesForEnrollment: Error:', error);
      return handleApiError(error);
    }
  },
};

// Admin Service (Protected routes)
export const adminService = {
  // Get all students (Admin only)
  getAllStudents: async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.ADMIN.GET_ALL_STUDENTS, API_CONFIG);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get all teachers (Admin only)
  getAllTeachers: async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.ADMIN.GET_ALL_TEACHERS, API_CONFIG);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get analytics (Admin only)
  getAnalytics: async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.ADMIN.GET_ANALYTICS, API_CONFIG);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create new course (Admin only)
  createCourse: async (courseData) => {
    try {
      const response = await axios.post(
        API_ENDPOINTS.ADMIN.CREATE_COURSE,
        courseData,
        API_CONFIG
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Edit course (Admin only)
  editCourse: async (courseId, courseData) => {
    try {
      const response = await axios.put(
        API_ENDPOINTS.ADMIN.EDIT_COURSE(courseId),
        courseData,
        API_CONFIG
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete course (Admin only)
  deleteCourse: async (courseId) => {
    try {
      const response = await axios.delete(
        API_ENDPOINTS.ADMIN.DELETE_COURSE(courseId),
        API_CONFIG
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get all payments (Admin only)
  getAllPayments: async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.ADMIN.GET_ALL_PAYMENTS, API_CONFIG);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get all subscriptions (Admin only)
  getAllSubscriptions: async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.ADMIN.GET_ALL_SUBSCRIPTIONS, API_CONFIG);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Session Service (for students)
export const sessionService = {
  // Get all sessions available to students
  getAllSessions: async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.SESSIONS.GET_ALL, API_CONFIG);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get session by ID
  getSessionById: async (sessionId) => {
    try {
      const response = await axios.get(
        API_ENDPOINTS.SESSIONS.GET_BY_ID(sessionId),
        API_CONFIG
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get live sessions (sessions that are currently happening based on time)
  getLiveSessions: async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.SESSIONS.GET_ALL, API_CONFIG);
      const allSessions = handleApiResponse(response);
      
      const now = new Date();
      
      // Filter sessions that are currently live (started but not ended)
      const liveSessions = allSessions.filter(session => {
        const startTime = new Date(session.start_time);
        const endTime = new Date(session.end_time);
        
        return session.status === 'active' && 
               now >= startTime && 
               now <= endTime;
      });
      
      return liveSessions;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get upcoming sessions (sessions that haven't started yet)
  getUpcomingSessions: async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.SESSIONS.GET_ALL, API_CONFIG);
      const allSessions = handleApiResponse(response);
      
      const now = new Date();
      
      // Filter sessions that are upcoming (haven't started yet)
      const upcomingSessions = allSessions.filter(session => {
        const startTime = new Date(session.start_time);
        
        return session.status === 'active' && 
               now < startTime;
      });
      
      return upcomingSessions;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get sessions by course ID
  getSessionsByCourse: async (courseId) => {
    try {
      const response = await axios.get(API_ENDPOINTS.SESSIONS.GET_ALL, API_CONFIG);
      const allSessions = handleApiResponse(response);
      
      // Filter sessions by course ID
      const courseSessions = allSessions.filter(session => 
        session.course_id === parseInt(courseId)
      );
      
      return courseSessions;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get sessions by teacher ID
  getSessionsByTeacher: async (teacherId) => {
    try {
      const response = await axios.get(API_ENDPOINTS.SESSIONS.GET_ALL, API_CONFIG);
      const allSessions = handleApiResponse(response);
      
      // Filter sessions by teacher ID
      const teacherSessions = allSessions.filter(session => 
        session.teacher_id === parseInt(teacherId)
      );
      
      return teacherSessions;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get RTC token for joining a session
  getRTCToken: async (channelName, uid, role = 'student') => {
    try {
      const params = new URLSearchParams({
        channelName,
        uid: uid.toString(),
        role
      });
      
      const response = await axios.get(
        `${API_ENDPOINTS.SESSIONS.GET_RTC_TOKEN}?${params.toString()}`,
        API_CONFIG
      );
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Join a live session (comprehensive function)
  joinLiveSession: async (sessionId, studentId) => {
    try {
      // Get session details
      const sessionResponse = await axios.get(
        API_ENDPOINTS.SESSIONS.GET_BY_ID(sessionId),
        API_CONFIG
      );
      const session = handleApiResponse(sessionResponse);

      // Check if session is currently live based on time
      const now = new Date();
      const startTime = new Date(session.start_time);
      const endTime = new Date(session.end_time);
      
      const isLive = session.status === 'active' && 
                     now >= startTime && 
                     now <= endTime;

      if (!isLive) {
        let errorMsg = 'Session is not currently available';
        if (now < startTime) {
          errorMsg = 'Session has not started yet';
        } else if (now > endTime) {
          errorMsg = 'Session has ended';
        } else if (session.status !== 'active') {
          errorMsg = 'Session is not active';
        }
        throw new Error(errorMsg);
      }

      // Get RTC token
      const tokenResponse = await sessionService.getRTCToken(
        session.channel_name,
        studentId,
        'student'
      );

      return {
        session,
        token: tokenResponse.token,
        channelName: session.channel_name,
        appId: tokenResponse.appId,
        uid: parseInt(studentId),
        role: 'student'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Check if session is joinable (currently live based on time)
  isSessionJoinable: async (sessionId) => {
    try {
      const session = await sessionService.getSessionById(sessionId);
      
      const now = new Date();
      const startTime = new Date(session.start_time);
      const endTime = new Date(session.end_time);
      
      const isLive = session.status === 'active' && 
                     now >= startTime && 
                     now <= endTime;
      
      let reason = null;
      if (!isLive) {
        if (now < startTime) {
          reason = 'Session has not started yet';
        } else if (now > endTime) {
          reason = 'Session has ended';
        } else if (session.status !== 'active') {
          reason = 'Session is not active';
        }
      }
      
      return {
        joinable: isLive,
        reason: reason,
        session
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Attendance Service
export const attendanceService = {
  getStudentAttendance: async (studentId) => {
    try {
      const response = await axios.get(API_ENDPOINTS.ATTENDANCE.GET_STUDENT_ATTENDANCE(studentId), API_CONFIG);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Material Service
export const materialService = {
  getMaterialsByCourse: async (courseId) => {
    try {
      const response = await axios.get(API_ENDPOINTS.MATERIALS.GET_BY_COURSE(courseId), API_CONFIG);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Assignment Service
export const assignmentService = {
  getAssignmentsByCourse: async (courseId) => {
    try {
      const response = await axios.get(API_ENDPOINTS.ASSIGNMENTS.GET_BY_COURSE(courseId), API_CONFIG);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },
  submitAssignment: async (submissionData) => {
    try {
      const response = await axios.post(API_ENDPOINTS.ASSIGNMENTS.SUBMIT, submissionData, API_CONFIG);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Enquiry Service
export const enquiryService = {
  submitEnquiry: async (enquiryData) => {
    try {
      const response = await axios.post(API_ENDPOINTS.ENQUIRIES.SUBMIT, enquiryData, API_CONFIG);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Feedback Service
export const feedbackService = {
  submitFeedback: async (feedbackData) => {
    try {
      const response = await axios.post(API_ENDPOINTS.FEEDBACKS.SUBMIT, feedbackData, API_CONFIG);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getTestimonials: async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.FEEDBACKS.TESTIMONIALS, API_CONFIG);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

export default {
  authService,
  studentService,
  courseService,
  sessionService,
  adminService,
  attendanceService,
  materialService,
  assignmentService,
  enquiryService,
  feedbackService,
};
