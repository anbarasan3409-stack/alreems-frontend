

import axios from 'axios';
import { API_ENDPOINTS, API_CONFIG, handleApiResponse, handleApiError } from './apiConfig';
axios.defaults.withCredentials = true;


export const authService = {
  initiateGoogleLogin: async () => {
    try {
      window.location.href = API_ENDPOINTS.AUTH.GOOGLE_LOGIN;
    } catch (error) {
      console.error('Error initiating Google login:', error);
    }
  },
};


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
};

export default {
  authService,
  studentService,
  courseService,
  adminService,
};
