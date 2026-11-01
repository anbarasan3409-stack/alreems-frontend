// API Configuration for Alreems Frontend
// This file contains all the API endpoints and configurations

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:9000';

// API Endpoints Configuration
export const API_ENDPOINTS = {
  // Authentication Routes
  AUTH: {
    GOOGLE_LOGIN: `${API_BASE_URL}/api/auth/google/login`,
    GOOGLE_CALLBACK: `${API_BASE_URL}/api/auth/google/callback`,
    REFRESH_TOKEN: `${API_BASE_URL}/api/auth/refresh`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  },

  // Student Authentication & Profile Routes
  STUDENT_AUTH: {
    PROFILE: `${API_BASE_URL}/api/student/profile`,
    REFRESH_TOKEN: `${API_BASE_URL}/api/student/auth/refresh`,
    LOGOUT: `${API_BASE_URL}/api/student/auth/logout`,
  },

  // Student Routes
  STUDENTS: {
    GET_BY_ID: (id) => `${API_BASE_URL}/api/students/${id}`,
    UPDATE_PROFILE: (id) => `${API_BASE_URL}/api/students/${id}`,
    REGISTER_FOR_COURSE: (id) => `${API_BASE_URL}/api/students/${id}/register`,
    GET_ENROLLED_COURSES: (id) => `${API_BASE_URL}/api/students/${id}/enrolled`,
    GET_ANALYTICS: (id) => `${API_BASE_URL}/api/students/${id}/analytics`,
    GET_ACTIVITY: (id) => `${API_BASE_URL}/api/students/${id}/activity`,
    LOG_STUDY_TIME: (id) => `${API_BASE_URL}/api/students/${id}/activity/log`,
    SUBSCRIBE: (id) => `${API_BASE_URL}/api/students/${id}/subscribe`,
    GET_SUBSCRIPTIONS: (id) => `${API_BASE_URL}/api/students/${id}/subscriptions`,
  },

  // Session Routes (Students can view sessions)
  SESSIONS: {
    GET_ALL: `${API_BASE_URL}/api/students/sessions`, // Use student endpoints
    GET_BY_ID: (id) => `${API_BASE_URL}/api/students/sessions/${id}`,
    GET_RTC_TOKEN: `${API_BASE_URL}/api/students/rtc-token`, // For joining video sessions
  },

  // Course Routes
  COURSES: {
    GET_ALL: `${API_BASE_URL}/api/students/courses`, // Use student endpoints for courses
    GET_BY_ID: (id) => `${API_BASE_URL}/api/students/courses/${id}`,
  },

  // Admin Routes (Protected)
  ADMIN: {
    GET_ALL_STUDENTS: `${API_BASE_URL}/api/admin/students`,
    GET_ALL_TEACHERS: `${API_BASE_URL}/api/admin/teachers`,
    GET_ANALYTICS: `${API_BASE_URL}/api/admin/analytics`,
    CREATE_COURSE: `${API_BASE_URL}/api/admin/courses`,
    EDIT_COURSE: (id) => `${API_BASE_URL}/api/admin/courses/${id}`,
    DELETE_COURSE: (id) => `${API_BASE_URL}/api/admin/courses/${id}`,
    GET_ALL_PAYMENTS: `${API_BASE_URL}/api/admin/payments`,
    GET_ALL_SUBSCRIPTIONS: `${API_BASE_URL}/api/admin/subscriptions`,
  },

  // Attendance Routes
  ATTENDANCE: {
    GET_STUDENT_ATTENDANCE: (studentId) => `${API_BASE_URL}/api/students/${studentId}/attendance`,
  },

  // Materials Routes
  MATERIALS: {
    GET_BY_COURSE: (courseId) => `${API_BASE_URL}/api/students/courses/${courseId}/materials`,
  },

  // Assignment Routes
  ASSIGNMENTS: {
    GET_BY_COURSE: (courseId) => `${API_BASE_URL}/api/students/courses/${courseId}/assignments`,
    SUBMIT: `${API_BASE_URL}/api/students/assignments/submit`,
  },

  // Enquiry Routes
  ENQUIRIES: {
    SUBMIT: `${API_BASE_URL}/api/enquiries`,
  },

  // Feedback Routes
  FEEDBACKS: {
    SUBMIT: `${API_BASE_URL}/api/feedbacks`,
    TESTIMONIALS: `${API_BASE_URL}/api/feedbacks/testimonials`,
  },
};

// API Request Configuration
export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for sending cookies with requests
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
};

// Common API Response Status
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Error Messages
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  VALIDATION_ERROR: 'Please check your input data.',
};

// Helper function to build full URLs
export const buildUrl = (baseUrl, params = {}) => {
  let url = baseUrl;
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });
  return url;
};

// Helper function to handle API responses
export const handleApiResponse = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  } else {
    throw new Error(response.data?.error || API_ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Helper function to handle API errors
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data?.error || error.message;

    switch (status) {
      case 401:
        return { error: API_ERROR_MESSAGES.UNAUTHORIZED, status };
      case 403:
        return { error: 'Access forbidden', status };
      case 404:
        return { error: 'Resource not found', status };
      case 500:
        return { error: error.response?.data?.error || API_ERROR_MESSAGES.SERVER_ERROR, status };
      default:
        return { error: message, status };
    }
  } else if (error.request) {
    // Network error
    return { error: API_ERROR_MESSAGES.NETWORK_ERROR, status: null };
  } else {
    // Other error
    return { error: error.message, status: null };
  }
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  API_CONFIG,
  HTTP_METHODS,
  API_STATUS,
  API_ERROR_MESSAGES,
  buildUrl,
  handleApiResponse,
  handleApiError,
};
