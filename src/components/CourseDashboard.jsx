'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  CheckCircle,
  Calendar,
  Video
} from 'lucide-react';
import { useCourseDetails, useCourseSessions } from '../hooks/useStudentAPI';

const CourseDashboard = ({ courseId }) => {
  const router = useRouter();
  const { course, loading: courseLoading, error: courseError } = useCourseDetails(courseId);
  const { sessions, loading: sessionsLoading, error: sessionsError } = useCourseSessions(courseId);
  const [activeTab, setActiveTab] = React.useState('upcoming');

  // Categorize sessions into upcoming and past
  const categorizedSessions = React.useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return { upcoming: [], past: [] };
    }

    const now = new Date();
    const upcoming = [];
    const past = [];

    sessions.forEach(session => {
      const startTime = new Date(session.start_time || session.StartTime);
      const endTime = (session.end_time || session.EndTime)
        ? new Date(session.end_time || session.EndTime)
        : (startTime && !isNaN(startTime.getTime()) ? new Date(startTime.getTime() + (session.duration || session.Duration || 60) * 60000) : null);
      const rawStatus = (session.status || session.Status || '').toLowerCase();
      
      const isPast = rawStatus === 'completed' || rawStatus === 'cancelled' || (endTime && !isNaN(endTime.getTime()) && endTime <= now && rawStatus !== 'ongoing' && rawStatus !== 'live');

      if (!isPast) {
        upcoming.push(session);
      } else {
        past.push(session);
      }
    });

    // Sort upcoming by start time (earliest first)
    upcoming.sort((a, b) => {
      const dateA = new Date(a.start_time || a.StartTime);
      const dateB = new Date(b.start_time || b.StartTime);
      return dateA - dateB;
    });

    // Sort past by start time (most recent first)
    past.sort((a, b) => {
      const dateA = new Date(a.start_time || a.StartTime);
      const dateB = new Date(b.start_time || b.StartTime);
      return dateB - dateA;
    });

    return { upcoming, past };
  }, [sessions]);

  // Real session metrics (no mock data)
  const totalSessions = sessions?.length || 0;
  const completedSessions = categorizedSessions.past.length;
  const upcomingSessions = categorizedSessions.upcoming.length;
  const progressPercent = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  // Show loading state
  if (courseLoading || sessionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (courseError || sessionsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading course:</p>
          <p className="text-gray-600">{courseError || sessionsError}</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Course not found</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-start ">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {course.Name || course.name}
            </h1>
            <p className="text-gray-600">
              {course.Code || course.code} • Instructor: {course.TeacherName || course.teacher_name || 'TBA'}
            </p>
          </div>
        </div>

        {/* Course Header Card */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <BookOpen size={24} />
              </div>
              <div>
                <p className="text-sm opacity-90">Credits</p>
                <p className="text-2xl font-bold">{course.Credits || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Video size={24} />
              </div>
              <div>
                <p className="text-sm opacity-90">Total Sessions</p>
                <p className="text-2xl font-bold">{totalSessions}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-sm opacity-90">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingSessions}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-sm opacity-90">Completed</p>
                <p className="text-2xl font-bold">{completedSessions}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Description */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About This Course</h2>
              <p className="text-gray-600 leading-relaxed">
                {course.Description || course.description || 'No description available for this course.'}
              </p>
            </div>

            {/* Sessions List */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Course Sessions</h2>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`flex-1 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                    activeTab === 'upcoming'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Upcoming ({categorizedSessions.upcoming.length})
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={`flex-1 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                    activeTab === 'past'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Past ({categorizedSessions.past.length})
                </button>
              </div>

              {/* Sessions Display */}
              {activeTab === 'upcoming' ? (
                categorizedSessions.upcoming.length > 0 ? (
                  <div className="space-y-3">
                    {categorizedSessions.upcoming.map((session, index) => {

                      const startTime = new Date(session.StartTime || session.start_time);
                      const endTime = (session.EndTime || session.end_time)
                        ? new Date(session.EndTime || session.end_time)
                        : (startTime && !isNaN(startTime.getTime()) ? new Date(startTime.getTime() + (session.Duration || session.duration || 60) * 60000) : null);
                      const rawStatus = (session.Status || session.status || '').toLowerCase();
                      const isActive = rawStatus === 'live' || rawStatus === 'ongoing' || (rawStatus === 'active' && (!isNaN(startTime.getTime()) && startTime <= new Date()) && (!endTime || isNaN(endTime.getTime()) || new Date() <= endTime));
                      const sessionId = session.ID || session.id;
                      
                      return (
                        <div 
                          key={sessionId || index}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${isActive ? 'bg-green-100' : 'bg-blue-100'}`}>
                              <Video size={20} className={isActive ? 'text-green-600' : 'text-blue-600'} />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {session.Title || session.title || `Session ${index + 1}`}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {new Date(session.StartTime || session.start_time).toLocaleDateString()} • {session.Duration || session.duration || '60'} min
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {isActive ? (
                              <>
                                <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                                  <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                                  Live Now
                                </span>
                                <button
                                  onClick={() => router.push(`/dashboard/session/${sessionId}`)}
                                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
                                >
                                  <Video size={16} />
                                  Join Session
                                </button>
                              </>
                            ) : (
                              <span className="text-blue-600 text-sm font-medium">Scheduled</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Video size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-600">No upcoming sessions</p>
                  </div>
                )
              ) : (
                categorizedSessions.past.length > 0 ? (
                  <div className="space-y-3">
                    {categorizedSessions.past.map((session, index) => {
                      const sessionId = session.ID || session.id;
                      
                      return (
                        <div 
                          key={sessionId || index}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl opacity-75"
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-gray-100 p-3 rounded-lg">
                              <Video size={20} className="text-gray-400" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-700">
                                {session.Title || session.title || `Session ${index + 1}`}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {new Date(session.StartTime || session.start_time).toLocaleDateString()} • {session.Duration || session.duration || '60'} min
                              </p>
                            </div>
                          </div>
                          <span className="text-gray-400 text-sm font-medium">Completed</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Video size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-600">No past sessions</p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Course Completion</span>
                    <span className="text-sm font-bold text-blue-600">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-sm text-gray-600">Completed Sessions</p>
                    <p className="text-xl font-bold text-gray-900">{completedSessions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Remaining Sessions</p>
                    <p className="text-xl font-bold text-gray-900">{upcomingSessions}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructor Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Instructor</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {(course.TeacherName || course.teacher_name || 'T').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {course.TeacherName || course.teacher_name || 'TBA'}
                  </p>
                  <p className="text-sm text-gray-600">Course Instructor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDashboard;
