import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Play, 
  CheckCircle, 
  Calendar,
  Filter,
  Search,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { useStudentProfile, useEnrolledCourses, useAvailableCourses, useSubscriptions } from '../hooks/useStudentAPI.js';

const MyCourses = ({ searchQuery }) => {
  const router = useRouter();
  const { profile, loading: profileLoading } = useStudentProfile();
  const studentId = profile?.ID || profile?.id;
  const { enrolledCourses, loading: enrolledLoading, error: enrolledError } = useEnrolledCourses(studentId);
  const { availableCourses, loading: availableLoading, error: availableError, refetch: refetchAvailableCourses } = useAvailableCourses(studentId);
  const { subscriptions, subscribeToCourse, loading: subscriptionsLoading } = useSubscriptions(studentId);
  
  const [activeTab, setActiveTab] = useState('enrolled');
  const [filter, setFilter] = useState('all');
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);

  const handleEnrollCourse = async (courseId) => {
    if (!studentId) {
      alert('Please wait for your profile to load before enrolling.');
      return;
    }

    try {
      setEnrollingCourseId(courseId);
      // Initiate Stripe Subscription Checkout
      await subscribeToCourse(courseId);
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Failed to enroll: ' + (error.message || 'Unknown error'));
      setEnrollingCourseId(null);
    }
  };

  const handleContinueLearning = (courseId) => {
    router.push(`/dashboard/course/${courseId}`);
  };

  const filteredEnrolledCourses = (enrolledCourses || []).filter(course => 
    (course.Name || course.name || '').toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
    (course.Code || course.code || '').toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
    (course.TeacherName || course.teacher_name || course.teacherName || '').toLowerCase().includes(searchQuery?.toLowerCase() || '')
  );

  const filteredAvailableCourses = (availableCourses || []).filter(course => 
    (course.Name || course.name || '').toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
    (course.Code || course.code || '').toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
    (course.TeacherName || course.teacher_name || course.teacherName || '').toLowerCase().includes(searchQuery?.toLowerCase() || '')
  );


  if (profileLoading || enrolledLoading || availableLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-8">
        <main className="max-w-7xl mx-auto p-0 space-y-8 mt-2">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading courses...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state if there are errors
  if (enrolledError || availableError) {
    return (
      <div className="min-h-screen bg-gray-50 pb-8">
        <main className="max-w-7xl mx-auto p-0 space-y-8 mt-2">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-red-600 mb-2">Error loading courses:</p>
              <p className="text-gray-600">{enrolledError || availableError}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const CourseCard = ({ course, isEnrolled = false }) => (
    <div className="bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 group overflow-hidden">
      {/* Course Header with Gradient */}
      <div className="h-48 bg-gradient-to-br from-blue-600 to-purple-600 relative">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute bottom-4 left-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm">
              {course.Code || course.code || 'General'}
            </span>
            {isEnrolled && (
              <div className="bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                Enrolled
              </div>
            )}
          </div>
          <h3 className="text-xl font-bold mb-1">{course.Name || course.name}</h3>
          <div className="flex items-center text-sm opacity-90">
            <Clock size={14} className="mr-1" />
            <span>Self-paced</span>
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
            <BookOpen size={20} className="text-white" />
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.Description || course.description || 'Comprehensive course designed to enhance your skills and knowledge.'}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Users size={14} className="mr-1" />
            <span>Instructor: {course.TeacherName || course.teacher_name || 'TBA'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Star size={14} className="mr-1 fill-yellow-400 text-yellow-400" />
            <span>{course.rating || '4.5'}</span>
          </div>
        </div>

        {/* Course Code and Price */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">
            Code: {course.Code || course.code || 'N/A'}
          </span>
          {!isEnrolled && (
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              AED {course.Price || course.price || 0}
            </span>
          )}
        </div>

        {isEnrolled ? (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-bold text-blue-600">{course.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${course.progress || 0}%` }}
                ></div>
              </div>
            </div>
            <button 
              onClick={() => handleContinueLearning(course.ID || course.id)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Play size={16} />
              Continue Learning
            </button>
          </div>
        ) : (
          <button 
            onClick={() => handleEnrollCourse(course.ID || course.id)}
            disabled={profileLoading || !profile || !(profile?.ID || profile?.id) || enrollingCourseId === (course.ID || course.id)}
            className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              profileLoading || !profile || !(profile?.ID || profile?.id) || enrollingCourseId === (course.ID || course.id)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg hover:scale-105'
            }`}
          >
            {profileLoading ? (
              'Loading...'
            ) : enrollingCourseId === (course.ID || course.id) ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Redirecting to payment...</span>
              </>
            ) : (
              `Enroll - AED ${course.Price || course.price || 0} / month`
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <main className="max-w-7xl mx-auto p-0 space-y-8 mt-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
            <p className="text-gray-600">Manage your learning journey</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-600 p-3 rounded-xl">
                <BookOpen size={24} className="text-white" />
              </div>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{enrolledCourses?.length || 0}</p>
              <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
              <p className="text-xs text-emerald-600">+2 this month</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-green-600 p-3 rounded-xl">
                <CheckCircle size={24} className="text-white" />
              </div>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">
                {enrolledCourses?.filter(c => c.progress >= 100).length || 0}
              </p>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-xs text-emerald-600">+1 this week</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-purple-600 p-3 rounded-xl">
                <Clock size={24} className="text-white" />
              </div>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">
                {Math.round(enrolledCourses?.reduce((acc, c) => acc + (c.progress || 0), 0) / (enrolledCourses?.length || 1)) || 0}%
              </p>
              <p className="text-sm font-medium text-gray-600">Avg Progress</p>
              <p className="text-xs text-emerald-600">+5% this week</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-orange-600 p-3 rounded-xl">
                <Star size={24} className="text-white" />
              </div>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{availableCourses?.length || 0}</p>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-xs text-emerald-600">+3 new courses</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('enrolled')}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'enrolled' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My Courses ({enrolledCourses?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('available')}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'available' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Explore Courses ({availableCourses?.length || 0})
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Courses</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="not-started">Not Started</option>
                </select>
              </div>
            </div>
          </div>

          {/* Course Grid */}
          {activeTab === 'enrolled' ? (
            <div>
              {filteredEnrolledCourses.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No enrolled courses</h3>
                  <p className="text-gray-600 mb-6">Start your learning journey by enrolling in a course</p>
                  <button 
                    onClick={() => setActiveTab('available')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 mx-auto"
                  >
                    <BookOpen size={16} />
                    Browse Available Courses
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEnrolledCourses.map(course => (
                    <CourseCard key={course.id || course.ID} course={course} isEnrolled={true} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {filteredAvailableCourses.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                  <p className="text-gray-600">Try adjusting your search or check back later for new courses</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAvailableCourses.map(course => (
                    <CourseCard key={course.id || course.ID} course={course} isEnrolled={false} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyCourses;
